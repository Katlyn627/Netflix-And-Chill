import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import api from '../services/api';
import { colors, typography, spacing } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function SwipeScreen() {
  const { user } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalLikes: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?.id) {
      loadMovies();
      loadStats();
    }
  }, [user]);

  const loadMovies = async (pageNum = page) => {
    try {
      setLoading(true);
      const response = await api.getSwipeMovies(user.id, 20, pageNum);
      if (response.success && response.movies) {
        setMovies(response.movies);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      Alert.alert('Error', 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getSwipeStats(user.id);
      if (response.success) {
        setStats({ totalLikes: response.totalLikes || 0 });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSwipe = async (action) => {
    if (currentIndex >= movies.length) return;

    const movie = movies[currentIndex];
    try {
      await api.swipeMovie(user.id, movie.id, action);
      
      if (action === 'like') {
        setStats(prev => ({ ...prev, totalLikes: prev.totalLikes + 1 }));
      }

      // Move to next movie
      if (currentIndex < movies.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Load more movies
        const nextPage = page + 1;
        setPage(nextPage);
        loadMovies(nextPage);
      }
    } catch (error) {
      console.error('Error swiping movie:', error);
      // Still move to next movie even if error
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentMovie = movies[currentIndex];

  if (loading && movies.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      </View>
    );
  }

  if (!currentMovie) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>No more movies!</Text>
          <Text style={styles.emptySubtext}>Check back later for more</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMovies}>
            <Text style={styles.retryButtonText}>Reload Movies</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Header */}
        <View style={styles.statsHeader}>
          <Text style={styles.statsText}>Movies liked: {stats.totalLikes}</Text>
        </View>

        {/* Movie Card */}
        <View style={styles.card}>
          {currentMovie.poster_path ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.poster, styles.noPoster]}>
              <Text style={styles.noPosterText}>🎬</Text>
            </View>
          )}

          <View style={styles.movieInfo}>
            <Text style={styles.title}>{currentMovie.title}</Text>
            
            {currentMovie.release_date && (
              <Text style={styles.year}>
                {new Date(currentMovie.release_date).getFullYear()}
              </Text>
            )}

            {currentMovie.vote_average > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {currentMovie.vote_average.toFixed(1)}</Text>
              </View>
            )}

            {currentMovie.overview && (
              <ScrollView style={styles.overviewScroll}>
                <Text style={styles.overview}>{currentMovie.overview}</Text>
              </ScrollView>
            )}
          </View>
        </View>

        {/* Swipe Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton]}
            onPress={() => handleSwipe('dislike')}
          >
            <Text style={styles.actionIcon}>✕</Text>
            <Text style={styles.actionText}>Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipe('like')}
          >
            <Text style={styles.actionIcon}>♥</Text>
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.progressText}>
          {currentIndex + 1} / {movies.length}
        </Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  statsHeader: {
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  statsText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  poster: {
    width: '100%',
    height: 400,
    backgroundColor: colors.background,
  },
  noPoster: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosterText: {
    fontSize: 64,
  },
  movieInfo: {
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  year: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    ...typography.body,
    color: colors.accent,
  },
  overviewScroll: {
    maxHeight: 100,
  },
  overview: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dislikeButton: {
    backgroundColor: '#666',
  },
  likeButton: {
    backgroundColor: colors.primary,
  },
  actionIcon: {
    fontSize: 32,
    color: '#fff',
  },
  actionText: {
    ...typography.caption,
    color: '#fff',
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
