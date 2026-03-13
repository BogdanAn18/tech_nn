'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../Subscriptions.module.css';

export default function EditSubscription() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    period: '',
    period_unit: 'days',
    last_billing: '',
    source: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = 'http://localhost:5000';

  useEffect(() => {
    const fetchSubscription = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/subscriptions/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        const data = await res.json();
        setFormData({
          name: data.name,
          price: data.price,
          category: data.category || '',
          period: data.period || '',
          period_unit: data.period_unit || 'days',
          last_billing: data.last_billing ? data.last_billing.split('T')[0] : '',
          source: data.source || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const token = localStorage.getItem('token');
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
      const res = await fetch(`${apiUrl}/subscriptions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Ошибка обновления');
      router.push('/subscriptions');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактировать подписку</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {/* такая же форма, как в manage/page.js */}
        <div className={styles.formGroup}>
          <label>Название *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            disabled={saving}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Цена (₽) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              disabled={saving}
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Категория</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              disabled={saving}
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
                onChange={(e) => setFormData({...formData, period: e.target.value})}
                disabled={saving}
                placeholder="30"
                style={{ width: '80px' }}
              />
              <select
                name="period_unit"
                value={formData.period_unit}
                onChange={(e) => setFormData({...formData, period_unit: e.target.value})}
                disabled={saving}
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
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              disabled={saving}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Последнее списание</label>
          <input
            type="date"
            name="last_billing"
            value={formData.last_billing}
            onChange={(e) => setFormData({...formData, last_billing: e.target.value})}
            disabled={saving}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            disabled={saving}
            className={styles.button}
            style={{ flex: 1 }}
          >
            {saving ? 'Сохранение...' : '💾 Обновить'}
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