import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import styles from './HomeScreenStyles'; // стили вынесены отдельно

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Загрузка подписок
  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить подписки');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Загрузка статуса уведомлений
  const fetchNotificationStatus = async () => {
    try {
      const response = await api.get('/user/notifications');
      setNotificationsEnabled(response.data.enabled);
    } catch (error) {
      console.error('Ошибка загрузки статуса уведомлений:', error);
    }
  };

  // Переключение уведомлений
  const toggleNotifications = async () => {
    setNotifLoading(true);
    try {
      const newState = !notificationsEnabled;
      await api.post('/user/notifications', { enabled: newState });
      setNotificationsEnabled(newState);
    } catch (error) {
      console.log('❌ Ошибка при переключении уведомлений:', error.response?.data || error.message);
      Alert.alert('Ошибка', 'Не удалось изменить настройки уведомлений');
    } finally {
      setNotifLoading(false);
    }
  };

  // Выход из аккаунта
  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Навигация произойдёт автоматически благодаря AuthContext
        },
      },
    ]);
  };

  // Отмена подписки
  const handleCancel = (sub) => {
    if (!sub.source) {
      Alert.alert('Ошибка', 'Источник для отмены не указан');
      return;
    }

    if (sub.source.includes('@') && !sub.source.startsWith('http')) {
      // email
      const subject = encodeURIComponent('Отмена подписки');
      const body = encodeURIComponent(`Здравствуйте! Прошу отменить подписку на "${sub.name}".`);
      Linking.openURL(`mailto:${sub.source}?subject=${subject}&body=${body}`);
    } else {
      // ссылка
      let url = sub.source;
      if (!url.startsWith('http')) url = 'https://' + url;
      Linking.openURL(url);
    }
  };

  // Поиск альтернатив
  const handleAlternatives = (sub) => {
    const category = sub.category || 'подписки';
    const query = encodeURIComponent(`лучшие сервисы ${category}`);
    Linking.openURL(`https://yandex.ru/search/?text=${query}`);
  };

  // Удаление подписки
  const handleDelete = (id, name) => {
    Alert.alert('Удаление', `Удалить подписку "${name}"?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/subscriptions/${id}`);
            setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
          } catch (error) {
            Alert.alert('Ошибка', 'Не удалось удалить подписку');
          }
        },
      },
    ]);
  };

  // Обновление при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
      fetchNotificationStatus();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SubscriptionForm', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.price}>{item.price} ₽</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      {item.period && (
        <Text style={styles.period}>
          каждые {item.period} {item.period_unit === 'months' ? 'мес' : item.period_unit === 'years' ? 'лет' : 'дн'}
        </Text>
      )}

      <View style={styles.details}>
        {item.category && <Text style={styles.category}>📁 {item.category}</Text>}
        {item.last_billing && (
          <Text style={styles.date}>📅 {new Date(item.last_billing).toLocaleDateString()}</Text>
        )}
      </View>

      {item.source && (
        <Text style={styles.source} numberOfLines={1}>
          📩 {item.source}
        </Text>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
          <Text style={styles.buttonText}>🚫 Отменить</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.alternativesButton} onPress={() => handleAlternatives(item)}>
          <Text style={styles.buttonText}>🔍 Альтернативы</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Блок уведомлений */}
      <View style={styles.notificationBlock}>
        <TouchableOpacity
          onPress={toggleNotifications}
          disabled={notifLoading}
          style={styles.notificationTouch}
        >
          <View style={styles.notificationRow}>
            <View style={[styles.checkbox, notificationsEnabled && styles.checkboxActive]}>
              {notificationsEnabled && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.notificationLabel}>🔔 Получать уведомления о списаниях</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.notificationText}>
          Я соглашаюсь на получение email-напоминаний за 1-3 дня до списания
        </Text>
      </View>

      {/* Шапка с заголовком и кнопками */}
      <View style={styles.header}>
        <Text style={styles.title}>Мои подписки</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('SubscriptionForm')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSubscriptions} />}
        ListEmptyComponent={<Text style={styles.empty}>У вас пока нет подписок</Text>}
      />
    </View>
  );
}