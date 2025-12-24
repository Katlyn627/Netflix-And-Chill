import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useUser } from '../context/UserContext';
import ApiService from '../services/api';
import { colors, spacing, typography } from '../styles/theme';

const SplashScreen = ({ navigation }) => {
  const { userId, loading } = useUser();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if onboarding is complete
        const onboardingComplete = await ApiService.isOnboardingComplete();
        
        // Wait a bit to show the splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!onboardingComplete) {
          navigation.replace('Onboarding');
        } else if (userId) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        navigation.replace('Login');
      }
    };

    if (!loading) {
      initializeApp();
    }
  }, [loading, userId]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎬</Text>
        </View>
        <Text style={styles.appName}>Netflix & Chill</Text>
        <Text style={styles.tagline}>Find Your Perfect Streaming Partner</Text>
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.loader}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 120,
    textAlign: 'center',
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
});

export default SplashScreen;
