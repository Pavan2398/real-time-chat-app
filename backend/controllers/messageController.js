const Message = require('../models/Message');

// exports.getMessages = async (req, res) => {
//   const { senderId, receiverId } = req.query;
//   const messages = await Message.find({
//     $or: [
//       { senderId, receiverId },
//       { senderId: receiverId, receiverId: senderId }
//     ]
//   }).sort({ timestamp: 1 });
//   res.json(messages);
// };

// exports.saveMessage = async (req, res) => {
//   const { senderId, receiverId, text } = req.body;
//   const message = new Message({ senderId, receiverId, text });
//   await message.save();
//   res.status(201).json(message);
// };

exports.saveMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all messages between two users (private chat)
exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ timestamp: 1 }).lean();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
