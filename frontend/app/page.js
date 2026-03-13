import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺 Монитор подписок</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        Управляй всеми своими подписками в одном месте
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link 
          href="/login"
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Войти
        </Link>
        <Link 
          href="/register"
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#fff',
            color: '#0070f3',
            textDecoration: 'none',
            borderRadius: '4px',
            border: '1px solid #0070f3'
          }}
        >
          Регистрация
        </Link>
      </div>
    </main>
  );
}