# 🚀 FinVoice Backend

Express.js backend for the FinVoice financial management application with Supabase database and Firebase authentication.

## 🏗️ Architecture

- **Express.js** - Web framework
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Firebase Admin** - Authentication and user management
- **Gemini AI** - Financial insights and investment advice
- **Google Cloud STT** - Speech-to-text processing

## 📋 Prerequisites

- Node.js >= 18
- Supabase project
- Firebase project
- Google Cloud project (for STT)
- Gemini AI API key

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env
   # Fill in your API keys and configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Health check**
   ```bash
   curl http://localhost:5000/health
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_cert_url

# Google Cloud
GOOGLE_CLOUD_STT_API_KEY=your_google_cloud_stt_api_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET=your_jwt_secret
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Server status and service configuration

### AI Services
- `POST /api/ai/financial-insights` - Get financial health insights
- `POST /api/ai/investment-advice` - Get personalized investment advice

### Voice Processing
- `POST /api/voice/process` - Process voice input and extract expense data
- `POST /api/voice/transcribe` - Transcribe audio files (future)

## 🔐 Authentication

All protected endpoints require a valid Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## 🗄️ Database Schema

The backend expects the following Supabase tables:

### Profiles
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'INR',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Expenses
```sql
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  voice_input TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Budgets
```sql
CREATE TABLE public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  month_year TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  categories JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing

```bash
# Start the server
npm run dev

# Test health endpoint
curl http://localhost:5000/health

# Test AI endpoint (requires auth)
curl -X POST http://localhost:5000/api/ai/financial-insights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_firebase_token>" \
  -d '{"budgetData": {...}, "expenseData": {...}}'
```

## 📱 Frontend Integration

The frontend should send requests to these endpoints with proper authentication headers. The backend will handle:

1. **Voice processing** - Parse voice input and extract expense data
2. **AI insights** - Generate financial health scores and recommendations
3. **Investment advice** - Provide personalized investment suggestions

## 🚀 Deployment

1. **Production environment variables**
2. **PM2 process management**
3. **Nginx reverse proxy**
4. **SSL/TLS certificates**

## 🔍 Troubleshooting

### Common Issues

1. **Firebase initialization failed**
   - Check Firebase service account credentials
   - Verify environment variables

2. **Supabase connection error**
   - Verify Supabase URL and keys
   - Check database permissions

3. **Gemini AI errors**
   - Verify API key
   - Check API quotas

### Logs

Check the console output for detailed error messages and service status.

## 📚 Next Steps

1. **Database integration** - Connect Supabase tables
2. **Real-time subscriptions** - WebSocket support
3. **File uploads** - Audio file processing
4. **Caching** - Redis integration
5. **Monitoring** - Health checks and metrics
