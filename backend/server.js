const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const workTypeRoutes = require('./routes/worktype.routes');
app.use('/api/worktypes', workTypeRoutes);

const taskRoutes = require('./routes/task.routes');
app.use('/api/tasks', taskRoutes);

const publicRoutes = require('./routes/public.routes');
app.use('/api/public', publicRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/admins', adminRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to College Maintenance Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // Handle multer errors (file upload errors)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: 'File too large. Maximum size allowed is 10MB per file.',
      error: 'FILE_TOO_LARGE'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      message: 'Too many files. Maximum 5 files allowed.',
      error: 'TOO_MANY_FILES'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      message: 'Unexpected field name for file upload.',
      error: 'UNEXPECTED_FIELD'
    });
  }
  
  // Handle AWS S3 errors
  if (err.code && err.code.startsWith('AWS_')) {
    console.error('AWS S3 Error:', err);
    return res.status(500).json({ 
      message: 'File upload failed. Please check your AWS configuration.',
      error: 'AWS_UPLOAD_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle multer-s3 specific errors
  if (err.message && err.message.includes('S3')) {
    console.error('S3 Upload Error:', err);
    return res.status(500).json({ 
      message: 'File upload to cloud storage failed.',
      error: 'S3_UPLOAD_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      error: 'VALIDATION_ERROR',
      details: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token',
      error: 'INVALID_TOKEN'
    });
  }
  
  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    console.error('MongoDB Error:', err);
    return res.status(500).json({ 
      message: 'Database error occurred',
      error: 'DATABASE_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Generic error fallback
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Socket.io setup
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  
  // Listen for task status updates
  socket.on('taskStatusUpdate', (data) => {
    // Broadcast the update to all connected clients
    io.emit('taskUpdated', data);
  });
  
  // Listen for new task assignments
  socket.on('newTaskAssigned', (data) => {
    // Broadcast the new assignment to all connected clients
    io.emit('taskAssigned', data);
  });
});

// Export io instance for use in other files
module.exports = { io };
