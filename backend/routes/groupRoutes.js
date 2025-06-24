const express = require('express');
const router = express.Router();
const { createGroup, getMyGroups ,getGroupsByUser} = require('../controllers/groupController');
const authMiddleware = require('../middleware/auth'); // ensures req.user

router.post('/',authMiddleware , createGroup);
router.get('/', authMiddleware , getMyGroups);
router.get('/user/:userId', getGroupsByUser);
router.get('/messages/group/:groupId', async (req, res) => {
  try {
    const messages = await Message.find({
      groupId: req.params.groupId,
      chatType: 'group'
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching group messages' });
  }
});


module.exports = router;
