import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';

const VoiceRecorder = ({ onVoiceResult, onError, style, iconSize = 20 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const { text, background, primary, warning, error, secondary, card } = useThemeColor();
  const { t } = useTranslation();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startRecording = () => {
    setShowModal(true);
    setTranscribedText('');
    setInputText('');
    setIsRecording(true);
    
    // Simulate recording animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      if (inputText.trim()) {
        setTranscribedText(inputText);
        setIsProcessing(false);
        
        // Process the input
        setTimeout(() => {
          if (onVoiceResult) {
            onVoiceResult(inputText);
          }
          setShowModal(false);
          setIsProcessing(false);
        }, 1000);
      } else {
        setIsProcessing(false);
        Alert.alert('No Input', 'Please enter some text to simulate voice input.');
      }
    }, 1500);
  };

  const cancelRecording = () => {
    setShowModal(false);
    setIsRecording(false);
    setIsProcessing(false);
    setInputText('');
    setTranscribedText('');
    pulseAnim.setValue(1);
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      stopRecording();
    } else {
      Alert.alert('No Input', 'Please enter some text to simulate voice input.');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.voiceButton, style]}
        onPress={startRecording}
        disabled={isRecording}
      >
        <Animated.View style={{ transform: [{ scale: isRecording ? pulseAnim : 1 }] }}>
          <MaterialCommunityIcons
            name={isRecording ? "microphone" : "microphone-outline"}
            size={iconSize}
            color={isRecording ? error : warning}
          />
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelRecording}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>
                {isRecording ? 'Voice Input (Simulated)' : isProcessing ? 'Processing...' : 'Voice Input'}
              </Text>
            </View>

            <View style={styles.recordingContainer}>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <MaterialCommunityIcons
                    name="microphone"
                    size={60}
                    color={error}
                  />
                  <Text style={[styles.recordingText, { color: error }]}>
                    Simulating voice input...
                  </Text>
                  <Text style={[styles.recordingSubtext, { color: secondary }]}>
                    Type your expense (e.g., "Add dinner 7300")
                  </Text>
                  
                  <TextInput
                    style={[styles.textInput, { 
                      borderColor: primary, 
                      color: text,
                      backgroundColor: card 
                    }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type: Add dinner 7300"
                    placeholderTextColor={secondary}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              )}

              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text style={[styles.processingText, { color: text }]}>
                    Processing your input...
                  </Text>
                </View>
              )}

              {transcribedText ? (
                <View style={styles.resultContainer}>
                  <Text style={[styles.resultLabel, { color: text }]}>You said:</Text>
                  <Text style={[styles.resultText, { color: primary }]}>{transcribedText}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.modalActions}>
              {isRecording && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: primary }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.actionButtonText}>Submit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: warning }]}
                onPress={cancelRecording}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  voiceButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 120,
  },
  recordingIndicator: {
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  recordingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  textInput: {
    width: 280,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VoiceRecorder;
