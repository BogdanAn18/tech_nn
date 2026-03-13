'use client';

import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  const buttonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'background-color 0.2s',
    color: 'var(--foreground)',
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      aria-label={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}