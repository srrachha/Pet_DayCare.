const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const petRoutes = require('./routes/pets');
app.use('/api/pets', petRoutes);

const bookingRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

// Serve Static Files from Frontend
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Catch-all route to serve Frontend index.html for SPA routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
