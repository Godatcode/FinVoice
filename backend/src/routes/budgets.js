const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all budgets for user
router.get('/', async (req, res) => {
  try {
    // Get user ID from Authorization header (sent by frontend)
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'No user ID provided in authorization header' 
      });
    }
    
    console.log('🔄 Fetching budgets for user:', userId);
    
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching budgets:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch budgets',
        details: error.message 
      });
    }
    
    console.log('✅ Budgets fetched successfully:', budgets?.length || 0, 'items');
    res.json({ data: budgets || [] });
    
  } catch (error) {
    console.error('❌ Unexpected error in get budgets:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'No user ID provided in authorization header' 
      });
    }
    
    const budgetData = { ...req.body, user_id: userId };
    
    console.log('🔄 Creating budget:', budgetData);
    
    // Validate required fields
    if (!budgetData.month_year || !budgetData.total_amount || !budgetData.categories) {
      return res.status(400).json({ 
        error: 'Month/year, total amount, and categories are required' 
      });
    }
    
    // Try to insert new budget, but handle duplicate key constraint
    let { data: newBudget, error } = await supabase
      .from('budgets')
      .insert([budgetData])
      .select()
      .single();
    
    if (error) {
      // Check if it's a duplicate key constraint violation
      if (error.code === '23505') {
        console.log('⚠️ Budget already exists for this month, updating instead...');
        
        // Get the existing budget ID
        const { data: existingBudget, error: fetchError } = await supabase
          .from('budgets')
          .select('id')
          .eq('user_id', userId)
          .eq('month_year', budgetData.month_year)
          .single();
        
        if (fetchError) {
          console.error('❌ Error fetching existing budget:', fetchError);
          return res.status(500).json({ 
            error: 'Failed to handle existing budget',
            details: fetchError.message 
          });
        }
        
        // Update the existing budget
        const { data: updatedBudget, error: updateError } = await supabase
          .from('budgets')
          .update({
            total_amount: budgetData.total_amount,
            categories: budgetData.categories,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBudget.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Error updating existing budget:', updateError);
          return res.status(500).json({ 
            error: 'Failed to update existing budget',
            details: updateError.message 
          });
        }
        
        console.log('✅ Existing budget updated successfully:', updatedBudget);
        return res.status(200).json({ 
          data: updatedBudget,
          message: 'Budget updated successfully' 
        });
      }
      
      // Handle other errors
      console.error('❌ Error creating budget:', error);
      return res.status(500).json({ 
        error: 'Failed to create budget',
        details: error.message 
      });
    }
    
    console.log('✅ New budget created successfully:', newBudget);
    res.status(201).json({ data: newBudget });
    
  } catch (error) {
    console.error('❌ Unexpected error in create budget:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    const { id } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'No user ID provided in authorization header' 
      });
    }
    
    console.log('🔄 Updating budget:', id, updates);
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data: updatedBudget, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own budgets
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Budget not found or access denied' 
        });
      }
      console.error('❌ Error updating budget:', error);
      return res.status(500).json({ 
        error: 'Failed to update budget',
        details: error.message 
      });
    }
    
    console.log('✅ Budget updated successfully');
    res.json({ data: updatedBudget });
    
  } catch (error) {
    console.error('❌ Unexpected error in update budget:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'No user ID provided in authorization header' 
      });
    }
    
    console.log('🔄 Deleting budget:', id);
    
    const { data: deletedBudget, error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only delete their own budgets
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Budget not found or access denied' 
        });
      }
      console.error('❌ Error deleting budget:', error);
      return res.status(500).json({ 
        error: 'Failed to delete budget',
        details: error.message 
      });
    }
    
    console.log('✅ Budget deleted successfully');
    res.json({ 
      message: 'Budget deleted successfully',
      data: deletedBudget 
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in delete budget:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
