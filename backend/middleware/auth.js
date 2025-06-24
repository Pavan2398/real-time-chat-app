const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust if path differs

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log("Auth Header:", authHeader); // ← Debug line

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    req.user.id = req.user._id.toString(); // attach user info to request
    next();
  } catch (err) {
     console.error('JWT auth failed:', err.message); // ← Better error
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
