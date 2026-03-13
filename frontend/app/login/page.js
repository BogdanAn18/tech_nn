'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { authStyles } from '../styles/authStyles';

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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        window.dispatchEvent(new Event('authChange'));
        router.push('/subscriptions');
      } else {
        setMessage('❌ ' + (data.error || 'Ошибка входа'));
      }
    } catch (err) {
      setMessage('❌ Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.container}>
      <div style={authStyles.card}>
        <div style={authStyles.header}>
          <h1 style={authStyles.title}>Вход</h1>
          <p style={authStyles.subtitle}>Войдите в свой аккаунт</p>
        </div>

        <form onSubmit={handleLogin} style={authStyles.form}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={authStyles.input}
              placeholder="your@email.com"
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={authStyles.input}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...authStyles.button,
              ...(loading ? authStyles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {message && (
          <div style={{
            ...authStyles.message,
            ...(message.includes('✅') ? authStyles.messageSuccess : authStyles.messageError)
          }}>
            {message}
          </div>
        )}

        <div style={authStyles.footer}>
          <p style={authStyles.footerText}>
            Нет аккаунта?{' '}
            <Link href="/register" style={authStyles.link}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}