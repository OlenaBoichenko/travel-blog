const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = null;
      req.isGuest = true;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      req.isGuest = true;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId || decoded.id);

    if (!user) {
      req.user = null;
      req.isGuest = true;
      return next();
    }

    req.user = user;
    req.isGuest = false;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    req.user = null;
    req.isGuest = true;
    next();
  }
};

module.exports = {
  checkAuth
};
