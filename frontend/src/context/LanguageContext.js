import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { profileAPI } from '../services/apiService';
import { UserContext } from './UserContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const { user } = useContext(UserContext);

  useEffect(() => {
    const loadLanguageFromSupabase = async () => {
      try {
        // Load from Supabase profile if user is authenticated
        if (user && user.id) {
          try {
            const profile = await profileAPI.getProfile();
            if (profile && profile.language) {
              setLanguage(profile.language);
              i18n.changeLanguage(profile.language);
              console.log('✅ Language loaded from Supabase profile:', profile.language);
            } else {
              setLanguage('en');
              i18n.changeLanguage('en');
            }
          } catch (supabaseError) {
            console.warn('Failed to load language from Supabase profile:', supabaseError);
            setLanguage('en');
            i18n.changeLanguage('en');
          }
        } else {
          setLanguage('en');
          i18n.changeLanguage('en');
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
        setLanguage('en');
        i18n.changeLanguage('en');
      }
    };

    loadLanguageFromSupabase();
  }, [user]);

  const changeLanguage = async (langCode) => {
    i18n.changeLanguage(langCode);
    setLanguage(langCode);
    
    try {
      // Update Supabase profile if user is authenticated
      if (user && user.id) {
        try {
          await profileAPI.updateProfile({ language: langCode });
          console.log('✅ Language updated in Supabase profile:', langCode);
        } catch (supabaseError) {
          console.error('Failed to update Supabase profile:', supabaseError);
          throw new Error('Failed to save language preference. Please try again.');
        }
      } else {
        throw new Error('User not authenticated. Please log in.');
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);