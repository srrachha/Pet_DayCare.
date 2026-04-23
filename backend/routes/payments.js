const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Mock Stripe integration for now
// In a real app, you'd use: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
router.post('/create-intent', auth, (req, res) => {
  const { booking_id } = req.body;

  db.get(`SELECT total_price FROM bookings WHERE id = ? AND status != 'cancelled'`, [booking_id], (err, booking) => {
    if (err || !booking) return res.status(404).json({ message: 'Booking not found' });

    const amount = booking.total_price;
    
    // Simulate Stripe payment intent creation
    const mockIntentId = 'pi_mock_' + Math.random().toString(36).substr(2, 9);
    
    db.run(
      `INSERT INTO payments (booking_id, amount, status, stripe_payment_intent_id) VALUES (?, ?, 'pending', ?)`,
      [booking_id, amount, mockIntentId],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error creating payment record' });
        
        res.json({
          clientSecret: 'mock_secret_for_' + mockIntentId,
          amount: amount,
          currency: 'inr'
        });
      }
    );
  });
});

// Update payment status (Webhook mock or Direct call)
router.post('/confirm', auth, (req, res) => {
  const { booking_id, status } = req.body;
  
  const paymentStatus = status === 'succeeded' ? 'completed' : 'failed';
  
  db.run(`UPDATE payments SET status = ? WHERE booking_id = ?`, [paymentStatus, booking_id], function (err) {
    if (err) return res.status(500).json({ message: 'Error updating payment' });
    
    // If completed, update booking status? (Optional, maybe keep as 'confirmed' but 'paid')
    // For now, just confirm the payment record
    res.json({ message: `Payment ${paymentStatus}` });
  });
});

module.exports = router;
