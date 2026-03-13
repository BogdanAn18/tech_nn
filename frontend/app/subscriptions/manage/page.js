'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../Subscriptions.module.css';

export default function ManageSubscription() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    period: '',
    period_unit: 'days',
    last_billing: '',
    source: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category || null,
      period: formData.period ? parseInt(formData.period) : null,
      period_unit: formData.period_unit,
      last_billing: formData.last_billing || null,
      source: formData.source || null
    };

    try {
      const res = await fetch(`${apiUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка');
      }

      router.push('/subscriptions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Добавить подписку</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label>Название *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Цена (₽) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              disabled={loading}
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Категория</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Выберите</option>
              <option value="Видео">Видео</option>
              <option value="Музыка">Музыка</option>
              <option value="Софт">Софт</option>
              <option value="Облако">Облако</option>
              <option value="Доставка">Доставка</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Период</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="30"
                style={{ width: '80px' }}
              />
              <select
                name="period_unit"
                value={formData.period_unit}
                onChange={handleInputChange}
                disabled={loading}
                style={{ width: '100px' }}
              >
                <option value="days">дней</option>
                <option value="months">месяцев</option>
                <option value="years">лет</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Источник</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Последнее списание</label>
          <input
            type="date"
            name="last_billing"
            value={formData.last_billing}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            disabled={loading}
            className={styles.button}
            style={{ flex: 1 }}
          >
            {loading ? 'Сохранение...' : '💾 Сохранить'}
          </button>
          <button 
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}