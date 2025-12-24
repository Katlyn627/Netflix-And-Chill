import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import api from '../services/api';
import { colors, typography, spacing } from '../styles/theme';

export default function WatchTogetherScreen() {
  const { user } = useContext(UserContext);
  const [invitations, setInvitations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadInvitations(), loadMatches()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await api.getWatchInvitations(user.id);
      if (response.success && response.invitations) {
        setInvitations(response.invitations);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await api.findMatches(user.id);
      if (response.success && response.matches) {
        setMatches(response.matches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateInvitation = (matchId, matchName) => {
    Alert.prompt(
      'Create Watch Party',
      `Invite ${matchName} to watch together`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Invite',
          onPress: (movieTitle) => sendInvitation(matchId, movieTitle),
        },
      ],
      'plain-text',
      '',
      'default',
      'Enter movie/show title'
    );
  };

  const sendInvitation = async (toUserId, movieTitle) => {
    if (!movieTitle || movieTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a movie or show title');
      return;
    }

    try {
      const invitationData = {
        fromUserId: user.id,
        toUserId,
        movieTitle: movieTitle.trim(),
        platform: 'netflix', // Default platform
        proposedDate: new Date().toISOString(),
      };

      const response = await api.createWatchInvitation(invitationData);
      if (response.success) {
        Alert.alert('Success', 'Watch party invitation sent!');
        loadInvitations();
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      Alert.alert('Error', 'Failed to send invitation');
    }
  };

  const handleRespondToInvitation = (invitationId, accepted) => {
    Alert.alert(
      accepted ? 'Accept Invitation' : 'Decline Invitation',
      `Are you sure you want to ${accepted ? 'accept' : 'decline'} this invitation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: accepted ? 'Accept' : 'Decline',
          onPress: () => respondToInvitation(invitationId, accepted),
        },
      ]
    );
  };

  const respondToInvitation = async (invitationId, accepted) => {
    try {
      const response = await api.respondToInvitation(invitationId, accepted ? 'accepted' : 'declined');
      if (response.success) {
        Alert.alert('Success', `Invitation ${accepted ? 'accepted' : 'declined'}`);
        loadInvitations();
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      Alert.alert('Error', 'Failed to respond to invitation');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Watch Together 📺</Text>
          <Text style={styles.headerSubtitle}>
            Coordinate watch parties with your matches
          </Text>
        </View>

        {/* Invitations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Invitations</Text>
          {invitations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No invitations yet</Text>
              <Text style={styles.emptySubtext}>
                Send invites to your matches below!
              </Text>
            </View>
          ) : (
            invitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <Text style={styles.invitationTitle}>
                    {invitation.movieTitle || 'Untitled'}
                  </Text>
                  <Text style={styles.invitationStatus}>
                    {invitation.status}
                  </Text>
                </View>
                <Text style={styles.invitationUser}>
                  {invitation.fromUserId === user.id
                    ? `To: ${invitation.toUserName || 'User'}`
                    : `From: ${invitation.fromUserName || 'User'}`}
                </Text>
                <Text style={styles.invitationPlatform}>
                  Platform: {invitation.platform || 'Not specified'}
                </Text>
                
                {invitation.toUserId === user.id && invitation.status === 'pending' && (
                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleRespondToInvitation(invitation.id, true)}
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={() => handleRespondToInvitation(invitation.id, false)}
                    >
                      <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Matches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Invitations</Text>
          {matches.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No matches yet</Text>
              <Text style={styles.emptySubtext}>
                Find matches first to send watch party invites
              </Text>
            </View>
          ) : (
            matches.slice(0, 10).map((match) => (
              <View key={match.userId} style={styles.matchCard}>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchName}>
                    {match.username || 'User'}
                  </Text>
                  <Text style={styles.matchScore}>
                    Match: {match.score}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={() => handleCreateInvitation(match.userId, match.username)}
                >
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            1. Select a match and send them a watch party invitation{'\n'}
            2. Specify what you want to watch together{'\n'}
            3. Your match will receive the invitation{'\n'}
            4. Once accepted, coordinate the details via chat{'\n'}
            5. Use platforms like Teleparty, Discord, or Zoom to watch together
          </Text>
        </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  invitationCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  invitationTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  invitationStatus: {
    ...typography.caption,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  invitationUser: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  invitationPlatform: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  invitationActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  matchCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  matchScore: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inviteButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  inviteButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  infoSection: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
