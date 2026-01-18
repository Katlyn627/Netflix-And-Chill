const express = require('express');
const router = express.Router();
const {
  createWatchInvitation,
  getUserInvitations,
  getInvitation,
  updateInvitationStatus,
  deleteInvitation,
  getUnreadInvitationCounts,
  markInvitationAsRead
} = require('../controllers/watchInvitationController');

// TODO: Add rate limiting to all routes for production deployment
// Consider using express-rate-limit middleware to prevent abuse

// Create a new watch invitation
router.post('/', createWatchInvitation);

// Get unread invitation counts for a user
router.get('/unread/:userId', getUnreadInvitationCounts);

// Get all invitations for a user (sent and received)
router.get('/user/:userId', getUserInvitations);

// Get a specific invitation by ID
router.get('/:invitationId', getInvitation);

// Update invitation status or join link
router.put('/:invitationId', updateInvitationStatus);

// Mark invitation as read
router.put('/:invitationId/read', markInvitationAsRead);

// Delete an invitation
router.delete('/:invitationId', deleteInvitation);

module.exports = router;
