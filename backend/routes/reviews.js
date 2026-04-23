const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Submit a review
router.post('/', auth, (req, res) => {
  const { booking_id, rating, comment } = req.body;
  if (!booking_id || !rating) return res.status(400).json({ message: 'Missing review details' });

  // Ensure booking is completed and belongs to the user
  db.get(
    `SELECT b.* FROM bookings b 
     JOIN pets p ON b.pet_id = p.id 
     WHERE b.id = ? AND p.owner_id = ? AND b.status = 'completed'`,
    [booking_id, req.user.id],
    (err, booking) => {
      if (err || !booking) return res.status(403).json({ message: 'Cannot review this booking' });

      db.run(
        `INSERT INTO reviews (booking_id, rating, comment) VALUES (?, ?, ?)`,
        [booking_id, rating, comment],
        function (err) {
          if (err) return res.status(500).json({ message: 'Error submitting review' });
          res.status(201).json({ id: this.lastID, booking_id, rating, comment, timestamp: new Date() });
        }
      );
    }
  );
});

// Get all reviews
router.get('/', (req, res) => {
  db.all(
    `SELECT r.*, p.name as pet_name, u.username as owner_name 
     FROM reviews r
     JOIN bookings b ON r.booking_id = b.id
     JOIN pets p ON b.pet_id = p.id
     JOIN users u ON p.owner_id = u.id
     ORDER BY r.timestamp DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error retrieving reviews' });
      res.json(rows);
    }
  );
});

module.exports = router;
