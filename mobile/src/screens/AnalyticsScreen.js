import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import api from '../services/api';
import { colors, typography, spacing } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useContext(UserContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getSwipeAnalytics(user.id);
      if (response.success && response.analytics) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Set empty analytics on error
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  const stats = analytics || {};
  const totalSwipes = (stats.totalLikes || 0) + (stats.totalDislikes || 0);
  const likePercentage = totalSwipes > 0 
    ? Math.round(((stats.totalLikes || 0) / totalSwipes) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Swipe Analytics 📊</Text>
          <Text style={styles.headerSubtitle}>
            Track your movie preferences and activity
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.totalLikes || 0}</Text>
            <Text style={styles.summaryLabel}>Movies Liked</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.totalDislikes || 0}</Text>
            <Text style={styles.summaryLabel}>Movies Passed</Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalSwipes}</Text>
            <Text style={styles.summaryLabel}>Total Swipes</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{likePercentage}%</Text>
            <Text style={styles.summaryLabel}>Like Rate</Text>
          </View>
        </View>

        {/* Top Genres */}
        {stats.topGenres && stats.topGenres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Genres</Text>
            {stats.topGenres.slice(0, 5).map((genre, index) => (
              <View key={index} style={styles.genreCard}>
                <View style={styles.genreInfo}>
                  <Text style={styles.genreName}>{genre.name}</Text>
                  <Text style={styles.genreCount}>{genre.count} movies</Text>
                </View>
                <View style={styles.genreBar}>
                  <View 
                    style={[
                      styles.genreBarFill, 
                      { width: `${(genre.count / stats.topGenres[0].count) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {stats.recentLikes && stats.recentLikes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Liked Movies</Text>
            {stats.recentLikes.slice(0, 5).map((movie, index) => (
              <View key={index} style={styles.movieCard}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                {movie.genres && (
                  <Text style={styles.movieGenres}>
                    {Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Average per day</Text>
              <Text style={styles.statValue}>
                {stats.avgSwipesPerDay ? Math.round(stats.avgSwipesPerDay) : 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Most active day</Text>
              <Text style={styles.statValue}>
                {stats.mostActiveDay || 'N/A'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total matches found</Text>
              <Text style={styles.statValue}>
                {stats.totalMatches || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Match rate</Text>
              <Text style={styles.statValue}>
                {stats.matchRate ? `${Math.round(stats.matchRate)}%` : '0%'}
              </Text>
            </View>
          </View>
        </View>

        {/* Empty State */}
        {totalSwipes === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyText}>No analytics yet</Text>
            <Text style={styles.emptySubtext}>
              Start swiping on movies to see your analytics!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  genreCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  genreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  genreName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  genreCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  genreBar: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  movieCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  movieTitle: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  movieGenres: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    width: (SCREEN_WIDTH - spacing.md * 3 - spacing.md * 2) / 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
