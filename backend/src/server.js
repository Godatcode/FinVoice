require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin (optional for now)
let firebaseInitialized = false;
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    const { initializeFirebase } = require('./config/firebase');
    initializeFirebase();
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('⚠️ Continuing without Firebase authentication');
  }
} else {
  console.log('⚠️ Firebase not configured - authentication will be disabled');
}

// Middleware
app.use(cors({
  origin: true, // Allow all origins for mobile app
  credentials: true
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FinVoice Backend is running!',
    timestamp: new Date().toISOString(),
    services: {
      firebase: firebaseInitialized ? 'Active' : 'Not configured',
      supabase: process.env.SUPABASE_URL ? 'Configured' : 'Not configured',
      gemini: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'
    }
  });
});

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/voice', require('./routes/voice'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 FinVoice Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Services Status:`);
  console.log(`   - Firebase: ${firebaseInitialized ? '✅ Active' : '❌ Not configured'}`);
  console.log(`   - Supabase: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   - Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});
