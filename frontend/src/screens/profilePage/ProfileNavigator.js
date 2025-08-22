import { createStackNavigator } from "@react-navigation/stack";
import CurrencySettingsScreen from './CurrencySettingsScreen'
import EditProfileScreen from './EditProfileScreen'
import LanguageSettingsScreen from './LanguageSettingsScreen'
import NotificationSettingsScreen from './NotificationSettingsScreen'
import ProfileScreen from "./ProfileScreen";
import { ThemeSettingsScreen } from "./ThemeSettingsScreen";
import { useThemeColor } from "../../context/ThemeProvider";
import { useTranslation } from "react-i18next";

export default function ProfileNavigator(){
  const Stack = createStackNavigator();
  const theme = useThemeColor();
  const {t} = useTranslation();

  return(
    <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.primary, 
      },
      headerTintColor: theme.text, 
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerShown: false}}/>
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{title: t('EditProfile'),}}/>
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{title: t('NotificationSettings'),}}/>
      <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} options={{title: t('CurrencySettings'),}}/>
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{title: t('LanguageSettings'),}}/>
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{title: t('ThemeSettings'),}}/>
    </Stack.Navigator>
  )

}
