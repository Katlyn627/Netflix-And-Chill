# Environment Configuration for React Native App

This app uses environment-specific configuration for API endpoints and other settings.

## Development

Default configuration in `src/services/api.js` uses:
- iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api` (special Android localhost alias)
- Physical Device: `http://YOUR_IP_ADDRESS:3000/api`

## Production

### Option 1: Using app.config.js (Recommended)

Create `app.config.js` in the mobile directory:

```javascript
export default {
  expo: {
    // ... other expo config
    extra: {
      apiUrl: process.env.API_URL || 'https://your-production-api.com/api',
    },
  },
};
```

Then access in your app:
```javascript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

### Option 2: Using .env files

1. Install dotenv:
```bash
npm install react-native-dotenv
```

2. Create `.env` file:
```
API_URL=https://your-production-api.com/api
```

3. Add to `.gitignore`:
```
.env
.env.local
.env.production
```

4. Configure babel.config.js:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

5. Import in your app:
```javascript
import { API_URL } from '@env';
```

## EAS Build Configuration

For Expo Application Services (EAS) builds, add to `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-production-api.com/api"
      }
    },
    "development": {
      "env": {
        "API_URL": "http://localhost:3000/api"
      }
    }
  }
}
```

## Current Setup

The app currently uses a simple `__DEV__` check:
- Development: `http://localhost:3000/api`
- Production: Placeholder that needs to be updated

Update `src/services/api.js` with your production URL before deploying.

## Security Best Practices

1. ✅ Never commit API keys or secrets to version control
2. ✅ Use environment variables for sensitive data
3. ✅ Different configs for development/staging/production
4. ✅ Rotate keys regularly
5. ✅ Use HTTPS in production
6. ✅ Implement proper authentication tokens

## Testing Different Environments

### Local Development
```bash
npm start
```

### Testing with Production API
```bash
# Temporarily update API_BASE_URL in src/services/api.js
# Or use app.config.js with environment variable
npm start
```

### Building for Production
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Common Issues

### Cannot connect to backend
- Check if backend is running
- Verify correct IP address for physical devices
- Check firewall settings
- Use `adb reverse tcp:3000 tcp:3000` for Android emulator

### Different behavior in development vs production
- Ensure `__DEV__` checks are correct
- Test with production API URL before releasing
- Use environment-specific configurations

## Next Steps

1. Deploy your backend to a production server (Heroku, AWS, etc.)
2. Get the production API URL
3. Update `src/services/api.js` or create `app.config.js`
4. Test thoroughly with production API
5. Build and deploy mobile app
