'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import styles from './Analytics.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#6B8EFF'];

const periodOptions = [
  { value: 'month', label: 'Месяц', multiplier: 1 },
  { value: 'quarter', label: 'Квартал', multiplier: 3 },
  { value: 'year', label: 'Год', multiplier: 12 },
];

export default function Analytics() {
  const [data, setData] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const apiUrl = 'http://localhost:5000';

  const normalizeToMonthly = (price, period, period_unit) => {
    if (!period || period <= 0) return price;
    switch (period_unit) {
      case 'days':
        return (price / period) * 30;
      case 'months':
        return price / period;
      case 'years':
        return price / (period * 12);
      default:
        return price;
    }
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Сначала войдите в систему');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        const subs = await res.json();

        const categoryMap = new Map();
        let monthlyTotal = 0;

        subs.forEach(sub => {
          const price = parseFloat(sub.price) || 0;
          const category = sub.category || 'Другое';
          const period = sub.period ? parseInt(sub.period) : null;
          const period_unit = sub.period_unit || 'months';

          const monthlyPrice = normalizeToMonthly(price, period, period_unit);
          monthlyTotal += monthlyPrice;

          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + monthlyPrice);
          } else {
            categoryMap.set(category, monthlyPrice);
          }
        });

        const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: Math.round(value * 100) / 100
        }));

        setData(chartData);
        setTotalMonthly(Math.round(monthlyTotal * 100) / 100);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const currentPeriod = periodOptions.find(p => p.value === selectedPeriod);
  const totalForPeriod = totalMonthly * currentPeriod.multiplier;
  const periodLabel = currentPeriod.label.toLowerCase();

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Аналитика расходов</h1>

      <div className={styles.periodSelector}>
        <label htmlFor="period">Период: </label>
        <select
          id="period"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          {periodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.forecastCard}>
        <h2>Прогноз на {periodLabel}</h2>
        <p className={styles.forecastAmount}>{totalForPeriod.toFixed(2)} ₽</p>
        <p className={styles.monthlyNote}>≈ {totalMonthly.toFixed(2)} ₽ в месяц</p>
      </div>

      <div className={styles.chartContainer}>
        <h2>Распределение по категориям</h2>
        <PieChart width={500} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(2)} ₽ (в месяц)`} />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}