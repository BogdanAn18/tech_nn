require('dotenv').config();
const express = require('express');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

// ========== ТЕСТОВЫЙ МАРШРУТ ==========
app.get('/', (req, res) => res.send('🔥 Сервер с JWT работает'));

app.listen(PORT, () => console.log(`🚀 Сервер на http://localhost:${PORT}`));