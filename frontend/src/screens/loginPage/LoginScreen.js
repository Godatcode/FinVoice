import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image, 
} from 'react-native';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { useThemeColor } from '../../context/ThemeProvider';
import { UserContext } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import Logo from '../../assets/finvoice.png';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileAPI } from '../../services/apiService';

const LoginScreen = ({ navigation }) => {
  const {t} = useTranslation();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const { createUser, setUser } = useContext(UserContext);
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const colors = useThemeColor();
  const {login} = useContext(AuthContext);

  const handleSendOTP = async () => {
    if (!name) {
      Alert.alert(t('nameRequiredTitle'), t('nameRequiredMessage'));
      return;
    }

    if (phone.length < 10) {
      Alert.alert(t('phoneRequired'), t('phoneRequiredMessage'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(getAuth(), fullPhone);
      setConfirm(confirmation);
    } catch (error) {
      console.log('OTP Error:', error);
      Alert.alert(t('error'), t('failOTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!code || code.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid OTP code.');
      return;
    }
    
    setLoading(true);
    try {
      // First, verify Firebase OTP
      await confirm.confirm(code);
      
      // Store basic user info locally first
      await AsyncStorage.setItem("name", name);
      await AsyncStorage.setItem("phone", phone);
      
      // Check if user exists in database first
      try {
        console.log('🔍 Checking if user exists in database...');
        
        // Try to get existing profile by phone number
        let existingProfile = null;
        try {
          existingProfile = await profileAPI.getProfileByPhone(phone);
          console.log('🔍 Profile lookup result:', existingProfile);
        } catch (profileError) {
          console.log('🔍 Profile not found or error:', profileError.message);
          // If it's a "not found" error, that's fine - user doesn't exist
          if (profileError.message.includes('not found') || profileError.message.includes('404')) {
            existingProfile = null;
          } else {
            // For other errors, re-throw
            throw profileError;
          }
        }
        
        if (existingProfile) {
          console.log('✅ Existing user found:', existingProfile);
          
          // User exists - use their data
          await AsyncStorage.setItem("userId", existingProfile.id);
          
          // Update user context with existing profile
          const userData = {
            name: existingProfile.name,
            phone: existingProfile.phone,
            id: existingProfile.id,
            language: existingProfile.language,
            currency: existingProfile.currency,
            theme: existingProfile.theme
          };
          
          // Set user in context
          setUser(userData);
          
          // Store credentials in AsyncStorage for persistence
          await AsyncStorage.setItem("name", existingProfile.name);
          await AsyncStorage.setItem("phone", existingProfile.phone);
          await AsyncStorage.setItem("userId", existingProfile.id);
          
          console.log('✅ User logged in with existing profile');
          console.log('✅ Credentials stored in AsyncStorage for persistence');
        } else {
          console.log('🆕 User not found, creating new profile...');
          
                  // User doesn't exist - create new profile
        const newUserData = await createUser(name, phone);
        console.log('✅ New user profile created:', newUserData);
        
        // Ensure user context is updated with new profile
        if (newUserData && newUserData.id) {
          console.log('🔍 Setting user context with new profile data:', newUserData);
          setUser(newUserData);
          
          // Also store credentials in AsyncStorage for persistence
          await AsyncStorage.setItem("name", name);
          await AsyncStorage.setItem("phone", phone);
          await AsyncStorage.setItem("userId", newUserData.id);
          
          console.log('✅ Credentials stored in AsyncStorage for persistence');
        }
        }
        
      } catch (error) {
        console.error('❌ Error handling user profile:', error);
        
        // If there's any error, create a local session as fallback
        const localUserId = `local_${Date.now()}`;
        await AsyncStorage.setItem("userId", localUserId);
        
        // Create local user data and set it in context
        const localUserData = {
          name: name,
          phone: phone,
          id: localUserId,
          language: 'en',
          currency: 'INR',
          theme: 'light'
        };
        
        // Set user in context for local session
        setUser(localUserData);
        
        console.log('✅ Local user session created as fallback:', localUserData);
        console.log('⚠️ Continuing with local session due to backend error');
      }
      
      // Mark user as logged in
      login();
      
      // Add a small delay to ensure user context is updated
      console.log('🔍 About to navigate - current user context should be set');
      
      // Small delay to ensure context is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to main screen
      navigation.replace('Main', { name, phone });
      
    } catch (error) {
      console.log('❌ OTP verification failed:', error);
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert('Invalid OTP', 'The OTP code you entered is incorrect. Please try again.');
      } else if (error.code === 'auth/invalid-verification-id') {
        Alert.alert('OTP Expired', 'The OTP has expired. Please request a new one.');
      } else {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../../assets/payScreenBackground.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.flexGrow}>
           
            <View style={styles.logoContainer}>
              <Image source={Logo} style={styles.logo} resizeMode="contain" />
            </View>
          </View>

          <View style={[styles.sheet, { backgroundColor: colors.card }]}>

            <Text style={[styles.title, { color: colors.text }]}>{t('loginToContinue')}</Text>

            {!confirm ? (
              <>
                <Text style={[styles.label, { color: colors.text }]}>{t('entername')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('entername')}
                  placeholderTextColor={colors.secondary}
                />

                <Text style={[styles.label, { color: colors.text }]}>{t('enterphone')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder={t('enterphone')}
                  placeholderTextColor={colors.secondary}
                />
                
                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleSendOTP}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{t('sendOTP')}</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: colors.text }]}>{t('Enter OTP:')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="phone-pad"
                  placeholder="123456"
                  placeholderTextColor={colors.secondary}
                />
                
                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleVerifyOTP}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{t('Verify OTP')}</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  flexGrow: {
    flexGrow: 1,
    justifyContent: 'center', 
    alignItems: 'center',     
  },
  logoContainer: {
    marginBottom: 32, 
  },
  logo: {
    width: 150, 
    height: 150, 
  },
  sheet: {
    width: '100%',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default LoginScreen;