'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Берём адрес из .env или запасной вариант
    const apiUrl = 'http://localhost:5000';

    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Вход выполнен!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        window.dispatchEvent(new Event('authChange')); // ← добавить эту
        router.push('/subscriptions');
      } else {
        setMessage('❌ ' + (data.error || 'Ошибка входа'));
      }
    } catch (err) {
      setMessage('❌ Ошибка соединения с сервером');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      padding: '2rem',
      maxWidth: '400px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Вход в аккаунт</h1>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            marginTop: '0.5rem'
          }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: message.includes('✅') ? '#e6f7e6' : '#ffe6e6',
          border: `1px solid ${message.includes('✅') ? '#4caf50' : '#ff4d4d'}`,
          borderRadius: '4px',
          color: message.includes('✅') ? '#2e7d32' : '#d32f2f'
        }}>
          {message}
        </div>
      )}
    </main>
  );
}