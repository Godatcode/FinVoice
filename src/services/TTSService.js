import TTS from 'react-native-tts';

class TTSService {
  constructor() {
    this.isInitialized = false;
    this.initializing = false;
    this.initRetries = 0;
    this.maxRetries = 3;
    this.init();
  }

  async init() {
    if (this.initializing || this.isInitialized) return;
    this.initializing = true;
    try {
      // Ensure the native side is ready
      await TTS.getInitStatus();

      // Safe defaults
      try { await TTS.setDefaultLanguage('en-US'); } catch {}
      try { await TTS.setDefaultRate(0.5); } catch {}
      try { await TTS.setDefaultPitch(1.0); } catch {}

      this.isInitialized = true;
      this.initializing = false;
      this.initRetries = 0;
      console.log('TTS initialized successfully');
    } catch (error) {
      this.initializing = false;
      this.isInitialized = false;
      this.initRetries += 1;
      console.error('TTS initialization failed:', error);
      // Retry a few times in case the engine is still warming up
      if (this.initRetries <= this.maxRetries) {
        setTimeout(() => this.init(), 800);
      }
    }
  }

  async ensureReady() {
    if (this.isInitialized) return true;
    await this.init();
    return this.isInitialized;
  }

  async speak(text, options = {}) {
    const ready = await this.ensureReady();
    if (!ready) {
      console.log('TTS not initialized, skipping speech');
      return;
    }

    try {
      const { rate = 0.5, pitch = 1.0, language = 'en-US' } = options;
      
      // Stop any ongoing speech
      try { await TTS.stop(); } catch {}
      
      // Set parameters for this speech
      try { await TTS.setDefaultRate(rate); } catch {}
      try { await TTS.setDefaultPitch(pitch); } catch {}
      try { await TTS.setDefaultLanguage(language); } catch {}
      
      // Speak the text
      await TTS.speak(text);
    } catch (error) {
      console.error('TTS speak error:', error);
    }
  }

  // Expense-specific voice feedback
  async confirmExpense(expense) {
    const message = `Expense added successfully. ${expense.description} for ${expense.amount} rupees in ${expense.category} category.`;
    await this.speak(message, { rate: 0.6 });
  }

  async confirmBudgetUpdate(category, amount) {
    const message = `Budget updated for ${category} to ${amount} rupees.`;
    await this.speak(message, { rate: 0.6 });
  }

  async announceTotal(total) {
    const message = `Your total expenses are now ${total} rupees.`;
    await this.speak(message, { rate: 0.5 });
  }

  async voiceError(errorType) {
    const messages = {
      'invalid_input': 'Please provide a valid amount and description.',
      'network_error': 'Network error. Please check your connection.',
      'permission_error': 'Microphone permission required for voice input.',
      'general': 'An error occurred. Please try again.'
    };
    
    const message = messages[errorType] || messages.general;
    await this.speak(message, { rate: 0.4, pitch: 0.9 });
  }

  async stop() {
    try {
      await TTS.stop();
    } catch (error) {
      console.error('TTS stop error:', error);
    }
  }
}

// Create singleton instance
const ttsService = new TTSService();

export default ttsService;
