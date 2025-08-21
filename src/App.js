import AppNavigator from './navigation/AppNavigator';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeProvider';
import { ProfileSettingsProvider } from './context/ProfileSettingsContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import i18n from './i18n.js';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>
          <ProfileSettingsProvider>
            <ThemeProvider>
              <UserProvider>
                <CurrencyProvider>
                  <AppNavigator />
                </CurrencyProvider> 
              </UserProvider>
            </ThemeProvider>
          </ProfileSettingsProvider>
          </I18nextProvider>  
      </LanguageProvider> 
    </AuthProvider> 
);
}
