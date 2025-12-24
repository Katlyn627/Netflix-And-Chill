import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import ApiService from '../services/api';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

const STREAMING_SERVICES = [
  'Netflix',
  'Hulu',
  'Disney+',
  'Amazon Prime',
  'HBO Max',
  'Apple TV+',
];

const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Documentary',
];

const ProfileScreen = ({ navigation }) => {
  const { user, userId, updateUser, refreshUser, logout } = useUser();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    streamingServices: [],
    favoriteGenres: [],
    bingeCount: '3',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        streamingServices: user.streamingServices || [],
        favoriteGenres: user.favoriteGenres || [],
        bingeCount: user.bingeCount?.toString() || '3',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await ApiService.updateBio(userId, formData.bio);
      
      if (formData.favoriteGenres.length > 0 || formData.bingeCount) {
        await ApiService.updatePreferences(userId, {
          favoriteGenres: formData.favoriteGenres,
          bingeCount: parseInt(formData.bingeCount) || 3,
        });
      }

      await refreshUser();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // In a real app, you would upload this to your server
      Alert.alert('Coming Soon', 'Photo upload will be implemented with your backend storage solution.');
    }
  };

  const toggleStreamingService = async (service) => {
    const newServices = formData.streamingServices.includes(service)
      ? formData.streamingServices.filter(s => s !== service)
      : [...formData.streamingServices, service];
    
    setFormData(prev => ({ ...prev, streamingServices: newServices }));
    
    if (!editing) {
      try {
        await ApiService.addStreamingService(userId, service);
        await refreshUser();
      } catch (error) {
        console.error('Error updating streaming service:', error);
      }
    }
  };

  const toggleGenre = (genre) => {
    const newGenres = formData.favoriteGenres.includes(genre)
      ? formData.favoriteGenres.filter(g => g !== genre)
      : [...formData.favoriteGenres, genre];
    
    setFormData(prev => ({ ...prev, favoriteGenres: newGenres }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {user.username?.charAt(0).toUpperCase() || '?'}
          </Text>
          <TouchableOpacity style={styles.editPhotoButton} onPress={handlePickImage}>
            <Text style={styles.editPhotoText}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.userDetails}>
          {user.age} • {user.location}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bio</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editButton}>Edit ✏️</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {editing ? (
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.bioText}>
            {user.bio || 'No bio yet. Tap edit to add one!'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Streaming Services</Text>
        <View style={styles.chipContainer}>
          {STREAMING_SERVICES.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.chip,
                formData.streamingServices.includes(service) && styles.chipActive,
              ]}
              onPress={() => toggleStreamingService(service)}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.streamingServices.includes(service) && styles.chipTextActive,
                ]}
              >
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Genres</Text>
        <View style={styles.chipContainer}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.chip,
                formData.favoriteGenres.includes(genre) && styles.chipActive,
              ]}
              onPress={() => toggleGenre(genre)}
              disabled={!editing}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.favoriteGenres.includes(genre) && styles.chipTextActive,
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Binge-Watching Count</Text>
        <Text style={styles.sectionSubtitle}>
          How many episodes do you typically watch in one sitting?
        </Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={formData.bingeCount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bingeCount: text }))}
            keyboardType="numeric"
            placeholder="e.g., 3"
            placeholderTextColor={colors.textSecondary}
          />
        ) : (
          <Text style={styles.valueText}>{user.bingeCount || 3} episodes</Text>
        )}
      </View>

      {editing && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setEditing(false);
              setFormData({
                bio: user.bio || '',
                streamingServices: user.streamingServices || [],
                favoriteGenres: user.favoriteGenres || [],
                bingeCount: user.bingeCount?.toString() || '3',
              });
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundLight,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.backgroundCard,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editPhotoText: {
    fontSize: 16,
  },
  username: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userDetails: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  editButton: {
    color: colors.primary,
    fontSize: 16,
  },
  bioText: {
    ...typography.body,
    color: colors.textLight,
    lineHeight: 24,
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
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  valueText: {
    ...typography.body,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default ProfileScreen;
