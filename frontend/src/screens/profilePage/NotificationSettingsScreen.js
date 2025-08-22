import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Text, Switch, Button, Platform, Linking, Alert } from 'react-native';
import { useThemeColor } from '../../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { profileAPI } from '../../services/apiService';
import { UserContext } from '../../context/UserContext';

const NotificationSettingsScreen = () => {
    const {primary,background , text} = useThemeColor();
    const {t} = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { user } = useContext(UserContext);
    
    useEffect(() => {
        const loadNotificationSettingsFromSupabase = async () => {
            try {
                if (user && user.id) {
                    const profile = await profileAPI.getProfile();
                    if (profile && profile.notifications_enabled !== undefined) {
                        setNotificationsEnabled(profile.notifications_enabled);
                    }
                }
            } catch (error) {
                console.log('Error loading notification settings from Supabase:', error);
            }
        };
        
        loadNotificationSettingsFromSupabase();
    }, [user]);
    
    const toggleSwitch = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        
        try {
            if (user && user.id) {
                await profileAPI.updateProfile({ notifications_enabled: newValue });
            }
        } catch (error) {
            console.error('Error saving notification settings to Supabase:', error);
            // Revert the state if save failed
            setNotificationsEnabled(!newValue);
            Alert.alert('Error', 'Failed to save notification preference. Please try again.');
        }
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
