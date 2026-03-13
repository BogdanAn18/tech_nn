import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../api/client';

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [yearlyForecast, setYearlyForecast] = useState(0);
  const [categories, setCategories] = useState([]);

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/subscriptions');
      const subs = response.data;

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

      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }));

      setCategories(categoryData);
      setTotalMonthly(Math.round(monthlyTotal * 100) / 100);
      setYearlyForecast(Math.round(monthlyTotal * 12 * 100) / 100);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Общая сумма в месяц: {totalMonthly} ₽</Text>
      <Text>Прогноз на год: {yearlyForecast} ₽</Text>
      <Text>Распределение по категориям:</Text>
      {categories.map(item => (
        <Text key={item.name}>{item.name}: {item.value} ₽</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#999',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});