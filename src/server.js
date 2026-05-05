const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { globalLimiter } = require('./middleware/rateLimiter');
const batchRoutes = require('./routes/batchRoutes');
const claimRoutes = require('./routes/claimRoutes');
const sampleRoutes = require('./routes/sampleRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Attach io to req object so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5001;

// Trust the first proxy in production for accurate IP rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Apply global rate limiting (100 req / 15 min)
app.use(globalLimiter);

// Routes
app.use('/api/batches', batchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/sample', sampleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Food Waste Redistribution Platform Backend is running' });
});

// Catch-all route to serve React's index.html for client-side routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  } else {
    next();
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`
   Server is running on http://localhost:${PORT}
   Rate Limiting: 100 req / 15 min
   MySQL Connectivity: Pool Initialized
   Redis: Client Initialized
  `);
});
