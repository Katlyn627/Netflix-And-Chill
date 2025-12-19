'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to debates topics page
    router.push('/debates/topics');
  }, [router]);

  return (
    <div style={styles.container}>
      <div style={styles.loading}>
        <h1 style={styles.title}>Netflix & Chill</h1>
        <p style={styles.subtitle}>Loading...</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
  },
  loading: {
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#999',
  },
};
