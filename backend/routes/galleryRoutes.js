const express = require('express');
const dotenv = require("dotenv");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { checkAuth } = require('../middlewares/authMiddleware');
const Gallery = require('../models/Gallery');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Настройка multer для загрузки изображений
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gallery', // Имя папки в Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

const upload = multer({storage});

// Получить все изображения
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Загрузить новое изображение (только для админов)
router.post('/', checkAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Пользователь не авторизован' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
    }

    const image = new Gallery({
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.file.path,
      reactions: {
        likes: [],
        hearts: [],
        guestLikes: [],
        guestHearts: []
      }
    });

    const savedImage = await image.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error('Ошибка при загрузке изображения:', error);
  }
});

// Добавить реакцию к изображению
router.post('/:id/reactions', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Изображение не найдено' });
    }

    const { type } = req.body;
    const reactionTypes = ['likes', 'hearts'];
    const guestReactionTypes = ['guestLikes', 'guestHearts'];

    if (!reactionTypes.includes(type)) {
      return res.status(400).json({ message: 'Неверный тип реакции' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const isGuest = !token;
    const reactionField = isGuest ? `guest${type.charAt(0).toUpperCase() + type.slice(1)}` : type;
    const reactionId = isGuest ? req.ip : req.user?.id || req.ip;

    const hasReacted = image.reactions[reactionField].includes(reactionId);
    if (hasReacted) {
      image.reactions[reactionField] = image.reactions[reactionField].filter(id => id !== reactionId);
    } else {
      image.reactions[reactionField].push(reactionId);
    }

    await image.save();
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
