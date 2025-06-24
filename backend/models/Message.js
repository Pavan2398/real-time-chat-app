const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required:  function () {
    return this.chatType === 'private';
  } }, // For private chats
  text: { type: String, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  chatType: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
  groupId: {  type: String,
  required: function () {
    return this.chatType === 'group';
  } }, // Optional for group chats
});

module.exports = mongoose.model('Message', messageSchema);
