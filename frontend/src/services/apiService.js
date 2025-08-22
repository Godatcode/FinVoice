import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get current user ID from AsyncStorage
const getCurrentUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// API Client for backend communication
export const apiClient = {
  async request(endpoint, options = {}) {
    const userId = await getCurrentUserId();
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(userId && { Authorization: `Bearer ${userId}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data 
    });
  },

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data 
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

// Expense API Service (Backend API calls)
export const expenseAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/api/expenses');
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Error fetching expenses from backend:', error);
      throw error;
    }
  },

  async create(expenseData) {
    try {
      const response = await apiClient.post('/api/expenses', expenseData);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error creating expense via backend:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const response = await apiClient.put(`/api/expenses/${id}`, updates);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error updating expense via backend:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/api/expenses/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error deleting expense via backend:', error);
      throw error;
    }
  }
};

// Budget API Service (Backend API calls)
export const budgetAPI = {
  async getAll() {
    try {
      const response = await apiClient.get('/api/budgets');
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Error fetching budgets from backend:', error);
      throw error;
    }
  },

  async create(budgetData) {
    try {
      const response = await apiClient.post('/api/budgets', budgetData);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error creating budget via backend:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const response = await apiClient.put(`/api/budgets/${id}`, updates);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error updating budget via backend:', error);
      throw error;
    }
  }
};

// AI API Service (backend endpoints)
export const aiAPI = {
  async getFinancialInsights(budgetData, expenseData, language = 'en') {
    try {
      const response = await apiClient.post('/api/ai/financial-insights', {
        budgetData,
        expenseData,
        language
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Error getting financial insights from backend:', error);
      throw error;
    }
  },

  async getInvestmentAdvice(age, futurePlans, income, language = 'en') {
    try {
      const response = await apiClient.post('/api/ai/investment-advice', {
        age,
        futurePlans,
        income,
        language
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Error getting investment advice from backend:', error);
      throw error;
    }
  }
};

// Voice API Service (backend endpoints)
export const voiceAPI = {
  async processVoiceInput(voiceText, language = 'en') {
    try {
      const response = await apiClient.post('/api/voice/process', {
        voiceText,
        language
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Error processing voice input via backend:', error);
      throw error;
    }
  },

  async transcribeAudio(audioData) {
    try {
      const response = await apiClient.post('/api/voice/transcribe', {
        audioData
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Error transcribing audio via backend:', error);
      throw error;
    }
  }
};

// User Profile API Service
export const profileAPI = {
  async getProfile() {
    // Get current user ID from AsyncStorage
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    try {
      // Create local reference to apiClient
      const client = apiClient;
      console.log('🔍 apiClient in getProfile:', client);
      
      if (!client) {
        throw new Error('apiClient is undefined in getProfile!');
      }
      
      const response = await client.get(`/api/users/profile/${userId}`);
      
      if (!response || !response.profile) {
        throw new Error('Invalid profile response from backend');
      }
      
      return response.profile;
    } catch (error) {
      console.error('❌ Error fetching profile from backend:', error);
      
      // Check if it's a network error
      if (error.message.includes('Network request failed') || 
          error.message.includes('fetch') ||
          error.message.includes('timeout')) {
        throw new Error('Network error: Unable to connect to backend');
      }
      
      throw error;
    }
  },

  async updateProfile(updates) {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    try {
      // Create local reference to apiClient
      const client = apiClient;
      console.log('🔍 apiClient in updateProfile:', client);
      
      if (!client) {
        throw new Error('apiClient is undefined in updateProfile!');
      }
      
      const response = await client.put(`/api/users/profile/${userId}`, updates);
      return response.profile;
    } catch (error) {
      console.error('❌ Error updating profile from backend:', error);
      throw error;
    }
  },

  async createProfile(profileData) {
    try {
      console.log('🔍 profileAPI.createProfile called with:', profileData);
      console.log('🔍 Backend URL:', API_CONFIG.BACKEND_URL);
      
      // Create local reference to apiClient
      const client = apiClient;
      console.log('🔍 apiClient in createProfile:', client);
      
      if (!client) {
        throw new Error('apiClient is undefined in createProfile!');
      }
      
      const response = await client.post('/api/users/create', profileData);
      
      console.log('✅ Profile created successfully via backend:', response);
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response keys:', Object.keys(response || {}));
      console.log('✅ Response.user:', response.user);
      
      return response.user;
    } catch (error) {
      console.error('❌ Error in createProfile via backend:', error);
      throw error;
    }
  },

  async getProfileByPhone(phone) {
    try {
      console.log('🔍 Fetching profile by phone:', phone);
      
      // Create local reference to apiClient
      const client = apiClient;
      
      if (!client) {
        throw new Error('apiClient is undefined in getProfileByPhone!');
      }
      
      const response = await client.get(`/api/users/profile/phone/${phone}`);
      
      console.log('✅ Full response:', response);
      
      // Check if response exists
      if (!response) {
        throw new Error('No response received from backend');
      }
      
      // Check if profile exists in response
      if (!response.profile) {
        throw new Error('No profile data in response');
      }
      
      console.log('✅ Profile fetched successfully by phone:', response.profile);
      return response.profile;
    } catch (error) {
      console.error('❌ Error fetching profile by phone:', error);
      throw error;
    }
  }
};

export default {
  expenseAPI,
  budgetAPI,
  aiAPI,
  voiceAPI,
  profileAPI
};
