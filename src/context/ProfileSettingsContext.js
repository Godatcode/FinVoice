import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileSettingsContext = createContext();

export const ProfileSettingsProvider = ({ children }) => {
  const [profileSettings, setProfileSettings] = useState({
    theme: 'light',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('profileSettings');
        if (storedSettings) {
          setProfileSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load profile settings:', error);
      }
    };
    loadSettings();
  }, []);

  const updateProfileSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...profileSettings, ...newSettings };
      setProfileSettings(updatedSettings);
      await AsyncStorage.setItem('profileSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save profile settings:', error);
    }
  };

  return (
    <ProfileSettingsContext.Provider value={{ profileSettings, updateProfileSettings }}>
      {children}
    </ProfileSettingsContext.Provider>
  );
};

export const useProfileSettings = () => useContext(ProfileSettingsContext);
