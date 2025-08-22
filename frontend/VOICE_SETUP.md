# Voice Recording Setup Guide

## Overview
The voice recording feature now uses real audio recording and can integrate with Google Cloud Speech-to-Text API for accurate transcription.

## Features
- ✅ Real audio recording using device microphone
- ✅ Google Cloud Speech-to-Text integration
- ✅ Fallback to mock transcription when API is unavailable
- ✅ Automatic expense parsing from voice input
- ✅ Category detection based on keywords

## Setup Instructions

### 1. Install Dependencies
The following packages have been installed:
- `react-native-audio-recorder-player` - For audio recording
- `react-native-fs` - For file system operations
- `react-native-permissions` - For microphone permissions

### 2. Google Cloud Speech-to-Text Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Speech-to-Text API

#### Step 2: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

#### Step 3: Configure API Key
1. Open `frontend/src/config/api.js`
2. Add your Google Cloud API key:
```javascript
export const GOOGLE_CLOUD_STT_API_KEY = 'your_api_key_here';
```

### 3. Environment Variables
Add to your `.env` file:
```env
GOOGLE_CLOUD_STT_API_KEY=your_api_key_here
```

### 4. iOS Setup (if needed)
Add to `ios/YourApp/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for voice expense input.</string>
```

### 5. Android Setup (if needed)
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Usage

### How It Works
1. **Start Recording**: Tap the microphone icon
2. **Speak**: Say your expense clearly (e.g., "dinner 7300 rupees")
3. **Stop Recording**: Tap "Stop Recording" when done
4. **Processing**: Audio is sent to Google Cloud STT for transcription
5. **Expense Creation**: Parsed text is converted to expense data

### Voice Input Examples
- "dinner 7300 rupees" → Food & Dining, ₹7300
- "uber ride 450" → Transportation, ₹450
- "movie tickets 1200" → Entertainment, ₹1200
- "electricity bill 2500" → Utilities, ₹2500
- "shopping clothes 3500" → Shopping, ₹3500

### Fallback Mode
When Google Cloud API is not configured:
- Uses mock transcription system
- Provides realistic sample data for testing
- No external API calls required

## Troubleshooting

### Common Issues

#### 1. Permission Denied
- Ensure microphone permission is granted
- Check device settings for app permissions

#### 2. Recording Fails
- Verify audio hardware is working
- Check if another app is using microphone

#### 3. Transcription Errors
- Ensure Google Cloud API key is valid
- Check API quotas and billing
- Verify internet connection

#### 4. File Read Errors
- Ensure app has file system permissions
- Check available storage space

### Debug Information
The app logs detailed information to help troubleshoot:
- Recording start/stop events
- File operations
- API request/response details
- Error messages with context

## Testing

### Without API Key
1. Launch app without configuring Google Cloud API
2. Voice recording will use mock transcription
3. Test expense creation flow with sample data

### With API Key
1. Configure valid Google Cloud API key
2. Test real voice recording and transcription
3. Verify expense parsing accuracy

## Performance Notes
- Audio recording: ~2-5 seconds typical
- Transcription processing: ~1-3 seconds
- Total response time: ~3-8 seconds
- File sizes: ~50-200 KB per recording

## Security Considerations
- Audio files are stored temporarily on device
- No audio data is stored permanently
- API keys should be kept secure
- Consider implementing API key rotation

## Future Enhancements
- Support for multiple languages
- Offline transcription capabilities
- Voice command shortcuts
- Expense templates via voice
- Integration with other speech services
