import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    location: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProfile = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.age || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(formData.age) || parseInt(formData.age) < 18) {
      Alert.alert('Error', 'You must be at least 18 years old');
      return;
    }

    setLoading(true);
    try {
      await login({
        username: formData.username,
        email: formData.email,
        age: parseInt(formData.age),
        location: formData.location,
        bio: formData.bio || 'Movie lover looking for a streaming partner!',
      });

      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert(
        'Error',
        'Failed to create profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🎬</Text>
          <Text style={styles.title}>Netflix & Chill</Text>
          <Text style={styles.subtitle}>Create Your Profile</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={colors.textSecondary}
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor={colors.textSecondary}
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="City, State"
              placeholderTextColor={colors.textSecondary}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about your streaming habits..."
              placeholderTextColor={colors.textSecondary}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.backgroundCard,
    color: colors.textPrimary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioInput: {
    height: 100,
    paddingTop: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default LoginScreen;
