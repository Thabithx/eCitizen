const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectdb = require('./config/dbconfig');
const citizenRoutes = require('./routes/citizenRoutes');
const publicRoutes = require('./routes/publicRoutes');
const aboutRoutes = require('./routes/aboutRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend and uploads)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/citizens', citizenRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/supportRoutes')); 
app.use('/api', publicRoutes);
app.use('/api', aboutRoutes); 
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

async function startServer() {
  try {
    await connectdb();

    const PORT = process.env.PORT || 3030;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
