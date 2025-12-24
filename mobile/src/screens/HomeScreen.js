import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUser } from '../context/UserContext';
import ApiService from '../services/api';
import { colors, spacing, typography, borderRadius } from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const { userId } = useUser();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await ApiService.findMatches(userId);
      setMatches(response.matches || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const handleLike = async (matchedUserId) => {
    try {
      await ApiService.sendLike(userId, matchedUserId, 'like');
      Alert.alert('Success', 'Like sent! 💖');
    } catch (error) {
      console.error('Error sending like:', error);
      Alert.alert('Error', 'Failed to send like. Please try again.');
    }
  };

  const handleSuperLike = async (matchedUserId) => {
    try {
      await ApiService.sendLike(userId, matchedUserId, 'superlike');
      Alert.alert('Success', 'Super Like sent! ⭐');
    } catch (error) {
      console.error('Error sending super like:', error);
      Alert.alert('Error', 'Failed to send super like. Please try again.');
    }
  };

  const handleChat = (match) => {
    navigation.navigate('Chat', { 
      matchId: match.matchId,
      matchedUser: match.user,
    });
  };

  const renderMatch = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {item.user.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.userDetails}>
            {item.user.age} • {item.user.location}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Match</Text>
          <Text style={styles.score}>{item.matchScore}%</Text>
        </View>
      </View>

      {item.user.bio && (
        <Text style={styles.bio} numberOfLines={3}>
          {item.user.bio}
        </Text>
      )}

      {item.sharedContent && item.sharedContent.length > 0 && (
        <View style={styles.sharedContent}>
          <Text style={styles.sharedTitle}>Shared Shows & Movies:</Text>
          {item.sharedContent.slice(0, 3).map((content, index) => (
            <Text key={index} style={styles.sharedItem}>
              • {content.title}
            </Text>
          ))}
          {item.sharedContent.length > 3 && (
            <Text style={styles.moreText}>
              +{item.sharedContent.length - 3} more
            </Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleLike(item.user.id)}
        >
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => handleSuperLike(item.user.id)}
        >
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionText}>Super Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.chatButton]}
          onPress={() => handleChat(item)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No Matches Yet</Text>
      <Text style={styles.emptyText}>
        Complete your profile and add streaming preferences to find your perfect matches!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.emptyButtonText}>Complete Profile</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Finding your matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>
          {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
        </Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.matchId || item.user.id}
        contentContainerStyle={[
          styles.list,
          matches.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
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
    padding: spacing.lg,
    backgroundColor: colors.backgroundLight,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
  },
  listEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatar: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  score: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  bio: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  sharedContent: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  sharedTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  sharedItem: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  moreText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  likeButton: {
    backgroundColor: colors.primary,
  },
  superLikeButton: {
    backgroundColor: colors.accent,
  },
  chatButton: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default HomeScreen;
