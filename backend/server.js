const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes'); // Import group routes
const http = require('http');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend access
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes); // Use group routes
//Socket.io
const server = http.createServer(app);
const io = require('./socket').init(server);
// io.on('connection', (socket) => {
//   console.log('✅ A user connected:', socket.id);

//   socket.on('join', (userId) => {
//     socket.join(userId);
//     console.log(`🚪 User ${userId} joined room`);
//   });

//   socket.on('sendMessage', (message) => {
//     console.log('📨 Message received:', message);
//     io.to(message.receiverId).emit('receiveMessage', message);
//   });

//   socket.on('disconnect', () => {
//     console.log('❌ A user disconnected:', socket.id);
//   });
// });


// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth-form';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.error('MongoDB connection error:', err));
