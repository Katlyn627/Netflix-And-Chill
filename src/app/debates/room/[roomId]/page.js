'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function DebateRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId;
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    // Get or create userId
    let uid = localStorage.getItem('userId');
    if (!uid) {
      uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', uid);
    }
    setUserId(uid);

    fetchRoom();
    fetchMessages();
    joinRoom(uid);

    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/debates/rooms/${roomId}`);
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/debates/rooms/${roomId}/messages?limit=100`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const joinRoom = async (uid) => {
    try {
      await fetch(`/api/debates/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      });
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/debates/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading debate room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Room not found</div>
        <button onClick={() => router.push('/debates/topics')} style={styles.backBtn}>
          ← Back to Topics
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => router.push('/debates/topics')} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.roomInfo}>
          <h1 style={styles.title}>{room.title}</h1>
          <p style={styles.topic}>{room.topic}</p>
          <div style={styles.meta}>
            <span style={styles.metaItem}>📂 {room.category}</span>
            <span style={styles.metaItem}>👥 {room.participants?.length || 0} participants</span>
            <span style={styles.metaItem}>💬 {messages.length} messages</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div style={styles.messagesContainer}>
        <div style={styles.messagesList}>
          {messages.length === 0 ? (
            <div style={styles.emptyMessages}>
              <p>No messages yet. Be the first to share your thoughts! 💭</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg._id || index}
                style={{
                  ...styles.messageCard,
                  ...(msg.userId === userId ? styles.messageCardOwn : {}),
                }}
              >
                <div style={styles.messageHeader}>
                  <span style={styles.username}>
                    {msg.username || 'Anonymous'}
                    {msg.userId === userId && ' (You)'}
                  </span>
                  <span style={styles.timestamp}>
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                <p style={styles.messageText}>{msg.message}</p>
                {msg.likes && msg.likes.length > 0 && (
                  <div style={styles.likes}>
                    ❤️ {msg.likes.length}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Share your thoughts on this debate..."
          style={styles.input}
          disabled={sending}
          maxLength={1000}
        />
        <button
          type="submit"
          style={{
            ...styles.sendBtn,
            ...(sending || !newMessage.trim() ? styles.sendBtnDisabled : {}),
          }}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? '...' : '→'}
        </button>
      </form>

      {/* Participants Sidebar (optional) */}
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Participants ({room.participants?.length || 0})</h3>
        <div style={styles.participantsList}>
          {room.participants?.slice(0, 10).map((participant, index) => (
            <div key={participant._id || index} style={styles.participant}>
              <div style={styles.participantAvatar}>
                {participant.userId?.displayName?.[0] || '?'}
              </div>
              <span style={styles.participantName}>
                {participant.userId?.displayName || 'User'}
              </span>
            </div>
          ))}
          {room.participants?.length > 10 && (
            <div style={styles.moreParticipants}>
              +{room.participants.length - 10} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  header: {
    background: '#1a1a1a',
    borderBottom: '2px solid #333',
    padding: '20px',
  },
  backBtn: {
    background: 'transparent',
    color: '#667eea',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '15px',
    padding: '5px 10px',
  },
  roomInfo: {
    maxWidth: '900px',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  topic: {
    fontSize: '1rem',
    color: '#999',
    marginBottom: '15px',
  },
  meta: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.9rem',
    color: '#666',
  },
  metaItem: {
    display: 'inline-block',
  },
  messagesContainer: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: '20px',
  },
  messagesList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    paddingRight: '10px',
  },
  emptyMessages: {
    textAlign: 'center',
    color: '#666',
    padding: '50px 20px',
    fontSize: '1.1rem',
  },
  messageCard: {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '15px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageCardOwn: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
    borderColor: '#667eea50',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '0.85rem',
  },
  username: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#666',
  },
  messageText: {
    margin: 0,
    lineHeight: '1.5',
    wordWrap: 'break-word',
  },
  likes: {
    marginTop: '8px',
    fontSize: '0.85rem',
    color: '#999',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    background: '#1a1a1a',
    borderTop: '2px solid #333',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  },
  input: {
    flex: 1,
    padding: '15px',
    background: '#0a0a0a',
    border: '2px solid #333',
    borderRadius: '25px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  sendBtn: {
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    minWidth: '60px',
  },
  sendBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  sidebar: {
    position: 'fixed',
    right: '20px',
    top: '140px',
    width: '200px',
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  sidebarTitle: {
    fontSize: '1rem',
    marginBottom: '15px',
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
  },
  participantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  participant: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  participantAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: '0.9rem',
    color: '#999',
  },
  moreParticipants: {
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '5px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '1.2rem',
    color: '#999',
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '1.2rem',
    color: '#f44336',
  },
};
