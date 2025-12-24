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

const RecommendationsScreen = () => {
  const { userId } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await ApiService.getRecommendations(userId, 20);
      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecommendations();
  };

  const handleAddToWatchlist = async (item) => {
    try {
      await ApiService.addWatchHistory(userId, {
        title: item.title,
        type: item.type,
        genre: item.genre,
      });
      Alert.alert('Added!', `${item.title} has been added to your watch history.`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      Alert.alert('Error', 'Failed to add to watchlist. Please try again.');
    }
  };

  const renderRecommendation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{item.type === 'movie' ? '🎬' : '📺'}</Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          {item.genre && (
            <Text style={styles.genre}>{item.genre}</Text>
          )}
          {item.reason && (
            <Text style={styles.reason}>{item.reason}</Text>
          )}
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {item.type === 'movie' ? 'Movie' : 'TV Show'}
              </Text>
            </View>
            {item.matchScore && (
              <View style={[styles.tag, styles.scoreTag]}>
                <Text style={[styles.tagText, styles.scoreText]}>
                  {item.matchScore}% Match
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToWatchlist(item)}
      >
        <Text style={styles.addButtonText}>+ Add to Watchlist</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎭</Text>
      <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
      <Text style={styles.emptyText}>
        Add more shows and movies to your watch history to get personalized recommendations!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recommended for You</Text>
        <Text style={styles.headerSubtitle}>
          Based on your watch history and preferences
        </Text>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderRecommendation}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={[
          styles.list,
          recommendations.length === 0 && styles.listEmpty,
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
  cardContent: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  genre: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reason: {
    ...typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundLight,
  },
  scoreTag: {
    backgroundColor: colors.primary + '20',
  },
  tagText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  scoreText: {
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
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
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default RecommendationsScreen;
