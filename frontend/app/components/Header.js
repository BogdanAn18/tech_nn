'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  // Этот эффект запускается только на клиенте
  useEffect(() => {
    setMounted(true);
    
    // Функция обновления
    const update = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    
    update(); // первый раз
    
    // Слушаем изменения
    window.addEventListener('authChange', update);
    return () => window.removeEventListener('authChange', update);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    
    // Обновляем состояние
    setIsLoggedIn(false);
    setUserEmail('');
    
    // Сообщаем всем, что изменилось
    window.dispatchEvent(new Event('authChange'));
    
    router.push('/login');
  };

  // Пока не смонтировались на клиенте — показываем заглушку
  if (!mounted) {
    return (
      <header style={{
        backgroundColor: '#f0f0f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#333' }}>
            📺 Монитор подписок
          </Link>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Заглушка навигации — без динамического контента */}
        </nav>
      </header>
    );
  }

  return (
    <header style={{
      backgroundColor: '#f0f0f0',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #ddd'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#333' }}>
          📺 Монитор подписок
        </Link>
      </div>
      
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/subscriptions" style={{ textDecoration: 'none', color: '#0070f3' }}>
          Подписки
        </Link>
        <Link href="/analytics" style={{ textDecoration: 'none', color: '#0070f3' }}>
          Аналитика           {/* ← вставь эту строку */}
        </Link>
        
        {isLoggedIn ? (
          <>
            <span style={{ color: '#666' }}>
              {userEmail || 'Пользователь'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: 'none', color: '#0070f3' }}>
              Вход
            </Link>
            <Link href="/register" style={{ textDecoration: 'none', color: '#0070f3' }}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}