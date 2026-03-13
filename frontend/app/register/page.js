'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authStyles } from '../styles/authStyles';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('❌ Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setMessage('❌ Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Регистрация успешна! Перенаправляем на вход...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage('❌ ' + (data.error || 'Ошибка регистрации'));
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
          <h1 style={authStyles.title}>Регистрация</h1>
          <p style={authStyles.subtitle}>Создайте новый аккаунт</p>
        </div>

        <form onSubmit={handleRegister} style={authStyles.form}>
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
              placeholder="минимум 6 символов"
            />
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Подтверждение пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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
            Уже есть аккаунт?{' '}
            <Link href="/login" style={authStyles.link}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}