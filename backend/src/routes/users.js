const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Create new user profile
router.post('/create', async (req, res) => {
  try {
    const { name, phone, firebase_uid, language = 'en', currency = 'INR', theme = 'light' } = req.body;
    
    console.log('🔄 Creating user profile:', { name, phone, firebase_uid });
    
    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        error: 'Name and phone are required' 
      });
    }
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing user:', checkError);
      return res.status(500).json({ 
        error: 'Database error while checking existing user' 
      });
    }
    
    if (existingUser) {
      console.log('✅ User already exists, returning existing profile');
      
      // Get the full profile data
      const { data: fullProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (profileError) {
        console.error('❌ Error fetching existing profile:', profileError);
        return res.status(500).json({ 
          error: 'Database error while fetching existing profile' 
        });
      }
      
      console.log('✅ Existing profile fetched successfully:', fullProfile);
      return res.status(200).json({
        message: 'User already exists, returning existing profile',
        user: fullProfile
      });
    }
    
    // Create new profile
    const profileData = {
      firebase_uid,
      name,
      phone,
      language,
      currency,
      theme,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📤 Inserting profile data:', profileData);
    
    // For now, let's try without RLS policies - we'll add them later
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting profile:', insertError);
      return res.status(500).json({ 
        error: 'Failed to create user profile',
        details: insertError.message 
      });
    }
    
    console.log('✅ Profile created successfully:', newProfile);
    
    res.status(201).json({
      message: 'User profile created successfully',
      user: newProfile
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in create user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get user profile by ID
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🔄 Fetching profile for user:', userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'User profile not found' 
        });
      }
      console.error('❌ Error fetching profile:', error);
      return res.status(500).json({ 
        error: 'Database error while fetching profile' 
      });
    }
    
    console.log('✅ Profile fetched successfully');
    res.json({ profile });
    
  } catch (error) {
    console.error('❌ Unexpected error in get profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    console.log('🔄 Updating profile for user:', userId, updates);
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'User profile not found' 
        });
      }
      console.error('❌ Error updating profile:', error);
      return res.status(500).json({ 
        error: 'Database error while updating profile' 
      });
    }
    
    console.log('✅ Profile updated successfully');
    res.json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in update profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get user profile by phone number
router.get('/profile/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    console.log('🔄 Fetching profile by phone:', phone);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'User profile not found' 
        });
      }
      console.error('❌ Error fetching profile by phone:', error);
      return res.status(500).json({ 
        error: 'Database error while fetching profile' 
      });
    }
    
    console.log('✅ Profile fetched successfully by phone');
    res.json({ profile });
    
  } catch (error) {
    console.error('❌ Unexpected error in get profile by phone:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
