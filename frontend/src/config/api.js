// Frontend API Configuration
// This file contains configuration for frontend services only
// Backend handles all database operations via Supabase

import { GOOGLE_CLOUD_STT_API_KEY } from '@env';

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Variables Debug:');
console.log('  - GOOGLE_CLOUD_STT_API_KEY:', GOOGLE_CLOUD_STT_API_KEY ? '✅ Loaded' : '❌ Not loaded');

export const API_CONFIG = {
  // Backend API Configuration
  // All data operations go through the backend server
  BACKEND_URL: 'https://finvoice-backend-vw3t.onrender.com', 
  
  // Google Cloud Speech-to-Text API Key (for voice features)
  GOOGLE_CLOUD_STT_API_KEY: GOOGLE_CLOUD_STT_API_KEY,
  
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

// Helper function to get Google Cloud API key
export const getGoogleCloudAPIKey = () => {
  const key = API_CONFIG.GOOGLE_CLOUD_STT_API_KEY;
  if (!key || key === 'your_google_cloud_api_key_here') {
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
    console.log('  - Backend URL:', API_CONFIG.BACKEND_URL);
    console.log('  - Google API Key configured:', !!getGoogleCloudAPIKey());
    console.log('  - Force mock mode:', API_CONFIG.FORCE_MOCK_MODE);
    console.log('  - Using real API:', isCloudSTTConfigured());
  }
};
