# Flutter Integration Guide for Netflix and Chill

This guide explains how to integrate your Flutter mobile app with the Netflix and Chill backend API and Auth0 authentication.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Auth0 Setup for Flutter](#auth0-setup-for-flutter)
3. [API Integration](#api-integration)
4. [Authentication Flow](#authentication-flow)
5. [Example Flutter Code](#example-flutter-code)
6. [Deep Linking Setup](#deep-linking-setup)
7. [API Endpoints Reference](#api-endpoints-reference)

---

## Prerequisites

### Required Flutter Packages

Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP client for API calls
  http: ^1.1.0
  
  # Auth0 Flutter SDK
  auth0_flutter: ^1.3.0
  
  # Secure storage for tokens
  flutter_secure_storage: ^9.0.0
  
  # State management (choose one)
  provider: ^6.1.1
  # or
  riverpod: ^2.4.9
  
  # Deep linking
  uni_links: ^0.5.1
  
  # Environment variables
  flutter_dotenv: ^5.1.0
```

Run:
```bash
flutter pub get
```

---

## Auth0 Setup for Flutter

### Step 1: Configure Auth0 Application

1. Go to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** > **Applications**
3. Select your "Netflix and Chill" application or create a new Native application
4. Configure **Application URIs**:
   - **Allowed Callback URLs**: 
     ```
     com.yourcompany.netflixandchill://login-callback,
     com.yourcompany.netflixandchill://YOUR_AUTH0_DOMAIN/android/com.yourcompany.netflixandchill/callback,
     com.yourcompany.netflixandchill://YOUR_AUTH0_DOMAIN/ios/com.yourcompany.netflixandchill/callback
     ```
   - **Allowed Logout URLs**:
     ```
     com.yourcompany.netflixandchill://logout,
     com.yourcompany.netflixandchill://YOUR_AUTH0_DOMAIN/android/com.yourcompany.netflixandchill/logout,
     com.yourcompany.netflixandchill://YOUR_AUTH0_DOMAIN/ios/com.yourcompany.netflixandchill/logout
     ```
   - **Allowed Origins (CORS)**: Add your backend URL
     ```
     http://localhost:3000,
     https://your-production-api.com
     ```

### Step 2: Create Flutter Environment Configuration

Create `.env` file in your Flutter project root:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_flutter_auth0_client_id
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/

# Backend API Configuration
API_BASE_URL=http://localhost:3000/api
# For Android emulator use: http://10.0.2.2:3000/api
# For iOS simulator use: http://localhost:3000/api
# For physical device use: http://YOUR_IP:3000/api

# Backend API URL for production
API_BASE_URL_PROD=https://your-production-api.com/api
```

### Step 3: Configure Android

**android/app/build.gradle:**

```gradle
android {
    defaultConfig {
        // Add this
        manifestPlaceholders = [auth0Domain: "your-tenant.auth0.com", auth0Scheme: "com.yourcompany.netflixandchill"]
    }
}
```

**android/app/src/main/AndroidManifest.xml:**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <!-- Add this activity for Auth0 callback -->
        <activity
            android:name="com.auth0.flutter.Auth0FlutterActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="com.yourcompany.netflixandchill"
                    android:host="${auth0Domain}"
                    android:pathPrefix="/android/${applicationId}/callback" />
            </intent-filter>
        </activity>
    </application>
    
    <!-- Add internet permission -->
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

### Step 4: Configure iOS

**ios/Runner/Info.plist:**

```xml
<dict>
    <!-- Add this -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeRole</key>
            <string>None</string>
            <key>CFBundleURLName</key>
            <string>auth0</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>com.yourcompany.netflixandchill</string>
            </array>
        </dict>
    </array>
</dict>
```

---

## API Integration

### Create API Service Class

**lib/services/api_service.dart:**

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  static final String baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
  
  // GET request
  static Future<dynamic> get(String endpoint, {String? token}) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    
    try {
      final response = await http.get(url, headers: headers);
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  // POST request
  static Future<dynamic> post(String endpoint, {Map<String, dynamic>? body, String? token}) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    
    try {
      final response = await http.post(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  // PUT request
  static Future<dynamic> put(String endpoint, {Map<String, dynamic>? body, String? token}) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    
    try {
      final response = await http.put(
        url,
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  // DELETE request
  static Future<dynamic> delete(String endpoint, {String? token}) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    
    try {
      final response = await http.delete(url, headers: headers);
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  // Handle API response
  static dynamic _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    final body = response.body;
    
    if (statusCode >= 200 && statusCode < 300) {
      if (body.isEmpty) return null;
      return jsonDecode(body);
    } else if (statusCode == 401) {
      throw Exception('Unauthorized: Please login again');
    } else if (statusCode == 404) {
      throw Exception('Not found');
    } else {
      final error = jsonDecode(body);
      throw Exception(error['error'] ?? 'Unknown error');
    }
  }
}
```

---

## Authentication Flow

### Create Auth Service

**lib/services/auth_service.dart:**

```dart
import 'package:auth0_flutter/auth0_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_service.dart';

class AuthService {
  static final Auth0 _auth0 = Auth0(
    dotenv.env['AUTH0_DOMAIN']!,
    dotenv.env['AUTH0_CLIENT_ID']!,
  );
  
  static const _storage = FlutterSecureStorage();
  static const String _accessTokenKey = 'access_token';
  static const String _userIdKey = 'user_id';
  
  // Login with Auth0
  static Future<Credentials> login() async {
    try {
      final credentials = await _auth0.webAuthentication().login(
        audience: dotenv.env['AUTH0_AUDIENCE'],
        scopes: {'openid', 'profile', 'email', 'offline_access'},
      );
      
      // Store credentials
      await _storage.write(key: _accessTokenKey, value: credentials.accessToken);
      
      // Create/update user in backend
      await _createOrUpdateUser(credentials);
      
      return credentials;
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }
  
  // Create or update user in backend
  static Future<void> _createOrUpdateUser(Credentials credentials) async {
    try {
      // Get user info
      final userInfo = await _auth0.api.userInfo(accessToken: credentials.accessToken);
      
      // Create/update user in backend
      final response = await ApiService.post(
        '/users/auth0',
        token: credentials.accessToken,
        body: {
          'email': userInfo.email,
          'username': userInfo.nickname ?? userInfo.name,
          'auth0Id': userInfo.sub,
          'profilePicture': userInfo.pictureUrl?.toString(),
        },
      );
      
      // Store user ID
      await _storage.write(key: _userIdKey, value: response['id']);
    } catch (e) {
      throw Exception('Failed to create/update user: $e');
    }
  }
  
  // Logout
  static Future<void> logout() async {
    try {
      await _auth0.webAuthentication().logout();
      await _storage.deleteAll();
    } catch (e) {
      throw Exception('Logout failed: $e');
    }
  }
  
  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: _accessTokenKey);
    return token != null;
  }
  
  // Get access token
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  // Get user ID
  static Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }
  
  // Get user profile
  static Future<Map<String, dynamic>> getUserProfile() async {
    final userId = await getUserId();
    final token = await getAccessToken();
    
    if (userId == null || token == null) {
      throw Exception('Not logged in');
    }
    
    return await ApiService.get('/users/$userId', token: token);
  }
}
```

---

## Example Flutter Code

### Login Screen

**lib/screens/login_screen.dart:**

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await AuthService.login();
      
      // Navigate to home screen
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo
              Image.asset(
                'assets/images/logo.png',
                height: 120,
              ),
              const SizedBox(height: 48),
              
              // Title
              const Text(
                'Welcome to Netflix and Chill',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              
              // Subtitle
              const Text(
                'Find your perfect streaming partner',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              
              // Login button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE50914),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Login with Auth0',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
              
              // Error message
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```

### Profile Screen

**lib/screens/profile_screen.dart:**

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _userProfile;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await AuthService.getUserProfile();
      setState(() {
        _userProfile = profile;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _handleLogout() async {
    try {
      await AuthService.logout();
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Logout failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(_errorMessage!),
              ElevatedButton(
                onPressed: _loadProfile,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile picture
            CircleAvatar(
              radius: 50,
              backgroundImage: _userProfile!['profilePicture'] != null
                  ? NetworkImage(_userProfile!['profilePicture'])
                  : null,
              child: _userProfile!['profilePicture'] == null
                  ? const Icon(Icons.person, size: 50)
                  : null,
            ),
            const SizedBox(height: 16),
            
            // Username
            Text(
              _userProfile!['username'] ?? 'Unknown',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            
            // Email
            Text(
              _userProfile!['email'] ?? '',
              style: const TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 24),
            
            // Bio
            if (_userProfile!['bio'] != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(_userProfile!['bio']),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

---

## Deep Linking Setup

### Configure Deep Links for Auth0 Callback

**lib/main.dart:**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:uni_links/uni_links.dart';
import 'dart:async';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  StreamSubscription? _sub;

  @override
  void initState() {
    super.initState();
    _initDeepLinks();
  }

  Future<void> _initDeepLinks() async {
    // Handle deep links when app is already running
    _sub = uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        _handleDeepLink(uri);
      }
    }, onError: (err) {
      print('Deep link error: $err');
    });

    // Handle deep link when app was launched from cold state
    try {
      final initialUri = await getInitialUri();
      if (initialUri != null) {
        _handleDeepLink(initialUri);
      }
    } catch (e) {
      print('Failed to get initial URI: $e');
    }
  }

  void _handleDeepLink(Uri uri) {
    // Auth0 callback handling is automatic with auth0_flutter package
    print('Deep link received: $uri');
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Netflix and Chill',
      theme: ThemeData(
        primarySwatch: Colors.red,
        primaryColor: const Color(0xFFE50914),
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
    );
  }
}
```

---

## API Endpoints Reference

### User Endpoints

```dart
// Get user profile
final user = await ApiService.get('/users/$userId', token: token);

// Create/update user (Auth0)
final user = await ApiService.post(
  '/users/auth0',
  token: token,
  body: {
    'email': 'user@example.com',
    'username': 'username',
    'auth0Id': 'auth0|123456',
    'profilePicture': 'https://...'
  }
);

// Update user bio
await ApiService.put(
  '/users/$userId/bio',
  body: {'bio': 'New bio text'},
  token: token
);

// Add streaming service
await ApiService.post(
  '/users/$userId/streaming-services',
  body: {
    'id': 8,
    'name': 'Netflix',
    'logoUrl': '...'
  },
  token: token
);

// Add to watch history
await ApiService.post(
  '/users/$userId/watch-history',
  body: {
    'title': 'Movie Title',
    'year': 2024,
    'genre': 'Action'
  },
  token: token
);

// Update preferences
await ApiService.put(
  '/users/$userId/preferences',
  body: {
    'favoriteGenres': ['Action', 'Comedy'],
    'ageRangeMin': 25,
    'ageRangeMax': 35
  },
  token: token
);
```

### Match Endpoints

```dart
// Get matches
final matches = await ApiService.get('/matches/$userId', token: token);

// Get potential matches
final potentialMatches = await ApiService.get(
  '/matches/$userId/potential',
  token: token
);
```

### Streaming Services Endpoints

```dart
// Connect streaming service
await ApiService.get(
  '/auth/netflix/connect?userId=$userId',
  token: token
);

// Get connection status
final status = await ApiService.get(
  '/auth/netflix/status?userId=$userId',
  token: token
);

// Disconnect service
await ApiService.post(
  '/auth/netflix/disconnect',
  body: {'userId': userId},
  token: token
);
```

---

## CORS Configuration for Backend

Ensure your backend allows Flutter app origins. Update **backend/server.js**:

```javascript
const cors = require('cors');

// Configure CORS for Flutter
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost',
    'http://10.0.2.2:3000', // Android emulator
    'capacitor://localhost', // Capacitor
    'ionic://localhost', // Ionic
    'http://localhost:*', // Any localhost port
  ],
  credentials: true
}));
```

---

## Testing

### Test with Android Emulator

```bash
# Make sure backend is running on your machine
npm start

# Update .env in Flutter project
API_BASE_URL=http://10.0.2.2:3000/api

# Run Flutter app
flutter run
```

### Test with iOS Simulator

```bash
# Backend running on localhost:3000
npm start

# Update .env in Flutter project
API_BASE_URL=http://localhost:3000/api

# Run Flutter app
flutter run
```

### Test with Physical Device

```bash
# Find your computer's IP address
# On Mac/Linux: ifconfig | grep "inet "
# On Windows: ipconfig

# Update .env in Flutter project
API_BASE_URL=http://YOUR_IP:3000/api

# Make sure device is on same network
# Run Flutter app
flutter run
```

---

## Troubleshooting

### Issue: "Network Error" or "Connection Refused"

**Solution**: 
- Check that backend server is running
- Verify API_BASE_URL in .env
- For Android emulator, use `http://10.0.2.2:3000`
- For iOS simulator, use `http://localhost:3000`
- For physical device, use your computer's IP

### Issue: "Auth0 Callback Not Working"

**Solution**:
- Verify callback URLs in Auth0 Dashboard
- Check deep linking configuration in Android/iOS
- Ensure app bundle ID matches callback scheme

### Issue: "CORS Error"

**Solution**:
- Update CORS configuration in backend
- Add your app's origin to allowed origins

### Issue: "Token Expired"

**Solution**:
- Implement token refresh logic
- Use `offline_access` scope for refresh tokens

---

## Security Best Practices

1. **Never hardcode API keys** - use .env files
2. **Use HTTPS in production**
3. **Implement certificate pinning** for API calls
4. **Store tokens securely** using flutter_secure_storage
5. **Validate all user input**
6. **Implement proper error handling**
7. **Use ProGuard/R8** for Android release builds
8. **Enable app obfuscation** for iOS

---

## Next Steps

1. Implement your app's UI/UX
2. Add additional API integrations
3. Implement push notifications
4. Add offline support with local database
5. Implement real-time features with WebSockets
6. Add analytics and crash reporting
7. Prepare for app store submission

---

## Support

For issues or questions:
- Check backend API logs
- Review Auth0 logs
- Test API endpoints with Postman
- Refer to Flutter documentation
- Check backend API documentation

---

**Last Updated**: January 2026
**Flutter SDK Version**: 3.16+
**Dart Version**: 3.2+
