const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const Message = require('../models/Message');

// router.get('/', getMessages);
// router.post('/', saveMessage);
router.post('/', messageController.saveMessage);
// router.get('/:user1/:user2', messageController.getMessages);

router.get('/history/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});
router.get('/group/:groupId', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching group messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;
