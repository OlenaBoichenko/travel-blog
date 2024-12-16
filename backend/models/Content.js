const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestAuthor: {
    type: String,
    required: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [commentSchema],
  reactions: {
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    hearts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    guestLikes: [{
      type: String  // Будем хранить ID гостевого пользователя
    }],
    guestHearts: [{
      type: String  // Будем хранить ID гостевого пользователя
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
