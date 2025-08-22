import React, { createContext, useContext, useEffect, useState } from 'react';
import { profileAPI } from '../services/apiService';
import { UserContext } from './UserContext';

const ProfileSettingsContext = createContext();

export const ProfileSettingsProvider = ({ children }) => {
  const [profileSettings, setProfileSettings] = useState({
    theme: 'light',
  });
  const { user } = useContext(UserContext);

  useEffect(() => {
    const loadSettingsFromSupabase = async () => {
      try {
        // Load from Supabase profile if user is authenticated
        if (user && user.id) {
          try {
            const profile = await profileAPI.getProfile();
            if (profile && profile.theme) {
              setProfileSettings({ theme: profile.theme });
              console.log('✅ Theme loaded from Supabase profile:', profile.theme);
            } else {
              setProfileSettings({ theme: 'light' });
            }
          } catch (supabaseError) {
            console.warn('Failed to load profile settings from Supabase:', supabaseError);
            setProfileSettings({ theme: 'light' });
          }
        } else {
          setProfileSettings({ theme: 'light' });
        }
      } catch (error) {
        console.error('Failed to load profile settings:', error);
        setProfileSettings({ theme: 'light' });
      }
    };
    
    loadSettingsFromSupabase();
  }, [user]);

  const updateProfileSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...profileSettings, ...newSettings };
      setProfileSettings(updatedSettings);
      
      // Update Supabase profile if user is authenticated
      if (user && user.id) {
        try {
          await profileAPI.updateProfile(newSettings);
          console.log('✅ Profile settings updated in Supabase:', newSettings);
        } catch (supabaseError) {
          console.error('Failed to update Supabase profile:', supabaseError);
          throw new Error('Failed to save profile settings. Please try again.');
        }
      } else {
        throw new Error('User not authenticated. Please log in.');
      }
    } catch (error) {
      console.error('Failed to save profile settings:', error);
      throw error;
    }
  };

  return (
    <ProfileSettingsContext.Provider value={{ profileSettings, updateProfileSettings }}>
      {children}
    </ProfileSettingsContext.Provider>
  );
};

export const useProfileSettings = () => useContext(ProfileSettingsContext);
