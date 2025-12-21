// Stream Chat service for real-time messaging
const { StreamChat } = require('stream-chat');

// Constants
const INVALID_API_KEY_ERROR = 'api_key not valid';

class StreamChatService {
    constructor() {
        this.client = null;
        this.isConfigured = false;
        this.initialize();
    }

    initialize() {
        try {
            const apiKey = process.env.STREAM_API_KEY;
            const apiSecret = process.env.STREAM_API_SECRET;
            const appId = process.env.STREAM_APP_ID;

            // Check if credentials are missing
            if (!apiKey || !apiSecret || !appId) {
                console.warn('⚠️  Stream Chat configuration incomplete.');
                console.warn('⚠️  Chat features will use fallback storage until configured.');
                console.warn('📖 See CHAT_SETUP_GUIDE.md for setup instructions.');
                return;
            }

            // Check for placeholder values (e.g., YOUR_STREAM_API_KEY)
            // At this point, we know all credentials are truthy from the check above
            if (apiKey.includes('YOUR_') || apiSecret.includes('YOUR_') || appId.includes('YOUR_')) {
                console.warn('⚠️  Stream Chat configuration using placeholder values.');
                console.warn('⚠️  Chat features will use fallback storage until configured.');
                console.warn('📖 See CHAT_SETUP_GUIDE.md for setup instructions.');
                return;
            }

            // Initialize Stream Chat client with server-side credentials
            this.client = StreamChat.getInstance(apiKey, apiSecret);
            this.isConfigured = true;
            console.log('✅ Stream Chat initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Stream Chat:', error.message);
            console.warn('⚠️  Chat features will use fallback storage.');
            this.isConfigured = false;
            this.client = null;
        }
    }

    /**
     * Handle invalid API key errors by disabling Stream Chat
     * @private
     */
    handleInvalidApiKeyError() {
        console.error('❌ Stream Chat API key is invalid. Disabling Stream Chat.');
        console.warn('⚠️  Please check your STREAM_API_KEY and STREAM_API_SECRET in .env file.');
        console.warn('📖 See CHAT_SETUP_GUIDE.md for setup instructions.');
        this.isConfigured = false;
        this.client = null;
    }

    /**
     * Check if an error is caused by an invalid API key
     * @private
     * @param {Error} error - The error to check
     * @returns {boolean} - True if the error is caused by an invalid API key
     */
    isInvalidApiKeyError(error) {
        return error.message && error.message.includes(INVALID_API_KEY_ERROR);
    }

    /**
     * Create a user token for authentication
     * @param {string} userId - The user's unique ID
     * @returns {string} - JWT token for Stream Chat authentication
     */
    createUserToken(userId) {
        if (!this.isConfigured || !this.client) {
            throw new Error('Stream Chat is not configured');
        }
        return this.client.createToken(userId);
    }

    /**
     * Create or update a user in Stream Chat
     * @param {Object} user - User object with id, name, and optional image
     */
    async upsertUser(user) {
        if (!this.isConfigured || !this.client) {
            console.log('Stream Chat not configured, skipping user upsert');
            return null;
        }

        try {
            const streamUser = {
                id: user.id,
                name: user.username || user.name,
                image: user.profilePicture || undefined,
            };

            await this.client.upsertUser(streamUser);
            console.log(`✅ User ${user.id} upserted in Stream Chat`);
            return streamUser;
        } catch (error) {
            // If API key is invalid, disable Stream Chat and use fallback
            if (this.isInvalidApiKeyError(error)) {
                this.handleInvalidApiKeyError();
                return null;
            }
            console.error('Error upserting user in Stream Chat:', error.message);
            throw error;
        }
    }

    /**
     * Create a channel between two users
     * @param {string} userId1 - First user ID
     * @param {string} userId2 - Second user ID
     * @returns {Object} - Channel information
     */
    async createOrGetChannel(userId1, userId2) {
        if (!this.isConfigured || !this.client) {
            console.log('Stream Chat not configured, skipping channel creation');
            return null;
        }

        try {
            // Create a unique channel ID based on user IDs (sorted to ensure consistency)
            const channelId = [userId1, userId2].sort().join('_');
            
            const channel = this.client.channel('messaging', channelId, {
                members: [userId1, userId2],
                created_by_id: userId1,
            });

            await channel.create();
            console.log(`✅ Channel created/retrieved: ${channelId}`);
            return {
                channelId,
                channelType: 'messaging',
            };
        } catch (error) {
            // If API key is invalid, disable Stream Chat and use fallback
            if (this.isInvalidApiKeyError(error)) {
                this.handleInvalidApiKeyError();
                return null;
            }
            console.error('Error creating channel:', error.message);
            throw error;
        }
    }

    /**
     * Send a message to a channel
     * @param {string} channelId - Channel ID
     * @param {string} senderId - Sender's user ID
     * @param {string} message - Message text
     */
    async sendMessage(channelId, senderId, message) {
        if (!this.isConfigured || !this.client) {
            console.log('Stream Chat not configured, skipping message send');
            return null;
        }

        try {
            const channel = this.client.channel('messaging', channelId);
            const response = await channel.sendMessage({
                text: message,
                user_id: senderId,
            });

            console.log(`✅ Message sent to channel ${channelId}`);
            return response.message;
        } catch (error) {
            // If API key is invalid, disable Stream Chat and use fallback
            if (this.isInvalidApiKeyError(error)) {
                this.handleInvalidApiKeyError();
                return null;
            }
            console.error('Error sending message:', error.message);
            throw error;
        }
    }

    /**
     * Get messages from a channel
     * @param {string} channelId - Channel ID
     * @param {number} limit - Number of messages to retrieve
     */
    async getMessages(channelId, limit = 50) {
        if (!this.isConfigured || !this.client) {
            console.log('Stream Chat not configured, skipping message retrieval');
            return [];
        }

        try {
            const channel = this.client.channel('messaging', channelId);
            await channel.watch();
            
            const response = await channel.query({
                messages: { limit },
            });

            return response.messages || [];
        } catch (error) {
            // If API key is invalid, disable Stream Chat and use fallback
            if (this.isInvalidApiKeyError(error)) {
                this.handleInvalidApiKeyError();
                return [];
            }
            console.error('Error getting messages:', error.message);
            throw error;
        }
    }

    /**
     * Check if Stream Chat is configured and ready
     */
    isReady() {
        return this.isConfigured && this.client !== null;
    }
}

// Create singleton instance
const streamChatService = new StreamChatService();

module.exports = streamChatService;
