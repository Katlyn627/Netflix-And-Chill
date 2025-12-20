// Stream Chat Client Integration
// This file handles Stream Chat on the client side

(function() {
    'use strict';

    let streamClient = null;
    let currentChannel = null;
    let currentUserId = null;

    // Initialize Stream Chat client
    async function initializeStreamChat(userId) {
        try {
            currentUserId = userId;

            // Check if Stream Chat SDK is loaded
            if (typeof StreamChat === 'undefined') {
                console.warn('Stream Chat SDK not loaded. Using fallback chat.');
                return false;
            }

            // Get Stream token from backend
            const response = await fetch(`${window.API_BASE_URL || 'http://localhost:3000/api'}/chat/token/${userId}`);
            const data = await response.json();

            if (!data.success || !data.token || !data.apiKey) {
                console.warn('⚠️  Stream Chat not configured. Using fallback chat storage.');
                console.warn('📖 See CHAT_SETUP_GUIDE.md for Stream Chat setup instructions.');
                return false;
            }

            // Initialize Stream Chat client
            streamClient = StreamChat.getInstance(data.apiKey);

            // Connect user to Stream Chat
            await streamClient.connectUser(
                {
                    id: userId,
                },
                data.token
            );

            console.log('✅ Stream Chat initialized successfully');
            return true;
        } catch (error) {
            console.warn('Stream Chat initialization failed:', error.message);
            streamClient = null;
            return false;
        }
    }

    // Create or get a channel with another user
    async function getChannel(userId, matchUserId, matchUsername) {
        if (!streamClient) {
            console.log('Stream Chat not initialized');
            return null;
        }

        try {
            // Create channel ID (sorted to ensure consistency)
            const channelId = [userId, matchUserId].sort().join('_');

            // Create or get channel
            const channel = streamClient.channel('messaging', channelId, {
                members: [userId, matchUserId],
                name: `Chat with ${matchUsername}`,
            });

            await channel.watch();
            currentChannel = channel;

            console.log(`✅ Channel ready: ${channelId}`);
            return channel;
        } catch (error) {
            console.error('Error getting channel:', error.message);
            return null;
        }
    }

    // Send a message in the current channel
    async function sendMessage(message) {
        if (!currentChannel) {
            throw new Error('No active channel');
        }

        try {
            await currentChannel.sendMessage({
                text: message,
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending message:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Listen for new messages in the current channel
    function onMessage(callback) {
        if (!currentChannel) {
            console.warn('No active channel for listening');
            return () => {};
        }

        currentChannel.on('message.new', (event) => {
            callback(event.message);
        });

        // Return unsubscribe function
        return () => {
            if (currentChannel) {
                currentChannel.off('message.new');
            }
        };
    }

    // Get message history from current channel
    async function getMessageHistory(limit = 50) {
        if (!currentChannel) {
            return [];
        }

        try {
            const response = await currentChannel.query({
                messages: { limit },
            });

            return response.messages || [];
        } catch (error) {
            console.error('Error getting message history:', error.message);
            return [];
        }
    }

    // Disconnect from Stream Chat
    async function disconnect() {
        if (streamClient) {
            try {
                await streamClient.disconnectUser();
                console.log('✅ Disconnected from Stream Chat');
            } catch (error) {
                console.error('Error disconnecting from Stream Chat:', error.message);
            }
            streamClient = null;
            currentChannel = null;
        }
    }

    // Mark messages as read
    async function markAsRead() {
        if (!currentChannel) {
            return;
        }

        try {
            await currentChannel.markRead();
        } catch (error) {
            console.error('Error marking as read:', error.message);
        }
    }

    // Listen for typing indicators
    function onTyping(callback) {
        if (!currentChannel) {
            console.warn('No active channel for typing indicators');
            return () => {};
        }

        currentChannel.on('typing.start', (event) => {
            callback({ typing: true, user: event.user });
        });

        currentChannel.on('typing.stop', (event) => {
            callback({ typing: false, user: event.user });
        });

        return () => {
            if (currentChannel) {
                currentChannel.off('typing.start');
                currentChannel.off('typing.stop');
            }
        };
    }

    // Send typing indicator
    async function sendTypingIndicator(isTyping) {
        if (!currentChannel) {
            return;
        }

        try {
            if (isTyping) {
                await currentChannel.keystroke();
            } else {
                await currentChannel.stopTyping();
            }
        } catch (error) {
            console.error('Error sending typing indicator:', error.message);
        }
    }

    // Export Stream Chat utilities
    window.StreamChatClient = {
        initialize: initializeStreamChat,
        getChannel,
        sendMessage,
        onMessage,
        getMessageHistory,
        disconnect,
        markAsRead,
        onTyping,
        sendTypingIndicator,
        isInitialized: () => streamClient !== null
    };
})();
