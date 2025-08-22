// Process voice input and extract expense data
const processVoiceInput = async (req, res) => {
  try {
    const { voiceText, language = 'en' } = req.body;
    const userId = req.userId;

    if (!voiceText) {
      return res.status(400).json({
        error: 'Missing data',
        message: 'Voice text is required'
      });
    }

    // Enhanced parsing logic for voice input
    const parsedExpense = parseVoiceInput(voiceText, language);

    if (!parsedExpense.isValid) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Could not parse expense from voice input. Please try again with a clear amount and description.',
        example: 'Add dinner 7300 rupees'
      });
    }

    res.json({
      success: true,
      data: {
        amount: parsedExpense.amount,
        description: parsedExpense.description,
        category: parsedExpense.category,
        confidence: parsedExpense.confidence || 0.85,
        originalText: voiceText
      }
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      error: 'Voice processing failed',
      message: 'Failed to process voice input'
    });
  }
};

// Transcribe audio file (for future use)
const transcribeAudio = async (req, res) => {
  try {
    // This endpoint is for future audio file transcription
    // For now, we'll return a placeholder
    res.json({
      success: true,
      message: 'Audio transcription endpoint ready for future implementation',
      data: {
        text: 'Audio transcription will be implemented in future versions',
        confidence: 0.0
      }
    });
  } catch (error) {
    console.error('Audio transcription error:', error);
    res.status(500).json({
      error: 'Audio transcription failed',
      message: 'Failed to transcribe audio'
    });
  }
};

// Enhanced voice input parsing function
const parseVoiceInput = (voiceText, language = 'en') => {
  const text = voiceText.toLowerCase();
  
  // Extract amount (look for numbers with currency context)
  const amountPatterns = [
    /(\d+(?:\.\d{2})?)\s*(?:rupees?|rs|₹|inr)/i,
    /(\d+(?:\.\d{2})?)\s*(?:dollars?|\$|usd)/i,
    /(\d+(?:\.\d{2})?)\s*(?:euros?|€|eur)/i,
    /(\d+(?:\.\d{2})?)/  // fallback to any number
  ];
  
  let amount = null;
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      break;
    }
  }
  
  // Extract category based on enhanced keywords
  let category = 'other';
  let description = voiceText;
  
  // Food & Dining
  if (text.includes('food') || text.includes('dinner') || text.includes('lunch') || 
      text.includes('breakfast') || text.includes('restaurant') || text.includes('meal') ||
      text.includes('coffee') || text.includes('snack') || text.includes('pizza') ||
      text.includes('burger') || text.includes('chicken') || text.includes('rice')) {
    category = 'foodDining';
  }
  // Transportation
  else if (text.includes('transport') || text.includes('uber') || text.includes('taxi') || 
           text.includes('fuel') || text.includes('gas') || text.includes('petrol') ||
           text.includes('bus') || text.includes('train') || text.includes('metro') ||
           text.includes('parking') || text.includes('toll')) {
    category = 'transportation';
  }
  // Entertainment
  else if (text.includes('movie') || text.includes('entertainment') || text.includes('game') || 
           text.includes('concert') || text.includes('show') || text.includes('theater') ||
           text.includes('party') || text.includes('outing') || text.includes('fun')) {
    category = 'entertainment';
  }
  // Utilities
  else if (text.includes('bill') || text.includes('electricity') || text.includes('water') || 
           text.includes('internet') || text.includes('phone') || text.includes('mobile') ||
           text.includes('gas bill') || text.includes('maintenance')) {
    category = 'utilities';
  }
  // Shopping
  else if (text.includes('shopping') || text.includes('clothes') || text.includes('book') || 
           text.includes('grocery') || text.includes('store') || text.includes('mall') ||
           text.includes('shirt') || text.includes('pants') || text.includes('shoes')) {
    category = 'shopping';
  }
  // Healthcare
  else if (text.includes('doctor') || text.includes('medicine') || text.includes('health') || 
           text.includes('medical') || text.includes('hospital') || text.includes('pharmacy') ||
           text.includes('medicine') || text.includes('treatment')) {
    category = 'healthcare';
  }
  // Education
  else if (text.includes('course') || text.includes('book') || text.includes('education') || 
           text.includes('training') || text.includes('school') || text.includes('college') ||
           text.includes('university') || text.includes('study')) {
    category = 'education';
  }
  // Travel
  else if (text.includes('travel') || text.includes('flight') || text.includes('hotel') || 
           text.includes('vacation') || text.includes('trip') || text.includes('journey') ||
           text.includes('booking') || text.includes('reservation')) {
    category = 'travel';
  }
  
  // Clean up description (remove amount and common words)
  let cleanDescription = voiceText;
  if (amount) {
    cleanDescription = voiceText.replace(new RegExp(`${amount}\\s*(?:rupees?|rs|₹|inr|dollars?|\\$|usd|euros?|€|eur)?`, 'gi'), '').trim();
  }
  
  // Remove common filler words
  const fillerWords = ['add', 'expense', 'for', 'of', 'the', 'a', 'an', 'and', 'or', 'but'];
  cleanDescription = cleanDescription
    .split(' ')
    .filter(word => !fillerWords.includes(word.toLowerCase()))
    .join(' ')
    .trim();
  
  // If description is empty after cleaning, use original
  if (!cleanDescription) {
    cleanDescription = voiceText;
  }
  
  return {
    amount,
    description: cleanDescription || voiceText,
    category,
    isValid: amount !== null && cleanDescription.length > 0
  };
};

module.exports = {
  processVoiceInput,
  transcribeAudio
};
