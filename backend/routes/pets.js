const express = require('express');
const db = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all pets (Admin see all, User see theirs)
router.get('/', auth, (req, res) => {
  const query = req.user.role === 'admin' ? `SELECT * FROM pets` : `SELECT * FROM pets WHERE owner_id = ?`;
  const params = req.user.role === 'admin' ? [] : [req.user.id];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving pets' });
    res.json(rows);
  });
});

// Add a pet
router.post('/', auth, (req, res) => {
  const { name, breed, age, special_instructions, vaccination_status, vaccination_expiry } = req.body;
  if (!name) return res.status(400).json({ message: 'Pet name is required' });

  db.run(
    `INSERT INTO pets (owner_id, name, breed, age, special_instructions, vaccination_status, vaccination_expiry) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, name, breed, age, special_instructions, vaccination_status || 'Missing', vaccination_expiry],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error adding pet' });
      res.status(201).json({ id: this.lastID, name, breed, age, special_instructions, vaccination_status, vaccination_expiry });
    }
  );
});

// Get pet by ID
router.get('/:id', auth, (req, res) => {
  db.get(`SELECT * FROM pets WHERE id = ?`, [req.params.id], (err, pet) => {
    if (err || !pet) return res.status(404).json({ message: 'Pet not found' });
    if (req.user.role !== 'admin' && pet.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(pet);
  });
});

// Update a pet
router.put('/:id', auth, (req, res) => {
  const { name, breed, age, special_instructions, vaccination_status, vaccination_expiry } = req.body;
  if (!name) return res.status(400).json({ message: 'Pet name is required' });

  db.get(`SELECT * FROM pets WHERE id = ?`, [req.params.id], (err, pet) => {
    if (err || !pet) return res.status(404).json({ message: 'Pet not found' });
    if (req.user.role !== 'admin' && pet.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    db.run(
      `UPDATE pets SET name = ?, breed = ?, age = ?, special_instructions = ?, vaccination_status = ?, vaccination_expiry = ? WHERE id = ?`,
      [name, breed, age, special_instructions, vaccination_status, vaccination_expiry, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error updating pet' });
        res.json({ message: 'Pet updated successfully' });
      }
    );
  });
});

// Delete a pet
router.delete('/:id', auth, (req, res) => {
  db.get(`SELECT * FROM pets WHERE id = ?`, [req.params.id], (err, pet) => {
    if (err || !pet) return res.status(404).json({ message: 'Pet not found' });
    if (req.user.role !== 'admin' && pet.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    db.run(`DELETE FROM pets WHERE id = ?`, [req.params.id], function (err) {
      if (err) return res.status(500).json({ message: 'Error deleting pet' });
      res.json({ message: 'Pet deleted successfully' });
    });
  });
});

module.exports = router;
