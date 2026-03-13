const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Проверка подключения
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Ошибка подключения к базе:', err.stack);
  }
  console.log('✅ База данных подключена');
  release();
});

module.exports = pool;