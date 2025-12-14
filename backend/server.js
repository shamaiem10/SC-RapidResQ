const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const chatRoutes = require('./routes/chat');
const communityRoutes = require('./routes/community');
const panicRoutes = require('./routes/panic');
const alertRoutes = require('./routes/alerts'); // <-- new alerts route

dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware - Allow CORS for development (localhost and local network)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl, mobile apps

    if (origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.match(/http:\/\/192\.168\.\d+\.\d+:3000/) ||
        origin.match(/http:\/\/10\.\d+\.\d+\.\d+:3000/)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: Log all incoming API requests (for development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });
}

// ----------------- API ROUTES -----------------
app.use('/api', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api', chatRoutes);
app.use('/api', communityRoutes);
app.use('/api', panicRoutes);
app.use('/api/alerts', alertRoutes); // <-- register alerts route

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
