# React Native Mobile App Guide

This guide helps you create a React Native mobile app for Netflix and Chill.

## Prerequisites

- Node.js (v14 or later)
- React Native CLI
- Xcode (for iOS development on macOS)
- Android Studio (for Android development)

## Setup React Native

### Install React Native CLI

```bash
# Using npx (recommended)
npx react-native init NetflixAndChillMobile

# Or install CLI globally (optional)
npm install -g @react-native-community/cli
```

### Create New React Native Project

```bash
# Create project in mobile directory
npx react-native init NetflixAndChillMobile
cd NetflixAndChillMobile
```

## Project Structure

```
NetflixAndChillMobile/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── screens/         # App screens
│   │   ├── LoginScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── MatchesScreen.js
│   │   ├── RecommendationsScreen.js
│   │   └── SettingsScreen.js
│   ├── components/      # Reusable components
│   │   ├── UserCard.js
│   │   ├── MatchCard.js
│   │   ├── PhotoGallery.js
│   │   └── StreamingServiceSelector.js
│   ├── services/        # API services
│   │   └── api.js
│   ├── navigation/      # Navigation setup
│   │   └── AppNavigator.js
│   ├── utils/           # Utilities
│   └── styles/          # Global styles
├── App.js               # Root component
└── package.json
```

## Install Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# UI Components
npm install react-native-elements
npm install react-native-vector-icons

# API calls
npm install axios

# Image handling
npm install react-native-image-picker
npm install react-native-fast-image

# Location
npm install @react-native-community/geolocation

# Storage
npm install @react-native-async-storage/async-storage
```

## API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your deployed backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-app.herokuapp.com/api';  // Production

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  // User endpoints
  async createUser(userData) {
    const response = await this.client.post('/users', userData);
    await this.saveUserId(response.data.user.id);
    return response.data;
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async updateBio(userId, bio) {
    const response = await this.client.put(`/users/${userId}/bio`, { bio });
    return response.data;
  }

  async addStreamingService(userId, serviceName) {
    const response = await this.client.post(
      `/users/${userId}/streaming-services`,
      { serviceName }
    );
    return response.data;
  }

  async addWatchHistory(userId, item) {
    const response = await this.client.post(
      `/users/${userId}/watch-history`,
      item
    );
    return response.data;
  }

  async updatePreferences(userId, preferences) {
    const response = await this.client.put(
      `/users/${userId}/preferences`,
      preferences
    );
    return response.data;
  }

  // Match endpoints
  async findMatches(userId, filters = {}) {
    const response = await this.client.get(`/matches/${userId}`, {
      params: filters
    });
    return response.data;
  }

  // Recommendation endpoints
  async getRecommendations(userId, limit = 10) {
    const response = await this.client.get(`/recommendations/${userId}`, {
      params: { limit }
    });
    return response.data;
  }

  // Like endpoints
  async sendLike(fromUserId, toUserId, type = 'like') {
    const response = await this.client.post('/likes', {
      fromUserId,
      toUserId,
      type
    });
    return response.data;
  }

  async getLikes(userId) {
    const response = await this.client.get(`/likes/${userId}`);
    return response.data;
  }

  async getMutualLikes(userId) {
    const response = await this.client.get(`/likes/${userId}/mutual`);
    return response.data;
  }

  // Storage helpers
  async saveUserId(userId) {
    await AsyncStorage.setItem('userId', userId);
  }

  async getUserId() {
    return await AsyncStorage.getItem('userId');
  }

  async clearUserId() {
    await AsyncStorage.removeItem('userId');
  }
}

export default new ApiService();
```

## Sample Screens

### Login Screen

Create `src/screens/LoginScreen.js`:

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ApiService from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const handleCreateProfile = async () => {
    try {
      const response = await ApiService.createUser({
        username,
        email,
        age: parseInt(age),
        location,
        bio,
      });

      navigation.navigate('Profile', { userId: response.user.id });
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Netflix and Chill</Text>
      <Text style={styles.subtitle}>Create Your Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateProfile}>
        <Text style={styles.buttonText}>Create Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0f1014',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e50914',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1e1e24',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e50914',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
```

### Matches Screen

Create `src/screens/MatchesScreen.js`:

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import ApiService from '../services/api';

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const userId = await ApiService.getUserId();
      const response = await ApiService.findMatches(userId);
      setMatches(response.matches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (matchedUserId) => {
    try {
      const userId = await ApiService.getUserId();
      await ApiService.sendLike(userId, matchedUserId, 'like');
      alert('Like sent!');
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  const handleSuperLike = async (matchedUserId) => {
    try {
      const userId = await ApiService.getUserId();
      await ApiService.sendLike(userId, matchedUserId, 'superlike');
      alert('Super Like sent!');
    } catch (error) {
      console.error('Error sending super like:', error);
    }
  };

  const renderMatch = ({ item }) => (
    <View style={styles.card}>
      {item.user.profilePicture && (
        <Image
          source={{ uri: item.user.profilePicture }}
          style={styles.profileImage}
        />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.username}>{item.user.username}</Text>
        <Text style={styles.age}>{item.user.age} years old</Text>
        <Text style={styles.location}>{item.user.location}</Text>
        <Text style={styles.bio}>{item.user.bio}</Text>
        <Text style={styles.matchScore}>Match Score: {item.matchScore}%</Text>
        
        {item.sharedContent.length > 0 && (
          <View style={styles.sharedContent}>
            <Text style={styles.sharedTitle}>Shared Shows:</Text>
            {item.sharedContent.map((content, index) => (
              <Text key={index} style={styles.sharedItem}>
                • {content.title}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleLike(item.user.id)}
          >
            <Text style={styles.actionText}>Like ❤️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            onPress={() => handleSuperLike(item.user.id)}
          >
            <Text style={styles.actionText}>Super Like ⭐</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.matchId}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1014',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e50914',
    padding: 20,
    textAlign: 'center',
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  age: {
    fontSize: 16,
    color: '#999',
    marginBottom: 3,
  },
  location: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  matchScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e50914',
    marginBottom: 10,
  },
  sharedContent: {
    marginTop: 10,
    marginBottom: 15,
  },
  sharedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  sharedItem: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  likeButton: {
    backgroundColor: '#e50914',
  },
  superLikeButton: {
    backgroundColor: '#ffa500',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default MatchesScreen;
```

## Navigation Setup

Create `src/navigation/AppNavigator.js`:

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MatchesScreen from '../screens/MatchesScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#1e1e24' },
        tabBarActiveTintColor: '#e50914',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#1e1e24' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Running the App

### iOS

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npx react-native run-ios

# Run on specific device
npx react-native run-ios --device "iPhone 14"
```

### Android

```bash
# Run on Android emulator
npx react-native run-android

# Run on connected device
npx react-native run-android --device
```

## Building for Production

### iOS

1. Open `ios/NetflixAndChillMobile.xcworkspace` in Xcode
2. Select "Product" → "Archive"
3. Upload to App Store Connect

### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

## Features to Implement

1. **Photo Upload**: Use `react-native-image-picker`
2. **Location Services**: Use `@react-native-community/geolocation`
3. **Push Notifications**: Use `@react-native-firebase/messaging`
4. **Swipe Gestures**: Use `react-native-gesture-handler`
5. **Chat**: Use `react-native-gifted-chat`

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Native Elements](https://reactnativeelements.com/)
