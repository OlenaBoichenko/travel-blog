const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require('fs');
const authRoutes = require("./routes/authRoutes");
const User = require('./models/User')
const contentRoutes = require("./routes/contentRoutes");
const userRoutes = require('./routes/users');
const galleryRoutes = require('./routes/galleryRoutes');

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие необходимых переменных окружения
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in environment variables');
  process.exit(1);
}

const app = express();

// Создаем папку uploads, если её нет
// if (!fs.existsSync('uploads')) {
//   fs.mkdirSync('uploads');
// }

// Настройка CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'https://travel-blog-ca.netlify.app'];
    // Разрешаем запросы от Postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Подключаем маршруты аутентификации
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("Бэкенд работает!");
});

// Маршрут для стриминга видео
app.get('/video/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  // Проверяем существование файла
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('Файл не найден');
  }

  // Получаем статистику файла
  const stat = fs.statSync(filepath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Парсим заголовок range
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filepath, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(200, head);
    fs.createReadStream(filepath).pipe(res);
  }
});

// Делаем папку uploads статической
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Подключаем маршруты для контента, пользователей и галереи
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);
app.use('/api/gallery', galleryRoutes);

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
