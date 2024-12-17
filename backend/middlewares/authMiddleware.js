const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('No auth header');
      req.user = null;
      req.isGuest = true;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token in auth header');
      req.user = null;
      req.isGuest = true;
      return next();
    }

    console.log('Token received');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully');

    const user = await User.findById(decoded.userId || decoded.id);
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      console.log('User not found');
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
