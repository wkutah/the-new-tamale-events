const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const savedRoutes = require('./routes/saved');
const activityRoutes = require('./routes/activity');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory for event posters
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'The New Tamale Events API',
    cities: ['Tamale', 'Damongo', 'Bolgatanga', 'Wa', 'Bole', 'Nyankpala'],
    time: new Date().toISOString()
  });
});

// Serve frontend build in production if available
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
const indexPath = path.join(clientBuildPath, 'index.html');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath, (err) => {
          if (err && !res.headersSent) next(err);
        });
      }
    }
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  The New Tamale Events API Server Running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Target Cities: Tamale, Damongo, Bolgatanga, Wa`);
  console.log(`====================================================`);
});
