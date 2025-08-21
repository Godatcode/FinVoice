import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useLanguage} from '../../context/LanguageContext';
import {useTranslation} from 'react-i18next';
import {useThemeColor} from '../../context/ThemeProvider';
import {Card} from '../../components/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LanguageSettings() {
  const {changeLanguage, language} = useLanguage();
  const {t} = useTranslation();
  const {background, text} = useThemeColor();

  const langs = [
    {code: 'en', labelKey: 'English', icon: 'web'},
    {code: 'hi', labelKey: 'हिन्दी', icon: 'translate'},
    {code: 'bn', labelKey: 'বাংলা', icon: 'translate'},
    {code: 'pa', labelKey: 'ਪੰਜਾਬੀ', icon: 'translate'},
    {code: 'or', labelKey: 'ଓଡ଼ିଆ', icon: 'translate'},
    {code: 'kn', labelKey: 'ಕನ್ನಡ', icon: 'translate'},
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, {backgroundColor: background}]}>
      <Text style={[styles.header, {color: text}]}>{t('changeLanguage')}</Text>

      <View style={styles.languageList}>
        {langs.map(lang => (
          <Card key={lang.code} style={styles.languageCard}>
            <TouchableOpacity
              onPress={() => changeLanguage(lang.code)}
              style={styles.languageOption}>
              <MaterialCommunityIcons
                name={lang.icon}
                size={24}
                color={text}
                style={styles.languageIcon}
              />
              <Text style={[styles.languageText, {color: text}]}>
                {t(lang.labelKey)}
              </Text>
              {language === lang.code && (
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={24}
                  color="#4CAF50"
                />
              )}
            </TouchableOpacity>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  languageList: {
    marginTop: 10,
  },

  languageCard: {
    marginVertical: 8,
  },

  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  languageIcon: {
    marginRight: 15,
  },

  languageText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
});