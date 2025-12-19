'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebateTopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: '🎬' },
    { id: 'hot-takes', name: 'Hot Takes', icon: '🔥' },
    { id: 'director-showdown', name: 'Director Showdown', icon: '🎬' },
    { id: 'genre-debate', name: 'Genre Debates', icon: '🎭' },
    { id: 'best-of-decade', name: 'Best of Decade', icon: '📅' },
    { id: 'overrated-underrated', name: 'Overrated/Underrated', icon: '📉' },
    { id: 'plot-holes', name: 'Plot Holes', icon: '🕳️' },
    { id: 'character-analysis', name: 'Character Analysis', icon: '🦹' },
    { id: 'cinematography', name: 'Cinematography', icon: '📸' },
    { id: 'soundtracks', name: 'Soundtracks', icon: '🎵' },
    { id: 'remakes-vs-originals', name: 'Remakes vs Originals', icon: '🔄' },
    { id: 'franchise-discussion', name: 'Franchise Discussion', icon: '⭐' },
    { id: 'casting-choices', name: 'Casting Choices', icon: '🎭' },
  ];

  useEffect(() => {
    fetchTopics();
    fetchRooms();
  }, [selectedCategory]);

  const fetchTopics = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? '/api/debates/topics' 
        : `/api/debates/topics?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all' 
        ? '/api/debates/rooms' 
        : `/api/debates/rooms?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (topic) => {
    setSelectedTopic(topic);
    setShowCreateModal(true);
  };

  const handleJoinRoom = (roomId) => {
    router.push(`/debates/room/${roomId}`);
  };

  const submitCreateRoom = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // In a real app, get userId from auth context
    const userId = localStorage.getItem('userId') || 'demo-user-id';
    
    try {
      const res = await fetch('/api/debates/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          topic: formData.get('topic'),
          category: selectedTopic?.category || selectedCategory,
          description: formData.get('description'),
          createdBy: userId,
        }),
      });
      
      const data = await res.json();
      if (data.room) {
        setShowCreateModal(false);
        router.push(`/debates/room/${data.room._id}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎬 Movie Debates & Hot Takes</h1>
        <p style={styles.subtitle}>Join the conversation about cinema, share your hot takes, and debate with fellow movie lovers!</p>
      </header>

      {/* Category Filter */}
      <div style={styles.categoryContainer}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              ...styles.categoryBtn,
              ...(selectedCategory === cat.id ? styles.categoryBtnActive : {}),
            }}
          >
            <span style={styles.categoryIcon}>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Suggested Topics */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>💡 Suggested Topics</h2>
        <div style={styles.topicsGrid}>
          {topics.map((topic) => (
            <div key={topic.id} style={styles.topicCard}>
              <div style={styles.topicIcon}>{topic.icon}</div>
              <h3 style={styles.topicTitle}>{topic.title}</h3>
              <p style={styles.topicDescription}>{topic.description}</p>
              <button
                onClick={() => handleCreateRoom(topic)}
                style={styles.startDebateBtn}
              >
                Start Debate 🎤
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Active Rooms */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🔴 Active Debate Rooms</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.createCustomBtn}
          >
            + Create Custom Room
          </button>
        </div>
        
        {loading ? (
          <p style={styles.loading}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p style={styles.noRooms}>No active rooms. Be the first to start a debate!</p>
        ) : (
          <div style={styles.roomsList}>
            {rooms.map((room) => (
              <div key={room._id} style={styles.roomCard}>
                <div style={styles.roomHeader}>
                  <h3 style={styles.roomTitle}>{room.title}</h3>
                  {room.isPinned && <span style={styles.pinnedBadge}>📌 Pinned</span>}
                </div>
                <p style={styles.roomTopic}>{room.topic}</p>
                <div style={styles.roomMeta}>
                  <span>👥 {room.participants?.length || 0} participants</span>
                  <span>💬 {room.messages?.length || 0} messages</span>
                  <span>📂 {room.category}</span>
                </div>
                <button
                  onClick={() => handleJoinRoom(room._id)}
                  style={styles.joinBtn}
                >
                  Join Discussion →
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Debate Room</h2>
            <form onSubmit={submitCreateRoom} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Room Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedTopic?.title || ''}
                  required
                  style={styles.input}
                  placeholder="e.g., The Godfather is Overrated"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Topic/Question</label>
                <textarea
                  name="topic"
                  defaultValue={selectedTopic?.description || ''}
                  required
                  style={styles.textarea}
                  placeholder="What's the main debate question?"
                  rows={3}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description (Optional)</label>
                <textarea
                  name="description"
                  style={styles.textarea}
                  placeholder="Add more context or rules for the debate..."
                  rows={2}
                />
              </div>
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#999',
  },
  categoryContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '40px',
    justifyContent: 'center',
  },
  categoryBtn: {
    padding: '10px 20px',
    border: '2px solid #333',
    borderRadius: '25px',
    background: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
  },
  categoryBtnActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: '#764ba2',
  },
  categoryIcon: {
    fontSize: '1.2rem',
  },
  section: {
    marginBottom: '50px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
  },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  topicCard: {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    transition: 'transform 0.3s, border-color 0.3s',
    cursor: 'pointer',
  },
  topicIcon: {
    fontSize: '3rem',
    marginBottom: '10px',
  },
  topicTitle: {
    fontSize: '1.2rem',
    marginBottom: '10px',
  },
  topicDescription: {
    fontSize: '0.9rem',
    color: '#999',
    marginBottom: '15px',
  },
  startDebateBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  createCustomBtn: {
    padding: '10px 20px',
    background: '#2a2a2a',
    color: '#fff',
    border: '2px solid #667eea',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  roomsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  roomCard: {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '20px',
  },
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  roomTitle: {
    fontSize: '1.3rem',
    margin: 0,
  },
  pinnedBadge: {
    fontSize: '0.8rem',
    color: '#ffd700',
  },
  roomTopic: {
    color: '#999',
    marginBottom: '15px',
  },
  roomMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '15px',
  },
  joinBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    color: '#999',
    fontSize: '1.1rem',
  },
  noRooms: {
    textAlign: 'center',
    color: '#999',
    fontSize: '1.1rem',
    padding: '40px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
  },
  modalTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#999',
  },
  input: {
    padding: '12px',
    background: '#0a0a0a',
    border: '2px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
  },
  textarea: {
    padding: '12px',
    background: '#0a0a0a',
    border: '2px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#2a2a2a',
    color: '#fff',
    border: '2px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
