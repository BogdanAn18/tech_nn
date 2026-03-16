import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import api from '../api/client';

const { width } = Dimensions.get('window');
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B', '#6B8EFF'];

const periodOptions = [
  { label: 'Месяц', value: 'month', multiplier: 1 },
  { label: 'Квартал', value: 'quarter', multiplier: 3 },
  { label: 'Год', value: 'year', multiplier: 12 },
];

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const normalizeToMonthly = (price, period, period_unit) => {
    if (!period || period <= 0) return price;
    switch (period_unit) {
      case 'days': return (price / period) * 30;
      case 'months': return price / period;
      case 'years': return price / (period * 12);
      default: return price;
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

      const chartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }));

      setCategories(chartData);
      setTotalMonthly(Math.round(monthlyTotal * 100) / 100);
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

  const currentPeriod = periodOptions.find(p => p.value === selectedPeriod);
  const totalForPeriod = totalMonthly * currentPeriod.multiplier;
  const periodLabel = currentPeriod.label.toLowerCase();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Аналитика расходов</Text>

      {/* Выбор периода */}
      <View style={styles.periodSelector}>
        {periodOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.periodButton,
              selectedPeriod === option.value && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(option.value)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === option.value && styles.periodButtonTextActive,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Карточка прогноза */}
      <View style={styles.forecastCard}>
        <Text style={styles.forecastTitle}>Прогноз на {periodLabel}</Text>
        <Text style={styles.forecastAmount}>{totalForPeriod.toFixed(2)} ₽</Text>
        <Text style={styles.monthlyNote}>≈ {totalMonthly.toFixed(2)} ₽ в месяц</Text>
      </View>

      {/* Круговая диаграмма с тултипом */}
      {categories.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Распределение по категориям</Text>
          <View style={styles.legend}>
            {categories.map((item, index) => (
              <View key={item.name} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS[index % COLORS.length] }]} />
                <Text style={styles.legendText}>{item.name}: {item.value} ₽</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>Нет данных для отображения</Text>
      )}
    </ScrollView>
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
    marginTop: 30,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  periodButtonActive: {
    backgroundColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  forecastCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  forecastTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  forecastAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  monthlyNote: {
    fontSize: 16,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
});