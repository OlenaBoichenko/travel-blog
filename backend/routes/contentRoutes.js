const express = require('express');
const Content = require('../models/Content');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware для проверки авторизации админа
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация администратора" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Недействительный токен" });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Только администраторы могут выполнять это действие" });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки авторизации (включая гостей)
const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.isGuest = true;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.isGuest = true;
      return next();
    }
    req.user = user;
    req.isGuest = false;
    next();
  });
};

// Получить все посты
router.get('/', async (req, res) => {
  try {
    const content = await Content.find()
      .populate('author', 'username')
      .populate('comments.author', 'username')
      .sort('-createdAt');
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создать новый пост (только для админов)
router.post('/', checkAdminAuth, async (req, res) => {
  try {
    if (!req.body.youtubeUrl) {
      return res.status(400).json({ message: 'Пожалуйста, укажите ссылку на YouTube видео' });
    }

    const content = new Content({
      title: req.body.title,
      description: req.body.description,
      youtubeUrl: req.body.youtubeUrl,
      author: req.user.id,
      reactions: {
        likes: [],
        hearts: [],
        guestLikes: [],
        guestHearts: []
      }
    });

    const newContent = await content.save();
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message });
  }
});

// Добавление комментария
router.post('/:id/comments', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    const comment = {
      text: req.body.text,
      author: req.body.author || 'Гость',
      createdAt: new Date()
    };

    content.comments.push(comment);
    await content.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
});

// Добавить/убрать реакцию
router.post('/:id/reactions', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    if (!['likes', 'hearts'].includes(type)) {
      return res.status(400).json({ message: 'Неверный тип реакции' });
    }

    // Инициализируем массивы реакций, если они не существуют
    if (!content.reactions) {
      content.reactions = {
        likes: [],
        hearts: [],
        guestLikes: [],
        guestHearts: []
      };
    }

    const guestType = `guest${type.charAt(0).toUpperCase() + type.slice(1)}`;

    if (req.isGuest) {
      // Обработка гостевых реакций
      const guestId = req.body.guestId || 'anonymous';
      const index = content.reactions[guestType].indexOf(guestId);
      
      if (index === -1) {
        content.reactions[guestType].push(guestId);
      } else {
        content.reactions[guestType].splice(index, 1);
      }
    } else {
      // Обработка реакций авторизованных пользователей
      const index = content.reactions[type].indexOf(req.user.id);
      
      if (index === -1) {
        content.reactions[type].push(req.user.id);
      } else {
        content.reactions[type].splice(index, 1);
      }
    }

    await content.save();
    res.json(content.reactions);
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ message: error.message });
  }
});

// Удалить пост (только для админов)
router.delete('/:id', checkAdminAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    await content.remove();
    res.json({ message: 'Контент успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
