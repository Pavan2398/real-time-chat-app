const Message = require('./models/Message');
let io;

const onlineUsers = new Map();     // ✅ Tracks online users
const lastSeenMap = new Map();     // ✅ Fix: Track last seen times

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('✅ User connected:', socket.id);

      socket.on('join', (userId) => {
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        console.log(`🚪 User ${userId} joined. Online count: ${onlineUsers.size}`);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      });

      socket.on('typing', ({ from, to }) => {
        const receiverSocketId = onlineUsers.get(to);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userTyping', { from });
        }
      });

      socket.on('sendMessage', async (data) => {
        console.log('📨 Message received:', data);

        try {
          const newMessage = new Message({
            senderId: data.senderId,
            receiverId: data.receiverId,
            text: data.text,
            timestamp: data.timestamp || new Date(),
            status: data.status || 'sent',
            chatType: data.chatType || 'private',
            groupId: data.groupId || null,
          });

          await newMessage.save();
          console.log('💾 Message saved to DB');

          const receiverSocketId = onlineUsers.get(data.receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveMessage', newMessage);
          }
        } catch (err) {
          console.error('❌ Error saving message to DB:', err);
        }
      });
      socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`✅ User joined group room: ${groupId}`);
      });
      socket.on('sendGroupMessage', async (data) => {
        const { groupId, senderId, text, timestamp, senderName, senderAvatar } = data;

        const message = new Message({
          groupId,
          senderId,
          text,
          timestamp,
          chatType: 'group',
          senderName,
          senderAvatar
        });

        await message.save();

        io.to(groupId).emit('receiveGroupMessage', message);
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          onlineUsers.delete(socket.userId);
          lastSeenMap.set(socket.userId, new Date().toISOString()); // ✅ no longer throws error

          io.emit('onlineUsers', Array.from(onlineUsers.keys()));
          io.emit('lastSeenUpdate', {
            userId: socket.userId,
            lastSeen: lastSeenMap.get(socket.userId)
          });
        }

        console.log('❌ User disconnected:', socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  }
};
