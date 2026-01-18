const WatchInvitation = require('../models/WatchInvitation');
const DataStore = require('../utils/dataStore');
const dataStore = new DataStore();
const fs = require('fs').promises;
const path = require('path');

// NOTE: This implementation uses file-based storage which has potential race conditions
// during concurrent operations. For production use with high traffic, consider migrating
// to a database with proper transaction support (MongoDB, PostgreSQL, etc.)

// Create a new watch invitation
async function createWatchInvitation(req, res) {
  try {
    const { fromUserId, toUserId, platform, movie, scheduledDate, scheduledTime, joinLink } = req.body;

    // Validate required fields
    if (!fromUserId || !platform || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: fromUserId, platform, scheduledDate, scheduledTime' 
      });
    }

    // Validate platform
    const validPlatforms = ['teleparty', 'amazon-prime', 'disney-plus', 'scener', 'zoom'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ 
        error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ')
      });
    }

    const invitation = new WatchInvitation({
      fromUserId,
      toUserId,
      platform,
      movie,
      scheduledDate,
      scheduledTime,
      joinLink
    });

    // Load existing invitations
    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    await dataStore.ensureDataDir();
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      invitations = [];
    }
    
    invitations.push(invitation.toJSON());
    await fs.writeFile(invitationsFile, JSON.stringify(invitations, null, 2));

    res.status(201).json(invitation.toJSON());
  } catch (error) {
    console.error('Error creating watch invitation:', error);
    res.status(500).json({ error: 'Failed to create watch invitation' });
  }
}

// Get all invitations for a user (sent and received)
async function getUserInvitations(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    // Filter invitations where user is either sender or receiver
    const userInvitations = invitations.filter(inv => 
      inv.fromUserId === userId || inv.toUserId === userId
    );

    // Separate sent and received
    const sent = userInvitations.filter(inv => inv.fromUserId === userId);
    const received = userInvitations.filter(inv => inv.toUserId === userId);

    res.json({
      sent,
      received,
      all: userInvitations
    });
  } catch (error) {
    console.error('Error getting user invitations:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
}

// Get a specific invitation by ID
async function getInvitation(req, res) {
  try {
    const { invitationId } = req.params;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    const invitation = invitations.find(inv => inv.id === invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json(invitation);
  } catch (error) {
    console.error('Error getting invitation:', error);
    res.status(500).json({ error: 'Failed to get invitation' });
  }
}

// Update invitation status
async function updateInvitationStatus(req, res) {
  try {
    const { invitationId } = req.params;
    const { status, joinLink } = req.body;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'accepted', 'declined', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Update the invitation
    if (status) {
      invitations[invitationIndex].status = status;
    }
    if (joinLink) {
      invitations[invitationIndex].joinLink = joinLink;
    }
    invitations[invitationIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(invitationsFile, JSON.stringify(invitations, null, 2));

    res.json(invitations[invitationIndex]);
  } catch (error) {
    console.error('Error updating invitation:', error);
    res.status(500).json({ error: 'Failed to update invitation' });
  }
}

// Delete an invitation
async function deleteInvitation(req, res) {
  try {
    const { invitationId } = req.params;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    const filteredInvitations = invitations.filter(inv => inv.id !== invitationId);

    if (invitations.length === filteredInvitations.length) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await fs.writeFile(invitationsFile, JSON.stringify(filteredInvitations, null, 2));

    res.json({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Failed to delete invitation' });
  }
}

// Get unread invitation counts for a user
async function getUnreadInvitationCounts(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    // Count unread invitations where user is the receiver
    const unreadCount = invitations.filter(inv => 
      inv.toUserId === userId && !inv.read && inv.status === 'pending'
    ).length;

    res.json({
      success: true,
      userId,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread invitation counts:', error);
    res.status(500).json({ error: 'Failed to get unread counts' });
  }
}

// Mark invitation as read
async function markInvitationAsRead(req, res) {
  try {
    const { invitationId } = req.params;

    if (!invitationId) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Mark as read
    invitations[invitationIndex].read = true;
    invitations[invitationIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(invitationsFile, JSON.stringify(invitations, null, 2));

    res.json({
      success: true,
      invitation: invitations[invitationIndex]
    });
  } catch (error) {
    console.error('Error marking invitation as read:', error);
    res.status(500).json({ error: 'Failed to mark invitation as read' });
  }
}

// Get invitation templates for quick invites
async function getInvitationTemplates(req, res) {
  try {
    const templates = [
      {
        id: 'template_tonight',
        name: 'Tonight - Quick Watch',
        platform: 'teleparty',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '20:00',
        description: 'Watch something together tonight at 8 PM'
      },
      {
        id: 'template_weekend',
        name: 'Weekend Movie Night',
        platform: 'amazon-prime',
        scheduledDate: getNextWeekendDate(),
        scheduledTime: '19:00',
        description: 'Perfect for a weekend movie marathon'
      },
      {
        id: 'template_disney',
        name: 'Disney+ Family Night',
        platform: 'disney-plus',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '18:30',
        description: 'Family-friendly Disney content'
      },
      {
        id: 'template_lunch',
        name: 'Lunch Break Episode',
        platform: 'zoom',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '12:00',
        description: 'Quick episode during lunch'
      }
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting invitation templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
}

// Helper function to get next weekend date
function getNextWeekendDate() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = dayOfWeek === 6 ? 7 : (6 - dayOfWeek + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  return saturday.toISOString().split('T')[0];
}

// Suggest alternative times for an invitation
async function suggestAlternativeTime(req, res) {
  try {
    const { invitationId, proposedDate, proposedTime, fromUserId } = req.body;

    if (!invitationId || !proposedDate || !proposedTime || !fromUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields: invitationId, proposedDate, proposedTime, fromUserId' 
      });
    }

    const invitationsFile = path.join(__dirname, '../../data/watchInvitations.json');
    let invitations = [];
    
    try {
      const data = await fs.readFile(invitationsFile, 'utf8');
      invitations = JSON.parse(data);
    } catch (error) {
      invitations = [];
    }
    
    const invitationIndex = invitations.findIndex(inv => inv.id === invitationId);

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Add alternative time suggestion
    if (!invitations[invitationIndex].alternativeSuggestions) {
      invitations[invitationIndex].alternativeSuggestions = [];
    }

    invitations[invitationIndex].alternativeSuggestions.push({
      suggestedBy: fromUserId,
      proposedDate,
      proposedTime,
      timestamp: new Date().toISOString()
    });

    invitations[invitationIndex].updatedAt = new Date().toISOString();

    await fs.writeFile(invitationsFile, JSON.stringify(invitations, null, 2));

    res.json({
      success: true,
      invitation: invitations[invitationIndex]
    });
  } catch (error) {
    console.error('Error suggesting alternative time:', error);
    res.status(500).json({ error: 'Failed to suggest alternative time' });
  }
}

module.exports = {
  createWatchInvitation,
  getUserInvitations,
  getInvitation,
  updateInvitationStatus,
  deleteInvitation,
  getUnreadInvitationCounts,
  markInvitationAsRead,
  getInvitationTemplates,
  suggestAlternativeTime
};
