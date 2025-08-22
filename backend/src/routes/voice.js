const express = require('express');
const { authenticateUserId } = require('../middleware/auth');
const { processVoiceInput, transcribeAudio } = require('../controllers/voiceController');

const router = express.Router();

// Process voice input and extract expense data
router.post('/process', authenticateUserId, processVoiceInput);

// Transcribe audio file (for future use)
router.post('/transcribe', authenticateUserId, transcribeAudio);

module.exports = router;
