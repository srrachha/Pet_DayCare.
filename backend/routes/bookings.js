const express = require('express');
const db = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all bookings
router.get('/', auth, (req, res) => {
  let query, params;
  if (req.user.role === 'admin') {
    query = `SELECT b.*, p.name as pet_name, u.username as owner_name 
             FROM bookings b 
             JOIN pets p ON b.pet_id = p.id 
             JOIN users u ON p.owner_id = u.id`;
    params = [];
  } else {
    query = `SELECT b.*, p.name as pet_name 
             FROM bookings b 
             JOIN pets p ON b.pet_id = p.id 
             WHERE p.owner_id = ?`;
    params = [req.user.id];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving bookings' });
    res.json(rows);
  });
});

// Create a booking
router.post('/', auth, (req, res) => {
  const { pet_id, start_date, end_date, service_type } = req.body;
  if (!pet_id || !start_date || !end_date) return res.status(400).json({ message: 'Missing booking details' });

  const service = service_type || 'Daycare';
  
  // Calculate total price
  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  let total_price = 0;
  if (service === 'Daycare') total_price = diffDays * 500; // ₹500 per day
  else if (service === 'Boarding') total_price = diffDays * 800; // ₹800 per day
  else if (service === 'Grooming') total_price = 600; // Flat fee ₹600

  // Ensure user owns the pet
  db.get(`SELECT * FROM pets WHERE id = ? AND owner_id = ?`, [pet_id, req.user.id], (err, pet) => {
    if (err || !pet) return res.status(403).json({ message: 'Unauthorized pet selection' });

    db.run(
      `INSERT INTO bookings (pet_id, start_date, end_date, status, service_type, total_price) VALUES (?, ?, ?, 'pending', ?, ?)`,
      [pet_id, start_date, end_date, service, total_price],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error creating booking' });
        res.status(201).json({ id: this.lastID, pet_id, start_date, end_date, status: 'pending', service_type: service, total_price });
      }
    );
  });
});

// Update booking status (Admin only)
router.patch('/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ message: 'Error updating booking' });
    res.json({ message: 'Booking status updated' });
  });
});

// Add real-time status update for a booking (Admin only)
router.post('/:id/status_update', adminAuth, (req, res) => {
  const { status_update } = req.body;
  db.run(
    `INSERT INTO pet_status (booking_id, status_update) VALUES (?, ?)`,
    [req.params.id, status_update],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error adding status update' });
      res.status(201).json({ message: 'Status update added' });
    }
  );
});

// Get status history for a booking
router.get('/:id/history', auth, (req, res) => {
  db.all(`SELECT * FROM pet_status WHERE booking_id = ? ORDER BY timestamp DESC`, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving status history' });
    res.json(rows);
  });
});

module.exports = router;
