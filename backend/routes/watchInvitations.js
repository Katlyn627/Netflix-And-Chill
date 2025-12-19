const express = require('express');
const router = express.Router();
const {
  createWatchInvitation,
  getUserInvitations,
  getInvitation,
  updateInvitationStatus,
  deleteInvitation
} = require('../controllers/watchInvitationController');

// Create a new watch invitation
router.post('/', createWatchInvitation);

// Get all invitations for a user (sent and received)
router.get('/user/:userId', getUserInvitations);

// Get a specific invitation by ID
router.get('/:invitationId', getInvitation);

// Update invitation status or join link
router.put('/:invitationId', updateInvitationStatus);

// Delete an invitation
router.delete('/:invitationId', deleteInvitation);

module.exports = router;
