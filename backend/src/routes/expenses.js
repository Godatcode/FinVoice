const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUserId } = require('../middleware/auth');

// Get all expenses for authenticated user
router.get('/', authenticateUserId, async (req, res) => {
  try {
    const { userId } = req;
    
    console.log('🔄 Fetching expenses for user:', userId);
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching expenses:', error);
      return res.status(500).json({ 
        error: 'Database error while fetching expenses',
        details: error.message 
      });
    }
    
    console.log(`✅ Fetched ${expenses?.length || 0} expenses for user ${userId}`);
    res.json({ data: expenses || [] });
    
  } catch (error) {
    console.error('❌ Unexpected error in get expenses:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Create new expense
router.post('/', authenticateUserId, async (req, res) => {
  try {
    const { userId } = req;
    const { amount, description, category, voice_input, date } = req.body;
    
    console.log('🔄 Creating expense for user:', userId, { amount, description, category });
    
    // Validate required fields
    if (!amount || !description) {
      return res.status(400).json({ 
        error: 'Amount and description are required' 
      });
    }
    
    const expenseData = {
      user_id: userId,
      amount: parseFloat(amount),
      description,
      category: category || 'other',
      voice_input: voice_input || null,
      date: date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📤 Inserting expense data:', expenseData);
    
    const { data: newExpense, error: insertError } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting expense:', insertError);
      return res.status(500).json({ 
        error: 'Failed to create expense',
        details: insertError.message 
      });
    }
    
    console.log('✅ Expense created successfully:', newExpense);
    
    res.status(201).json({
      message: 'Expense created successfully',
      data: newExpense
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in create expense:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Update expense
router.put('/:id', authenticateUserId, async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔄 Updating expense:', id, 'for user:', userId, updates);
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    // First verify the expense belongs to the user
    const { data: existingExpense, error: checkError } = await supabase
      .from('expenses')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingExpense) {
      return res.status(404).json({ 
        error: 'Expense not found' 
      });
    }
    
    if (existingExpense.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Not authorized to update this expense' 
      });
    }
    
    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating expense:', error);
      return res.status(500).json({ 
        error: 'Database error while updating expense',
        details: error.message 
      });
    }
    
    console.log('✅ Expense updated successfully');
    res.json({ 
      message: 'Expense updated successfully',
      data: updatedExpense 
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in update expense:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Delete expense
router.delete('/:id', authenticateUserId, async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    
    console.log('🔄 Deleting expense:', id, 'for user:', userId);
    
    // First verify the expense belongs to the user
    const { data: existingExpense, error: checkError } = await supabase
      .from('expenses')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingExpense) {
      return res.status(404).json({ 
        error: 'Expense not found' 
      });
    }
    
    if (existingExpense.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Not authorized to delete this expense' 
      });
    }
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting expense:', error);
      return res.status(500).json({ 
        error: 'Database error while deleting expense',
        details: error.message 
      });
    }
    
    console.log('✅ Expense deleted successfully');
    res.json({ 
      message: 'Expense deleted successfully' 
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in delete expense:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
