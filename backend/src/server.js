const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Берём порт из .env, либо ставим 5000 по умолчанию
const PORT = process.env.PORT || 5000;

// Включаем CORS и парсинг JSON
app.use(cors());
app.use(express.json());

// Тестовый роут (чек-поинт для проверки)
app.get('/api/health', (req, res) => {
  res.json({
    status: "alive",
    message: "Binary Towers Backend работает стабильно!",
    database_configured: process.env.DB_NAME ? "Да" : "Нет"
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(` Server started on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`=================================`);
});
