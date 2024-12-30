const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Added jwt module
const GuestUser = require('../models/guestUser');

router.post('/auth', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверяем, существует ли пользователь
    let user = await GuestUser.findOne({ username });

    if (user) {
      // Если пользователь существует, проверяем пароль
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль' });
      }
    } else {
      // Если пользователь не существует, создаем нового
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new GuestUser({
        username,
        password: hashedPassword
      });

      await user.save();
    }

    // Создаем токен
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Отправляем информацию о пользователе (без пароля) и токен
    res.json({
      id: user._id,
      username: user.username,
      token
    });
    

  } catch (error) {
    console.error('Error in user auth:', error);
    res.status(500).json({ message: 'Ошибка сервера при авторизации' });
  }
});



// Проверка доступности имени пользователя
router.post('/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    const existingUser = await GuestUser.findOne({ username });
    res.json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при проверке имени пользователя' });
  }
});

module.exports = router;
