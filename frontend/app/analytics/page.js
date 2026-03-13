'use client';

import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import styles from './Analytics.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#6B8EFF'];
const PERIOD_OPTIONS = [
  { value: 'month', label: 'Месяц', multiplier: 1 },
  { value: 'quarter', label: 'Квартал', multiplier: 3 },
  { value: 'year', label: 'Год', multiplier: 12 },
];

// Функция для парсинга даты
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Пробуем стандартный парсинг
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  return null;
}

// Простая хеш-функция для генерации псевдослучайного дня из строки
function getDayFromString(str, max = 28) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % max) + 1;
}

export default function Analytics() {
  const [data, setData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

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
        const res = await fetch(`${API_URL}/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ошибка загрузки');
        const subs = await res.json();

        // Категории и общая сумма
        const categoryMap = new Map();
        let monthlyTotal = 0;

        // Для дней создаём массив из 31 элемента
        const dailyTotals = new Array(31).fill(0);

        subs.forEach(sub => {
          const price = parseFloat(sub.price) || 0;
          const category = sub.category || 'Другое';
          const period = sub.period ? parseInt(sub.period) : null;
          const period_unit = sub.period_unit || 'months';

          // Для прогноза (общая сумма за месяц) — как раньше
          const monthlyPrice = normalizeToMonthly(price, period, period_unit);
          monthlyTotal += monthlyPrice;

          // Категории
          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + monthlyPrice);
          } else {
            categoryMap.set(category, monthlyPrice);
          }

          // --- НОВАЯ ЛОГИКА ДЛЯ ГРАФИКА ПО ДНЯМ ---
          if (period_unit === 'days' && period) {
            // Подписка с периодом в днях: распределяем по нескольким дням
            let baseDate = null;
            if (sub.last_billing) {
              baseDate = parseDate(sub.last_billing);
            }
            if (!baseDate) {
              // Если даты нет — используем сгенерированный день (один раз)
              let day = getDayFromString(sub.name, 28);
              dailyTotals[day - 1] += price; // добавляем полную стоимость за одно списание
            } else {
              const baseDay = baseDate.getDate();
              // Идём вперед от baseDay с шагом period
              for (let d = baseDay; d <= 31; d += period) {
                dailyTotals[d - 1] += price;
              }
              // Идём назад от baseDay (если списания были раньше в этом месяце)
              for (let d = baseDay - period; d >= 1; d -= period) {
                dailyTotals[d - 1] += price;
              }
            }
          } else {
            // Для месяцев/лет — один день, как раньше
            let day = null;
            if (sub.last_billing) {
              const date = parseDate(sub.last_billing);
              if (date) day = date.getDate();
            }
            if (!day && sub.payment_day) day = parseInt(sub.payment_day);
            if (!day) day = getDayFromString(sub.name, 28);
            if (day < 1) day = 1;
            if (day > 31) day = 31;
            dailyTotals[day - 1] += monthlyPrice; // здесь monthlyPrice — усреднённая за месяц
          }
        });

        // Данные для круговой диаграммы
        const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: Math.round(value * 100) / 100
        }));

        // Данные для дневной диаграммы
        const dailyChartData = dailyTotals.map((value, index) => ({
          day: index + 1,
          amount: Math.round(value * 100) / 100
        })).filter(item => item.amount > 0);

        setData(chartData);
        setDailyData(dailyChartData);
        setTotalMonthly(Math.round(monthlyTotal * 100) / 100);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const currentPeriod = PERIOD_OPTIONS.find(p => p.value === selectedPeriod);
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
          {PERIOD_OPTIONS.map(option => (
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

      {/* Круговая диаграмма */}
      <div className={styles.chartContainer}>
        <h2>Распределение по категориям</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
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
        </ResponsiveContainer>
      </div>

      {/* Столбчатая диаграмма: списания по дням месяца */}
      {dailyData.length > 0 && (
        <div className={styles.chartContainer}>
          <h2>Списания по дням месяца</h2>
          <div style={{ marginBottom: '2rem' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: 'День месяца', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  label={{ value: '₽ в месяц', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip formatter={(value) => `${value.toFixed(2)} ₽`} />
                <Bar dataKey="amount" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className={styles.note}>
            
          </p>
        </div>
      )}
    </div>
  );
}