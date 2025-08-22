# 🚀 FinVoice Backend Deployment Guide

## Render Deployment

### 1. Prerequisites
- Render account (free at render.com)
- GitHub repository with your backend code
- Environment variables ready

### 2. Quick Deploy Steps

#### Option A: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and deploy
6. Set environment variables in Render dashboard

#### Option B: Manual Deploy
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `finvoice-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3. Environment Variables
Set these in Render dashboard:

```
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Health Check
Your backend includes a health check endpoint at `/health` that Render will use.

### 5. After Deployment
- Get your backend URL (e.g., `https://finvoice-backend.onrender.com`)
- Update frontend `BACKEND_URL` in `frontend/src/config/api.js`
- Test the health endpoint: `https://your-app.onrender.com/health`

### 6. Troubleshooting
- Check Render logs for build errors
- Ensure all environment variables are set
- Verify the start command works locally: `npm start`
