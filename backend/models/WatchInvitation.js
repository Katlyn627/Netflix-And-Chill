const crypto = require('crypto');

class WatchInvitation {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.fromUserId = data.fromUserId; // User who created the invitation
    this.toUserId = data.toUserId || null; // User being invited (can be null for general invites)
    this.platform = data.platform; // 'teleparty', 'amazon-prime', 'disney-plus', 'scener', 'zoom'
    this.movie = data.movie || null; // Movie/show object with title, tmdbId, posterPath
    this.scheduledDate = data.scheduledDate; // ISO date string
    this.scheduledTime = data.scheduledTime; // Time string (e.g., "19:30")
    this.joinLink = data.joinLink || null; // Platform-specific join link
    this.status = data.status || 'pending'; // 'pending', 'accepted', 'declined', 'cancelled'
    this.instructions = data.instructions || this.generateInstructions();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    // Use crypto.randomUUID for secure, unique ID generation
    return 'watch_' + crypto.randomUUID();
  }

  generateInstructions() {
    const platformInstructions = {
      'teleparty': [
        'Install the Teleparty browser extension (Chrome, Edge, or Opera)',
        'Open Netflix and start playing your selected movie/show',
        'Click the Teleparty extension icon',
        'Click "Start Party" and share the party link',
        'Wait for your partner to join using the link'
      ],
      'amazon-prime': [
        'Make sure both users have Amazon Prime Video accounts',
        'Open Amazon Prime Video and find your selected movie/show',
        'Click the Watch Party icon',
        'Create a watch party and copy the invitation link',
        'Share the link with your partner'
      ],
      'disney-plus': [
        'Ensure both users have Disney+ accounts',
        'Open Disney+ and find your selected movie/show',
        'Click on the GroupWatch icon',
        'Start the GroupWatch session',
        'Share the invitation link with your partner'
      ],
      'scener': [
        'Install the Scener browser extension',
        'Create or join a Scener theater',
        'Select your streaming service and content',
        'Invite your partner using the theater link',
        'Enable video chat if desired'
      ],
      'zoom': [
        'Create a Zoom meeting for the scheduled time',
        'Share your screen with your partner',
        'Open your streaming service and start the movie/show',
        'Both participants can watch together via screen share',
        'Use Zoom\'s audio to chat during the watch session'
      ]
    };

    return platformInstructions[this.platform] || [];
  }

  getPlatformName() {
    const platformNames = {
      'teleparty': 'Teleparty (Netflix Party)',
      'amazon-prime': 'Amazon Prime Watch Party',
      'disney-plus': 'Disney+ GroupWatch',
      'scener': 'Scener',
      'zoom': 'Zoom (Screen Share)'
    };
    return platformNames[this.platform] || this.platform;
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }

  setJoinLink(link) {
    this.joinLink = link;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      platform: this.platform,
      platformName: this.getPlatformName(),
      movie: this.movie,
      scheduledDate: this.scheduledDate,
      scheduledTime: this.scheduledTime,
      joinLink: this.joinLink,
      status: this.status,
      instructions: this.instructions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = WatchInvitation;
