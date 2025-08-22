import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Switch, Button, Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '../../context/ThemeProvider';
import { useTranslation } from 'react-i18next';

const NotificationSettingsScreen = () => {
    const {primary,background , text} = useThemeColor();
    const {t} = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    
    useEffect(() => {
        const loadToggleState = async () => {
        const value = await AsyncStorage.getItem('notificationsEnabled');
        if (value !== null) setNotificationsEnabled(value === 'true');
        };
        loadToggleState();
    }, []);
    
    const toggleSwitch = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        await AsyncStorage.setItem('notificationsEnabled', newValue.toString());
    };
    
    const openNotificationSettings = () => {
        if (Platform.OS === 'android') {
        Linking.openSettings();
        } else if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
        } else {
        Alert.alert('Unsupported platform');
        }
    };
    
    return (
        <View style={[{flex:1},{backgroundColor:background}]}>
            <View style={[styles.container , {backgroundColor: background}]}>
                <View style={styles.switchContainer}>
                    <Text style={[styles.label , {color: text}]}>{t('Enable Notifications')}</Text>
                    <Switch
                    onValueChange={toggleSwitch}
                    value={notificationsEnabled}
                    trackColor={{ false: '#ccc', true: '#ccc' }}
                    thumbColor={notificationsEnabled ? primary : '#f4f3f4'}
                    />
                </View>
            
                <Button title={t('Open App Settings')} onPress={openNotificationSettings} color={primary}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  switchContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20,
  },
  label: { fontSize: 16 },
});

export default NotificationSettingsScreen;
