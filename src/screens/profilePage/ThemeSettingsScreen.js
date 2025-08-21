import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useThemeColor } from '../../context/ThemeProvider';
import { useProfileSettings } from '../../context/ProfileSettingsContext';
import { useTranslation } from 'react-i18next';

export function ThemeSettingsScreen() {
  const { profileSettings, updateProfileSettings } = useProfileSettings();
  const theme = useThemeColor();
  const {t} = useTranslation();

  const toggleTheme = () => {
    updateProfileSettings({
      theme: profileSettings.theme === 'light' ? 'dark' : 'light',
    });
  };

  return (
    <View style={[styles.mainConatiner , {backgroundColor: theme.background}]}>
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>{t('darkMode')}</Text>
      <Switch
        value={profileSettings.theme === 'dark'}
        onValueChange={toggleTheme}
        trackColor={{ false: '#ccc', true: theme.primary }}
        thumbColor={profileSettings.theme === 'dark' ? '#fff' : '#f4f3f4'}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainConatiner:{
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
});
