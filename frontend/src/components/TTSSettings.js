import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from '../context/ThemeProvider';
import ttsService from '../services/TTSService';

const TTSSettings = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const { text, background, primary, secondary, card } = useThemeColor();

  const toggleTTS = async (value) => {
    setIsEnabled(value);
    if (value) {
      await ttsService.speak('Text to speech enabled');
    } else {
      await ttsService.speak('Text to speech disabled');
      ttsService.stop();
    }
  };

  const testTTS = async () => {
    if (isTestMode) return;
    
    setIsTestMode(true);
    await ttsService.speak('This is a test of the text to speech system. Your voice feedback is working correctly.');
    setTimeout(() => setIsTestMode(false), 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: card }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="volume-high" size={24} color={primary} />
        <Text style={[styles.title, { color: text }]}>Voice Feedback</Text>
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: text }]}>Enable TTS</Text>
          <Text style={[styles.settingDescription, { color: secondary }]}>
            Get voice confirmation for expenses and actions
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={toggleTTS}
          trackColor={{ false: secondary, true: primary }}
          thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity
        style={[styles.testButton, { backgroundColor: primary }]}
        onPress={testTTS}
        disabled={!isEnabled || isTestMode}
      >
        <MaterialCommunityIcons 
          name="play-circle" 
          size={20} 
          color="white" 
        />
        <Text style={styles.testButtonText}>
          {isTestMode ? 'Testing...' : 'Test Voice'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TTSSettings;
