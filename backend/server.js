const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Store io in express app
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ACTIVITY TRACKER MIDDLEWARE (Apply to all routes)
const trackActivity = require('./middleware/activityTracker');
app.use(trackActivity);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const aiRoutes = require('./routes/aiRoutes');
const queueRoutes = require('./routes/queueRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const familyRoutes = require('./routes/familyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/family', familyRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Doctor Appointment System API with WebRTC & AI Services' });
});

// ==========================================
// 🚀 REAL-TIME SOCKET.IO & WEBRTC SIGNALING
// ==========================================
io.on('connection', (socket) => {
  console.log('⚡ Client connected to Socket.IO:', socket.id);

  // --- WebRTC Video Consultation Signaling ---
  socket.on('join-room', ({ roomId, userId, role, userName }) => {
    socket.join(roomId);
    console.log(`👤 User ${userName || userId} (${role}) joined video room: ${roomId}`);
    socket.to(roomId).emit('user-joined', { userId, role, userName, socketId: socket.id });
  });

  socket.on('offer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('offer', { sdp, senderId: socket.id });
  });

  socket.on('answer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('answer', { sdp, senderId: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, senderId: socket.id });
  });

  socket.on('end-call', ({ roomId }) => {
    socket.to(roomId).emit('call-ended');
  });

  // --- Live Queue Tracking Subscription ---
  socket.on('subscribe-queue', ({ doctorId }) => {
    socket.join(`queue-${doctorId}`);
    console.log(`📋 Socket ${socket.id} subscribed to queue-${doctorId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`📹 WebRTC & Socket.IO Signaling Active`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };