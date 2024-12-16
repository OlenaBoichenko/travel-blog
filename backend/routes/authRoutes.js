const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Недействительный токен" });
    req.user = user;
    next();
  });
};

// Middleware для проверки роли админа
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Доступ запрещен. Требуются права администратора" });
  }
  next();
};

// Регистрация
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Заполните все поля" });
  }

  // Проверка допустимости роли
  if (role && !['admin', 'guest'].includes(role)) {
    return res.status(400).json({ message: "Недопустимая роль" });
  }

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const user = new User({ 
      username, 
      password,
      role: role || 'guest' // Если роль не указана, по умолчанию 'guest'
    });
    
    await user.save();
    res.status(201).json({ 
      message: "Регистрация успешна",
      role: user.role
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Вход
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        username: user.username 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Получение всех администраторов (защищенный маршрут)
router.get('/admins', authenticateToken, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password'); // Исключаем пароль из результата

    if (admins.length > 0) {
      res.status(200).json(admins);
    } else {
      res.status(404).json({ message: 'Суперпользователи не найдены' });
    }
  } catch (error) {
    console.error('Ошибка при получении списка администраторов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Проверка текущего пользователя
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
