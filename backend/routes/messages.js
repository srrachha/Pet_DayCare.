const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Send a message
router.post('/', auth, (req, res) => {
  const { receiver_id, message } = req.body;
  if (!receiver_id || !message) return res.status(400).json({ message: 'Missing details' });

  db.run(
    `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
    [req.user.id, receiver_id, message],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error sending message' });
      res.status(201).json({ id: this.lastID, sender_id: req.user.id, receiver_id, message, timestamp: new Date() });
    }
  );
});

// Get messages for a conversation
router.get('/:userId', auth, (req, res) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user.id;

  db.all(
    `SELECT * FROM messages 
     WHERE (sender_id = ? AND receiver_id = ?) 
     OR (sender_id = ? AND receiver_id = ?) 
     ORDER BY timestamp ASC`,
    [currentUserId, otherUserId, otherUserId, currentUserId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error retrieving messages' });
      res.json(rows);
    }
  );
});

// Get all chat partners for the current user
router.get('/', auth, (req, res) => {
  db.all(
    `SELECT DISTINCT u.id, u.username 
     FROM users u
     JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
     WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?`,
    [req.user.id, req.user.id, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error retrieving conversations' });
      res.json(rows);
    }
  );
});

module.exports = router;
