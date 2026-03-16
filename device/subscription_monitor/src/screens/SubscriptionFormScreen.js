import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/client';

const categories = [
  { label: '🎬 Видео (Netflix, YouTube, Кинопоиск)', value: 'Видео' },
  { label: '🎵 Музыка (Яндекс Музыка, Spotify)', value: 'Музыка' },
  { label: '💻 Софт (Adobe, Microsoft 365)', value: 'Софт' },
  { label: '☁️ Облако (Google Drive, iCloud)', value: 'Облако' },
  { label: '🚚 Доставка (Яндекс Плюс, СберПрайм)', value: 'Доставка' },
  { label: '🎮 Игры (Game Pass, PlayStation Plus)', value: 'Игры' },
  { label: '📚 Образование (Coursera, Skillbox)', value: 'Образование' },
  { label: '💪 Здоровье (FitMost, онлайн-тренировки)', value: 'Здоровье' },
  { label: '📖 Книги (Букмейт, Литрес)', value: 'Книги' },
  { label: '📱 Связь (МТС, Мегафон, Билайн)', value: 'Связь' },
  { label: '₿ Крипта (Binance, Bybit)', value: 'Крипта' },
  { label: '🤖 AI (ChatGPT Plus, Midjourney)', value: 'AI' },
  { label: '💰 Финансы (СберПрайм, Тинькофф Premium)', value: 'Финансы' },
  { label: '📦 Другое', value: 'Другое' },
];

const periodUnits = [
  { label: 'дней', value: 'days' },
  { label: 'месяцев', value: 'months' },
  { label: 'лет', value: 'years' },
];

export default function SubscriptionFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    period: '',
    period_unit: 'months',
    last_billing: '',
    source: '',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubscription();
    }
  }, [id]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/subscriptions/${id}`);
      const sub = response.data;
      setFormData({
        name: sub.name,
        price: sub.price.toString(),
        category: sub.category || '',
        period: sub.period ? sub.period.toString() : '',
        period_unit: sub.period_unit || 'months',
        last_billing: sub.last_billing || '',
        source: sub.source || '',
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные подписки');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Ошибка', 'Название и цена обязательны');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category || null,
        period: formData.period ? parseInt(formData.period) : null,
        period_unit: formData.period_unit,
        last_billing: formData.last_billing || null,
        source: formData.source || null,
      };

      if (id) {
        await api.put(`/subscriptions/${id}`, payload);
      } else {
        await api.post('/subscriptions', payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить подписку');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, last_billing: selectedDate.toISOString().split('T')[0] });
    }
  };

  if (loading && id) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Text style={styles.label}>Название *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Например, Netflix"
          />

          <Text style={styles.label}>Цена (₽) *</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
            placeholder="0.00"
          />

          <Text style={styles.label}>Категория</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <Picker.Item label="Выберите категорию" value="" />
              {categories.map(cat => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Период</Text>
              <TextInput
                style={styles.input}
                value={formData.period}
                onChangeText={(text) => setFormData({ ...formData, period: text })}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Единица</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.period_unit}
                  onValueChange={(value) => setFormData({ ...formData, period_unit: value })}
                >
                  {periodUnits.map(unit => (
                    <Picker.Item key={unit.value} label={unit.label} value={unit.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Последнее списание</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formData.last_billing ? styles.dateText : styles.placeholder}>
              {formData.last_billing || 'Выберите дату'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.last_billing ? new Date(formData.last_billing) : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>Источник (ссылка или email для отмены)</Text>
          <TextInput
            style={styles.input}
            value={formData.source}
            onChangeText={(text) => setFormData({ ...formData, source: text })}
            placeholder="https://... или email@example.com"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>
                {id ? 'Обновить' : 'Сохранить'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.7,
  },
});