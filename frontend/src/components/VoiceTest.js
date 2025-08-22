import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import CloudSpeechService from '../services/CloudSpeechService';

const VoiceTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Ready to test');
  const [transcription, setTranscription] = useState('');
  
  const speechService = new CloudSpeechService();

  const testStartRecording = async () => {
    try {
      setStatus('Starting recording...');
      setIsRecording(true);
      
      const result = await speechService.startRecording();
      
      if (result.success) {
        setStatus('Recording... Tap Stop when done');
        console.log('✅ Test recording started:', result);
      } else {
        throw new Error('Recording failed to start');
      }
      
    } catch (error) {
      console.error('❌ Test recording error:', error);
      setStatus(`Error: ${error.message}`);
      setIsRecording(false);
      Alert.alert('Test Failed', error.message);
    }
  };

  const testStopRecording = async () => {
    try {
      setStatus('Processing...');
      
      const result = await speechService.stopRecording();
      
      if (result.success) {
        setStatus('Success!');
        setTranscription(result.text);
        console.log('✅ Test transcription result:', result);
        Alert.alert('Success!', `Transcription: ${result.text}`);
      } else {
        throw new Error('Failed to process recording');
      }
      
      setIsRecording(false);
      
    } catch (error) {
      console.error('❌ Test stop recording error:', error);
      setStatus(`Error: ${error.message}`);
      setIsRecording(false);
      Alert.alert('Test Failed', error.message);
    }
  };

  const testCleanup = () => {
    try {
      speechService.cleanup();
      setStatus('Cleanup completed');
    } catch (error) {
      console.error('❌ Test cleanup error:', error);
      setStatus(`Cleanup error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recording Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>
      
      {transcription ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Transcription:</Text>
          <Text style={styles.resultText}>{transcription}</Text>
        </View>
      ) : null}
      
      <View style={styles.buttonContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={testStartRecording}
          >
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={testStopRecording}
          >
            <Text style={styles.buttonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.cleanupButton]}
          onPress={testCleanup}
        >
          <Text style={styles.buttonText}>Cleanup</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This test component helps verify that voice recording is working correctly.
        </Text>
        <Text style={styles.infoText}>
          Check the console logs for detailed debugging information.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#0066cc',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  cleanupButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default VoiceTest;
