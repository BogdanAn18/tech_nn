'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Subscriptions.module.css';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const apiUrl = 'http://localhost:5000';

  const fetchSubscriptions = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      setSubs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить подписку?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiUrl}/subscriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Ошибка удаления');
      setSubs(subs.filter(sub => sub.id !== id));
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const calculateNextBilling = (lastDate, period, unit) => {
    if (!lastDate || !period) return null;
    const date = new Date(lastDate);
    switch(unit) {
      case 'months': date.setMonth(date.getMonth() + period); break;
      case 'years': date.setFullYear(date.getFullYear() + period); break;
      default: date.setDate(date.getDate() + period);
    }
    return date.toLocaleDateString();
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Мои подписки</h1>
        <button 
          onClick={() => router.push('/subscriptions/manage')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Добавить
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      
      {subs.length === 0 ? (
        <p>У вас пока нет подписок</p>
      ) : (
        <ul className={styles.subscriptionList}>
          {subs.map(sub => (
            <li key={sub.id} className={styles.subscriptionItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className={styles.subscriptionName}>
                  {sub.name} — {sub.price} ₽
                  {sub.period && (
                    <span className={styles.badge}>
                      каждые {sub.period} {sub.period_unit === 'months' ? 'мес' : sub.period_unit === 'years' ? 'лет' : 'дн'}
                    </span>
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => router.push(`/subscriptions/manage/${sub.id}`)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      marginRight: '0.5rem',
                      background: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(sub.id)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className={styles.subscriptionDetails}>
                {sub.category && <span>📁 {sub.category}</span>}
                {sub.last_billing && (
                  <span>
                    📅 последнее: {new Date(sub.last_billing).toLocaleDateString()}
                    {sub.period && (
                      <> → 🔮 {calculateNextBilling(sub.last_billing, sub.period, sub.period_unit)}</>
                    )}
                  </span>
                )}
                {sub.source && <span>📩 {sub.source}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}