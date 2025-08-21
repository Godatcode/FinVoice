import React, { useState , useContext} from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Card } from '../../components/Card';
import { useThemeColor } from '../../context/ThemeProvider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from '../../context/UserContext';
import {useTranslation} from 'react-i18next'
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = ({ navigation}) => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { text,primary,background,card } = useThemeColor();
  const {logout} = useContext(AuthContext)

  const handleMenuPress = async (action) => {
    switch (action) {
      case 'logout':
        logout();
        navigation.navigate('Login');
        Alert.alert('Logged Out', 'You have been logged out.');
        break;
      case 'login':
        navigation.navigate('Login');
        break;
      case 'edit-profile':
        navigation.navigate('EditProfile');
        break;
      case 'notifications':
        navigation.navigate('NotificationSettings');
        break;
      case 'currency':
        navigation.navigate('CurrencySettings');
        break;
      case 'theme':
        navigation.navigate('ThemeSettings');

        break;
      case 'language':
        navigation.navigate('LanguageSettings');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container , { backgroundColor: background }]}>
        <View style={styles.header}>
          <Image
            source={{
              uri: 'https://static.vecteezy.com/system/resources/thumbnails/029/364/950/small_2x/3d-carton-of-boy-going-to-school-ai-photo.jpg',
            }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: text }]}>{user.name}</Text>
          <Text style={[styles.phone, { color: text }]}>{user.phone}</Text>
        </View>

        {isLoggedIn ? (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: text }]}>{t('accountSettings')}</Text>

              <Card style={styles.menuCard}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('edit-profile')}>
                  <MaterialCommunityIcons name="account-edit" size={24} color={primary} />
                  <Text style={[styles.menuText, { color: text }]}>{t('profileSettings')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={text} />
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: background }]} />

                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('notifications')}>
                  <MaterialCommunityIcons name="bell" size={24} color={primary} />
                  <Text style={[styles.menuText, { color: text }]}>{t('notifications')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={text} />
                </TouchableOpacity>
                
              </Card>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: text }]}>{t('preferences')}</Text>

              <Card style={styles.menuCard}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('currency')}>
                  <MaterialCommunityIcons name="currency-inr" size={24} color={primary} />
                  <Text style={[styles.menuText, { color: text }]}>{t('currency')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={text} />
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: background }]} />

                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('theme')}>
                  <MaterialCommunityIcons name="theme-light-dark" size={24} color={primary} />
                  <Text style={[styles.menuText, { color: text }]}>{t('theme')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={text} />
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: background }]} />

                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('language')}>
                  <MaterialCommunityIcons name="translate" size={24} color={primary} />
                  <Text style={[styles.menuText, { color: text }]}>{t('language')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={text} />
                </TouchableOpacity>
              </Card>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: card }]}
                onPress={() => handleMenuPress('logout')}>
                 <MaterialCommunityIcons name='logout' size={30} color={primary}/>   
                <Text style={[styles.logoutText, { color: primary }]}>{t('logOut')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: card }]}
            onPress={() => handleMenuPress('login')}>
            <Text style={[styles.logoutText, { color: primary }]}>{t('login')}</Text>
          </TouchableOpacity>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { padding: 24, paddingTop: 60, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  phone: { fontSize: 16 },
  section: { padding: 24, paddingTop: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  menuCard: { padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuText: { flex: 1, fontSize: 16, marginLeft: 16 },
  divider: { height: 1},
  logoutButton: { flexDirection: 'row', alignItems: 'center',justifyContent:'center', marginTop: 24, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;