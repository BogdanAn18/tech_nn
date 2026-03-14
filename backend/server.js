require('dotenv').config();
const express = require('express');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://твой-сайт.ru']
}));

// Секретный ключ для подписи токенов (в реальном проекте храни в .env!)
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// ========== РЕГИСТРАЦИЯ ==========
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Регистрация успешна', 
      user: newUser.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// ========== ВХОД (ЛОГИН) ==========
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { 
        userId: user.rows[0].id,
        email: user.rows[0].email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user.rows[0];
    
    res.json({ 
      message: 'Вход выполнен успешно',
      token,
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
});

// ========== МИДЛВАР ДЛЯ ПРОВЕРКИ ТОКЕНА ==========
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный или просроченный токен' });
    }
    req.user = user;
    next();
  });
};

// ========== ПРОФИЛЬ ==========
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    res.json({ 
      message: 'Это защищённые данные',
      user: user.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== ПОЛУЧИТЬ ВСЕ ПОДПИСКИ ==========
app.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_email = $1 ORDER BY created_at DESC',
      [req.user.email]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении подписок' });
  }
});

// ========== ПОЛУЧИТЬ ОДНУ ПОДПИСКУ ==========
app.get('/subscriptions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE id = $1 AND user_email = $2',
      [req.params.id, req.user.email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Подписка не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== СОЗДАТЬ ПОДПИСКУ ==========
app.post('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const { name, price, category, period, period_unit, last_billing, source } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'name и price обязательны' });
    }

    const result = await pool.query(
      `INSERT INTO subscriptions 
       (user_email, name, price, category, period, period_unit, last_billing, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.email,
        name,
        price,
        category || null,
        period || null,
        period_unit || 'days',
        last_billing || null,
        source || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении подписки' });
  }
});

// ========== ОБНОВИТЬ ПОДПИСКУ ==========
app.put('/subscriptions/:id', authenticateToken, async (req, res) => {
  try {
    const { name, price, category, period, period_unit, last_billing, source } = req.body;
    
    const result = await pool.query(
      `UPDATE subscriptions 
       SET name = $1, price = $2, category = $3, period = $4, 
           period_unit = $5, last_billing = $6, source = $7
       WHERE id = $8 AND user_email = $9 RETURNING *`,
      [
        name,
        price,
        category || null,
        period || null,
        period_unit || 'days',
        last_billing || null,
        source || null,
        req.params.id,
        req.user.email
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Подписка не найдена' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

// ========== УДАЛИТЬ ПОДПИСКУ ==========
app.delete('/subscriptions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM subscriptions WHERE id = $1 AND user_email = $2 RETURNING *',
      [req.params.id, req.user.email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Подписка не найдена' });
    }
    
    res.json({ message: 'Подписка удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});




// ========== НАСТРОЙКА ПОЧТЫ ==========
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true для 465, false для 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendNotificationEmail(userEmail, subscription) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🔔 Напоминание: скоро спишут ${subscription.name}`,
    html: `
      <h2>Здравствуйте!</h2>
      <p>Напоминаем, что через 1-3 дня будет списание за подписку:</p>
      <ul>
        <li><strong>Сервис:</strong> ${subscription.name}</li>
        <li><strong>Сумма:</strong> ${subscription.price} ₽</li>
        <li><strong>Категория:</strong> ${subscription.category || 'Другое'}</li>
      </ul>
      <p>Вы можете управлять подписками в <a href="http://localhost:3000">личном кабинете</a>.</p>
      <hr>
      <p style="color: gray;">Это письмо отправлено, потому что вы включили уведомления. 
      Отключить можно в настройках профиля.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Уведомление отправлено для ${userEmail} (${subscription.name})`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки письма:', error);
    return false;
  }
}

// ========== ЛОГИКА УВЕДОМЛЕНИЙ ==========
function getNextBillingDate(last_billing, period, period_unit) {
  const date = new Date(last_billing);
  switch (period_unit) {
    case 'days':
      date.setDate(date.getDate() + period);
      break;
    case 'months':
      date.setMonth(date.getMonth() + period);
      break;
    case 'years':
      date.setFullYear(date.getFullYear() + period);
      break;
  }
  return date;
}

async function checkAndSendNotifications() {
  console.log('🔍 Проверка подписок для уведомлений...');

  try {
    // 1. Получаем всех пользователей с включёнными уведомлениями
    const users = await pool.query(
      'SELECT id, email FROM users WHERE notifications_enabled = true'
    );

    for (const user of users.rows) {
      // 2. Получаем подписки пользователя
      const subscriptions = await pool.query(
        `SELECT * FROM subscriptions 
         WHERE user_email = $1 AND last_billing IS NOT NULL`,
        [user.email]
      );

      for (const sub of subscriptions.rows) {
        // 3. Считаем следующую дату списания
        const nextBilling = getNextBillingDate(
          sub.last_billing, 
          sub.period, 
          sub.period_unit
        );
        
        const today = new Date();
        const daysUntil = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));

        // 4. Если осталось 1-3 дня — отправляем уведомление
        if (daysUntil >= 1 && daysUntil <= 3) {
          await sendNotificationEmail(user.email, sub);
          
          // TODO: добавить защиту от повторной отправки
        }
      }
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке уведомлений:', error);
  }
}

// ========== ПОЛУЧИТЬ СТАТУС УВЕДОМЛЕНИЙ ==========
app.get('/user/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT notifications_enabled FROM users WHERE id = $1',
      [req.user.userId]
    );
    res.json({ enabled: result.rows[0].notifications_enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении статуса' });
  }
});

// ========== ПЛАНИРОВЩИК ==========
// Запускаем проверку каждый день в 9 утра
// cron.schedule('0 9 * * *', () => {
//   console.log('⏰ Запуск плановой проверки уведомлений');
//   checkAndSendNotifications().catch(console.error);
// });

// Для теста можно раскомментировать:
checkAndSendNotifications();

// ========== ТЕСТОВЫЙ МАРШРУТ ==========
app.get('/', (req, res) => res.send('🔥 Сервер с JWT работает'));

app.listen(PORT, () => console.log(`🚀 Сервер на http://localhost:${PORT}`));