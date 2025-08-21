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
import Logo from '../../assets/fortura.png';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const {t} = useTranslation();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const { setUser } = useContext(UserContext);
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
    setLoading(true);
    try {
      await confirm.confirm(code);
      await AsyncStorage.setItem('name' , name);
      await AsyncStorage.setItem('phone' , phone);
      setUser({name : name, phone: phone});
      login();
      navigation.replace('Main', { name, phone });
    } catch (error) {
      console.log('❌ Invalid code:', error);
      Alert.alert(t('invalidOTP'), t('invalidOTPMsg'));
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