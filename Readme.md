# 💸 Монитор подписок

**Фулстэк‑приложение для управления личными подписками**  
*Отборочное задание направления «Фулстэк»*

Проект представляет собой платформу для централизованного контроля регулярных расходов. Он состоит из трёх взаимодействующих компонентов:

- **Серверная часть (Backend)** — Node.js (Express), PostgreSQL, JWT-аутентификация.
- **Веб-интерфейс (Frontend)** — Next.js, Recharts, CSS-модули.
- **Мобильное приложение** — React Native (Expo), VictoryNative.

Все части синхронизируются через единое REST API.

---

## 🧠 Архитектура

1. **Клиенты** (фронтенд и мобилка) отправляют запросы к бэкенду.
2. **Бэкенд** проверяет JWT и работает с базой данных.
3. **PostgreSQL** хранит пользователей и подписки.
4. **Единое API** обеспечивает синхронизацию между платформами.

---

## 🛠️ Технологии

| Компонент       | Технологии                          |
|-----------------|--------------------------------------|
| Бэкенд          | Node.js, Express, PostgreSQL, JWT   |
| Фронтенд        | Next.js, Recharts, CSS-модули       |
| Мобильное прил. | React Native, Expo, VictoryNative   |
| База данных     | PostgreSQL                           |

---

## 📋 Требования

- **Node.js** 18+
- **PostgreSQL** 14+
- **Git**
- **Expo CLI** (для мобильной версии): `npm install -g expo-cli`

---

## 🗄️ Установка PostgreSQL

### Скачивание
1. Перейдите на [postgresql.org](https://www.postgresql.org/download/windows/)
2. Скачайте установщик для вашей ОС
3. Запустите установку
   - **Пароль**: обязательно запомните
   - **Порт**: оставьте `5432`
   - Остальное — по умолчанию

### Создание базы и таблиц

После установки откройте **pgAdmin 4** и выполните следующий SQL:

```sql
-- Таблица пользователей (добавлено поле для уведомлений)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подписок (полная структура)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    period INTEGER,
    period_unit VARCHAR(10) DEFAULT 'months',
    last_billing DATE,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Запуск проекта

### 1. Клонирование
```bash
git clone https://github.com/BogdanAn18/tech_nn.git
cd tech_nn
```

### 2. Бэкенд
```bash
cd backend
npm install
```

Создайте файл `.env` в папке `backend`:

```env
# Сервер
JWT_SECRET=your-super-secret-key
PORT=5000

# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=sub_monitor

# Почта для уведомлений (Mail.ru)
EMAIL_HOST=smtp.mail.ru
EMAIL_PORT=465
EMAIL_USER=your-email@mail.ru
EMAIL_PASSWORD=your-app-password
```

Запуск:
```bash
npm run dev
```
Сервер будет доступен на `http://localhost:5000`

### 3. Фронтенд
```bash
cd ../frontend
npm install
npm run dev
```
Откройте `http://localhost:3000`

### 4. Мобильное приложение
```bash
cd ../device_new
npm install
npm start
```
Установите **Expo Go** на телефон и отсканируйте QR-код.

---

## 📁 Структура проекта
```
tech_nn/
├── backend/          # Сервер + БД
├── frontend/         # Веб-интерфейс
│   └── app/
│       ├── subscriptions/     # Управление подписками
│       ├── analytics/          # Графики и аналитика
│       └── login/register/     # Авторизация
└── device_new/       # Мобильное приложение
    ├── src/
    │   ├── screens/   # Экраны
    │   ├── navigation/ # Навигация
    │   └── context/    # AuthContext
```

---

## ✅ Функциональность

- 🔐 Регистрация и JWT-аутентификация
- 📝 Добавление, редактирование, удаление подписок
  - Название, цена, категория, период списания
  - Поле «Источник» (ссылка или email для отмены)
- 📊 Аналитика с прогнозом на месяц/квартал/год
- 🥧 Круговая диаграмма распределения по категориям
- 🔔 Уведомления о списаниях за 1-3 дня (с согласия пользователя)
- 🚫 Быстрая отмена подписки (открытие сайта или шаблон письма)
- 🔍 Поиск альтернативных сервисов по категории
- 📱 Полная синхронизация между вебом и мобильным приложением

---

## ❗ Частые проблемы

| Проблема | Решение |
|----------|---------|
| `password authentication failed` | Проверьте пароль в `.env` |
| `database "sub_monitor" does not exist` | Создайте базу в pgAdmin |
| Письма не приходят | Проверьте настройки SMTP и пароль приложения |
| Мобилка не видит бэкенд | Укажите IP компьютера вместо `localhost` в `api/client.js` |
| При редактировании сбрасывается категория | Обновлён список категорий — скопируйте полный список из `manage/page.js` в `[id]/page.js` |

---

## 👤 Автор

GitHub: [BogdanAn18](https://github.com/BogdanAn18)

По всем вопросам — открывайте Issue или пишите напрямую.

---

## 📄 Лицензия

Проект создан в рамках отборочного этапа. Используйте в своё удовольствие, а если пригодится — поставьте звёздочку ⭐