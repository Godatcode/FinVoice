// API Configuration
// Replace these with your actual API keys when ready for production
import { GOOGLE_CLOUD_STT_API_KEY } from '@env';

export const API_CONFIG = {
  // Google Cloud Speech-to-Text API Key
  // Get this from: https://console.cloud.google.com/apis/credentials
  
  
  // Google Cloud Speech-to-Text API Endpoint
  GOOGLE_CLOUD_STT_ENDPOINT: 'https://speech.googleapis.com/v1/speech:recognize',
  
  // Speech Recognition Settings
  SPEECH_CONFIG: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    enableWordTimeOffsets: false,
    enableAutomaticPunctuation: true,
    model: 'latest_long',
    useEnhanced: true,
  },
  
  // Audio Recording Settings
  AUDIO_CONFIG: {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    audioFormat: 'wav',
    maxDuration: 30000, // 30 seconds max
  },
  
  // Debug Settings
  DEBUG_MODE: true, // Set to false in production
  FORCE_MOCK_MODE: false, // Set to true to force mock mode for testing
};

// Helper function to get API key
export const getGoogleCloudAPIKey = () => {
  const key = API_CONFIG.GOOGLE_CLOUD_STT_API_KEY;
  if (key === 'YOUR_GOOGLE_CLOUD_API_KEY_HERE') {
    console.warn('⚠️ Google Cloud API key not configured. Using mock transcription.');
    return null;
  }
  return key;
};

// Check if cloud STT is properly configured
export const isCloudSTTConfigured = () => {
  if (API_CONFIG.FORCE_MOCK_MODE) {
    console.log('🔧 Debug: Force mock mode enabled');
    return false;
  }
  return getGoogleCloudAPIKey() !== null;
};

// Debug helper
export const logApiStatus = () => {
  if (API_CONFIG.DEBUG_MODE) {
    console.log('🔧 API Debug Info:');
    console.log('  - API Key configured:', !!getGoogleCloudAPIKey());
    console.log('  - Force mock mode:', API_CONFIG.FORCE_MOCK_MODE);
    console.log('  - Using real API:', isCloudSTTConfigured());
    console.log('  - Endpoint:', API_CONFIG.GOOGLE_CLOUD_STT_ENDPOINT);
  }
};
