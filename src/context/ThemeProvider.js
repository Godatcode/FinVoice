import React, { createContext, useContext } from 'react';
import { useProfileSettings } from './ProfileSettingsContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { profileSettings } = useProfileSettings();
  const isDark = profileSettings.theme === 'dark';

  const theme = isDark
    ? {
      primary: '#6C5CE7',           
      secondary: '#A8A8A8',
      background: '#121212',        
      card: '#1E1E1E',              
      text: '#F5F6FA',              
      border: '#2C2C2C',            
      notification: '#FF7675',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#FF7675',
      }
    : {
        primary: '#6C5CE7',
        secondary: '#A8A8A8',
        background: '#F8F9FA',
        card: '#FFFFFF',
        text: '#2D3436',
        border: '#E9ECEF',
        notification: '#FF7675',
        success: '#00B894',
        warning: '#FDCB6E',
        error: '#FF7675',
      };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useThemeColor = () => {
  return useContext(ThemeContext);
};
