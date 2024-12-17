const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
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
  youtubeUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}$/.test(v);
      },
      message: props => `${props.value} не является корректной ссылкой на YouTube видео!`
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [commentSchema],
  reactions: {
    likes: [{
      type: String
    }],
    hearts: [{
      type: String
    }],
    guestLikes: [{
      type: String
    }],
    guestHearts: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
