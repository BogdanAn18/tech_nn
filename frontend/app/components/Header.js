'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from '../context/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    const update = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
      setUserEmail(localStorage.getItem('userEmail') || '');
    };
    
    update();
    
    window.addEventListener('authChange', update);
    return () => window.removeEventListener('authChange', update);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
    window.dispatchEvent(new Event('authChange'));
    router.push('/login');
  };

  const headerStyles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '62px',
      backgroundColor: 'var(--navbar-bg)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'background-color 0.3s, border-color 0.3s',
    },
    logo: {
      fontWeight: 'bold',
      fontSize: '1.2rem',
    },
    logoLink: {
      textDecoration: 'none',
      color: 'var(--foreground)',
      transition: 'color 0.3s',
    },
    nav: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center',
    },
    navLink: {
      textDecoration: 'none',
      color: 'var(--foreground)',
      transition: 'color 0.3s',
      fontSize: '0.95rem',
    },
    userEmail: {
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s',
    },
  };

  // Пока не смонтировались на клиенте — показываем заглушку
  if (!mounted) {
    return (
      <header style={headerStyles.header}>
        <div style={headerStyles.logo}>
          <Link href="/" style={headerStyles.logoLink}>
            📺 Монитор подписок
          </Link>
        </div>
        <nav style={headerStyles.nav}>
          <ThemeToggle />
        </nav>
      </header>
    );
  }

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.logo}>
        <Link href="/" style={headerStyles.logoLink}>
          📺 Монитор подписок
        </Link>
      </div>
      
      <nav style={headerStyles.nav}>
        {isLoggedIn && (
          <>
            <Link href="/subscriptions" style={headerStyles.navLink}>
              Подписки
            </Link>
            <Link href="/analytics" style={headerStyles.navLink}>
              Аналитика
            </Link>
          </>
        )}
        
        <ThemeToggle />
        
        {isLoggedIn ? (
          <>
            <span style={headerStyles.userEmail}>
              {userEmail || 'Пользователь'}
            </span>
            <button
              onClick={handleLogout}
              style={headerStyles.logoutButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={headerStyles.navLink}>
              Вход
            </Link>
            <Link href="/register" style={headerStyles.navLink}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}