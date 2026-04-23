const express = require('express');
const db = require('../db');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all users with pet counts and booking stats
router.get('/users', adminAuth, (req, res) => {
  const query = `
    SELECT u.id, u.username, u.role, 
           COUNT(DISTINCT p.id) as pet_count,
           COUNT(DISTINCT b.id) as booking_count
    FROM users u
    LEFT JOIN pets p ON u.id = p.owner_id
    LEFT JOIN bookings b ON p.id = b.pet_id
    GROUP BY u.id
    ORDER BY u.id DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving users' });
    res.json(rows);
  });
});

// Get revenue breakdown by service type
router.get('/revenue', adminAuth, (req, res) => {
  const query = `
    SELECT service_type, 
           COUNT(*) as count,
           SUM(total_price) as total,
           AVG(total_price) as average
    FROM bookings 
    WHERE status IN ('confirmed', 'completed')
    GROUP BY service_type
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving revenue data' });
    res.json(rows);
  });
});

// Get recent activity (latest bookings and status updates)
router.get('/activity', adminAuth, (req, res) => {
  const query = `
    SELECT 'booking' as type, b.id, p.name as pet_name, u.username as owner, 
           b.status, b.service_type, b.start_date as timestamp
    FROM bookings b
    JOIN pets p ON b.pet_id = p.id
    JOIN users u ON p.owner_id = u.id
    ORDER BY b.id DESC
    LIMIT 10
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving activity' });
    res.json(rows);
  });
});

// Delete a user (admin only, cannot delete self)
router.delete('/users/:id', adminAuth, (req, res) => {
  const userId = req.params.id;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  
  db.serialize(() => {
    // Delete user's bookings, pets, then user
    db.run(`DELETE FROM bookings WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId]);
    db.run(`DELETE FROM pets WHERE owner_id = ?`, [userId]);
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
      if (err) return res.status(500).json({ message: 'Error deleting user' });
      if (this.changes === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User and associated data removed' });
    });
  });
});

module.exports = router;
