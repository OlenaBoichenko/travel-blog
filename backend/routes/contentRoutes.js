const express = require('express');
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware для проверки авторизации (включая гостей)
const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Проверяем гостевую авторизацию
    const guestAuth = req.headers['guest-auth'];
    if (!guestAuth) {
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    try {
      req.guestUser = JSON.parse(guestAuth);
      req.isGuest = true;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Неверные данные гостевой авторизации" });
    }
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Недействительный токен" });
    req.user = user;
    req.isGuest = false;
    next();
  });
};

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Разрешаем изображения и видео
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    // Для изображений устанавливаем лимит 10MB
    if (file.mimetype.startsWith('image/')) {
      req.fileTypeLimit = 10 * 1024 * 1024; // 10MB для изображений
    } else {
      req.fileTypeLimit = 100 * 1024 * 1024; // 100MB для видео
    }
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый формат файла'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Увеличиваем общий лимит до 100MB
  }
});

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
router.post('/', checkAuth, upload.single('media'), async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Только администраторы могут создавать посты' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Пожалуйста, загрузите медиафайл' });
    }

    // Проверяем размер файла в зависимости от типа
    if (req.file.size > req.fileTypeLimit) {
      return res.status(400).json({ 
        message: req.file.mimetype.startsWith('image/') 
          ? 'Размер изображения не должен превышать 10MB' 
          : 'Размер видео не должен превышать 100MB'
      });
    }

    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    const content = new Content({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: `/uploads/${req.file.filename}`,
      mediaType: mediaType,
      author: req.user.id
    });

    const newContent = await content.save();
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: error.message });
  }
});

// Добавить комментарий
router.post('/:id/comments', checkAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    const comment = {
      text: req.body.text,
    };

    if (req.isGuest) {
      comment.guestAuthor = req.guestUser.username;
      comment.isAdmin = false;
    } else {
      comment.author = req.user.id;
      comment.isAdmin = req.user.role === 'admin';
    }

    content.comments.push(comment);
    await content.save();
    
    const updatedContent = await Content.findById(req.params.id)
      .populate('comments.author', 'username');
    
    res.status(201).json(updatedContent.comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Добавить/убрать реакцию
router.post('/:id/react', checkAuth, async (req, res) => {
  try {
    const { type } = req.body; // 'likes' или 'hearts'
    if (!['likes', 'hearts'].includes(type)) {
      return res.status(400).json({ message: 'Неверный тип реакции' });
    }

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    const guestType = `guest${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const userId = req.isGuest ? req.guestUser.id : req.user.id;
    const reactionArray = req.isGuest ? content.reactions[guestType] : content.reactions[type];
    
    const userReacted = reactionArray.includes(userId);
    
    if (userReacted) {
      // Убираем реакцию
      content.reactions[req.isGuest ? guestType : type] = reactionArray.filter(
        id => id.toString() !== userId
      );
    } else {
      // Добавляем реакцию
      content.reactions[req.isGuest ? guestType : type].push(userId);
    }

    await content.save();

    // Возвращаем общее количество реакций
    const response = {
      likes: content.reactions.likes.length + content.reactions.guestLikes.length,
      hearts: content.reactions.hearts.length + content.reactions.guestHearts.length,
      userReactions: {
        likes: req.isGuest 
          ? content.reactions.guestLikes.includes(userId)
          : content.reactions.likes.includes(userId),
        hearts: req.isGuest
          ? content.reactions.guestHearts.includes(userId)
          : content.reactions.hearts.includes(userId)
      }
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Удалить пост (только для админов)
router.delete('/:id', checkAuth, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Только администраторы могут удалять посты' });
  }

  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Контент не найден' });
    }

    await content.deleteOne();
    res.json({ message: 'Контент удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
