const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/:id/others', async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
