'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Регистрация успешна! Теперь войди.');
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (err) {
      setMessage('❌ Ошибка соединения с сервером');
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Монитор подписок</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Пароль (мин. 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Зарегистрироваться</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}