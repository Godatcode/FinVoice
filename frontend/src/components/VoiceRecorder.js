import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import ttsService from '../services/TTSService';
import CloudSpeechService from '../services/CloudSpeechService';
import { isCloudSTTConfigured } from '../config/api';

const VoiceRecorder = ({ onVoiceResult, onError, style, iconSize = 20 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUsingRealAPI, setIsUsingRealAPI] = useState(false);
  
  const { text, background, primary, warning, error, secondary, card } = useThemeColor();
  const { t } = useTranslation();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const speechService = useRef(new CloudSpeechService()).current;

  useEffect(() => {
    // Check if we have real API configured
    setIsUsingRealAPI(isCloudSTTConfigured());
    return () => {
      speechService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startWaveAnimation();
    } else {
      stopPulseAnimation();
      stopWaveAnimation();
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(1);
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnim.setValue(0);
  };

  const startRecording = async () => {
    try {
      setShowModal(true);
      setTranscribedText('');
      setIsRecording(true);
      setIsProcessing(false);

      // TTS feedback
      await ttsService.speak('Listening... Speak now.');

      // Start recording with cloud service
      const result = await speechService.startRecording();
      
      if (result.success) {
        // Keep recording state active - user needs to stop manually
        console.log('✅ Recording started successfully');
        console.log('📁 Recording path:', result.message);
      } else {
        throw new Error('Recording failed');
      }
      
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setIsProcessing(false);
      setShowModal(false);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to start recording. Please try again.';
      
      if (error.message.includes('Voice recording not available')) {
        errorMessage = 'Voice recording is not available. Please enter expense manually or try again later.';
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Microphone permission denied. Please enable microphone access in settings.';
      }
      
      if (onError) {
        onError(error);
      } else {
        ttsService.voiceError('general');
        Alert.alert('Voice Recording', errorMessage);
      }
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      
      // TTS feedback
      await ttsService.speak('Processing your voice input...');
      
      // Stop recording and get transcription
      const result = await speechService.stopRecording();
      
      if (result.success) {
        setIsRecording(false);
        setIsProcessing(false);
        
        // Check if this is a fallback result
        if (result.isFallback) {
          setTranscribedText(result.text);
          
          if (result.requiresManualInput) {
            // Show enhanced fallback message with manual input option
            setTimeout(() => {
              setShowModal(false);
              Alert.alert(
                'Voice Recording Unavailable', 
                'Voice recording is not available on this device. Would you like to enter your expense manually?',
                [
                  { 
                    text: 'Enter Manually', 
                    onPress: () => {
                      // Trigger manual expense input
                      if (onVoiceResult) {
                        onVoiceResult('MANUAL_INPUT_REQUESTED');
                      }
                    }
                  },
                  { text: 'Cancel', onPress: () => setShowModal(false) }
                ]
              );
            }, 2000);
          } else {
            // Show regular fallback message
            setTimeout(() => {
              setShowModal(false);
              Alert.alert(
                'Voice Recording', 
                'Voice recording is not fully available. Please enter your expense manually or try again later.',
                [
                  { text: 'Enter Manually', onPress: () => setShowModal(false) },
                  { text: 'Try Again', onPress: () => setShowModal(false) }
                ]
              );
            }, 3000);
          }
          
          // TTS feedback for fallback
          await ttsService.speak('Please enter expense manually');
        } else {
          // Show transcription result
          setTranscribedText(result.text);
          
          // Process the result after a short delay
          setTimeout(() => {
            if (onVoiceResult) {
              onVoiceResult(result.text);
            }
            setShowModal(false);
          }, 2000);
          
          // TTS confirmation
          await ttsService.speak(`Processed: ${result.text}`);
        }
        
      } else {
        throw new Error('Failed to process recording');
      }
      
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
      setIsProcessing(false);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to process voice input. Please try again.';
      
      if (error.message.includes('Voice recording not available')) {
        errorMessage = 'Voice recording is not available. Please enter expense manually or try again later.';
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Microphone permission denied. Please enable microphone access in settings.';
      }
      
      if (onError) {
        onError(error);
      } else {
        ttsService.voiceError('general');
        Alert.alert('Voice Processing', errorMessage);
      }
    }
  };

  const cancelRecording = async () => {
    try {
      await speechService.stopRecording();
      setShowModal(false);
      setIsRecording(false);
      setIsProcessing(false);
      setTranscribedText('');
      ttsService.speak('Voice input cancelled.');
    } catch (error) {
      console.error('Cancel recording error:', error);
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
            name={isRecording ? 'microphone' : 'microphone-outline'}
            size={iconSize}
            color={isRecording ? error : warning}
          />
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={cancelRecording}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: text }]}>
                {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Input'}
              </Text>
              
              {/* API Status Badge */}
              <View style={[styles.apiStatusBadge, { backgroundColor: isUsingRealAPI ? primary : secondary }]}>
                <MaterialCommunityIcons
                  name={isUsingRealAPI ? "cloud" : "wifi-off"}
                  size={16}
                  color="white"
                />
                <Text style={styles.apiStatusText}>
                  {isUsingRealAPI ? "Google Cloud STT" : "Mock Mode"}
                </Text>
              </View>
            </View>

            <View style={styles.recordingContainer}>
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <Animated.View style={[styles.microphoneContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <MaterialCommunityIcons name="microphone" size={80} color={error} />
                  </Animated.View>
                  
                  <Text style={[styles.recordingText, { color: error }]}>
                    Speak now...
                  </Text>
                  
                  <View style={styles.volumeWaves}>
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.volumeBar,
                          {
                            backgroundColor: error,
                            transform: [{
                              scaleY: waveAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1 + index * 0.2]
                              })
                            }]
                          }
                        ]}
                      />
                    ))}
                  </View>
                  
                  <Text style={[styles.recordingHint, { color: secondary }]}>
                    {isUsingRealAPI 
                      ? "Speak clearly - tap Stop when done"
                      : "Say something like: 'Add dinner 7300 rupees'"
                    }
                  </Text>
                </View>
              )}

              {isProcessing && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={primary} />
                  <Text style={[styles.processingText, { color: text }]}>
                    Converting speech to text...
                  </Text>
                  <Text style={[styles.processingHint, { color: secondary }]}>
                    {isUsingRealAPI 
                      ? "Processing with Google Cloud Speech-to-Text"
                      : "Using mock transcription system"
                    }
                  </Text>
                </View>
              )}

              {transcribedText ? (
                <View style={styles.resultContainer}>
                  <Text style={[styles.resultLabel, { color: text }]}>You said:</Text>
                  <Text style={[styles.resultText, { color: primary }]}>{transcribedText}</Text>
                  <Text style={[styles.confidenceText, { color: secondary }]}>
                    Confidence: 95%
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.modalActions}>
              {isRecording && !isProcessing && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: error }]}
                  onPress={stopRecording}
                >
                  <Text style={styles.actionButtonText}>Stop Recording</Text>
                </TouchableOpacity>
              )}

              {!isRecording && !isProcessing && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: warning }]}
                  onPress={cancelRecording}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
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
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  apiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  apiStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 200,
  },
  recordingIndicator: {
    alignItems: 'center',
  },
  microphoneContainer: {
    marginBottom: 16,
  },
  recordingText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  recordingHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  volumeWaves: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
  },
  volumeBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 20,
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  processingHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 238, 0.1)',
    width: '100%',
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
    lineHeight: 24,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 12,
    opacity: 0.6,
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
