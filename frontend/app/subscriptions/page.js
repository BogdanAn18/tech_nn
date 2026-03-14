'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Subscriptions.module.css';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const router = useRouter();
  const apiUrl = 'http://localhost:5000';

  // Загрузка подписок
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

  // Загрузка статуса уведомлений
  const fetchNotificationStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/user/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationsEnabled(data.enabled);
      }
    } catch (err) {
      console.error('Ошибка загрузки статуса уведомлений:', err);
    }
  };

  // Переключение уведомлений
  const toggleNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setNotifLoading(true);
    try {
      const res = await fetch(`${apiUrl}/user/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !notificationsEnabled })
      });
      if (res.ok) {
        setNotificationsEnabled(!notificationsEnabled);
      } else {
        const data = await res.json();
        alert('Ошибка: ' + data.error);
      }
    } catch (err) {
      alert('Ошибка при обновлении настроек');
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchNotificationStatus();
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

  // ===== НОВЫЕ ФУНКЦИИ =====
  const handleCancel = (sub) => {
    if (!sub.source) {
      alert('❌ Источник для отмены не указан. Добавьте ссылку или email в поле "Источник" при редактировании.');
      return;
    }

    // Проверяем, похоже на email (содержит @ и не начинается с http)
    if (sub.source.includes('@') && !sub.source.startsWith('http')) {
      const subject = encodeURIComponent('Отмена подписки');
      const body = encodeURIComponent(`Здравствуйте! Прошу отменить подписку на "${sub.name}".`);
      window.location.href = `mailto:${sub.source}?subject=${subject}&body=${body}`;
    } else {
      // Иначе считаем ссылкой
      let url = sub.source;
      if (!url.startsWith('http')) {
        url = 'http://' + url;
      }
      window.open(url, '_blank');
    }
  };

  const handleAlternatives = (sub) => {
    const category = sub.category || 'подписки';
    const query = encodeURIComponent(`лучшие сервисы ${category}`);
    window.open(`https://yandex.ru/search/?text=${query}`, '_blank');
  };
  // =========================

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      {/* Блок уведомлений */}
      <div className={styles.notificationBlock}>
        <label className={styles.notificationLabel}>
          <input
            type="checkbox"
            className={styles.notificationCheckbox}
            checked={notificationsEnabled}
            onChange={toggleNotifications}
            disabled={notifLoading}
          />
          <span>🔔 Получать уведомления о предстоящих списаниях</span>
        </label>
        <p className={styles.notificationText}>
          Я соглашаюсь на получение email-напоминаний за 1-3 дня до списания
        </p>
      </div>

      {/* Заголовок и кнопка добавления */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className={styles.title}>Мои подписки</h1>
        <button 
          onClick={() => router.push('/subscriptions/manage')}
          className={styles.addButton}
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
                    className={styles.editButton}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(sub.id)}
                    className={styles.deleteButton}
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

              {/* НОВЫЙ БЛОК КНОПОК */}
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleCancel(sub)}
                  className={styles.cancelButton}
                  title="Отменить подписку"
                >
                  🚫 Отменить
                </button>
                <button
                  onClick={() => handleAlternatives(sub)}
                  className={styles.alternativesButton}
                  title="Найти альтернативу"
                >
                  🔍 Альтернативы
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}