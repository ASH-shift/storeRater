const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const protect = [authenticate, authorize('store_owner')];

function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 16) return 'Password must be 8-16 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

router.get('/dashboard', protect, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const storeResult = await pool.query(
      `SELECT s.id, s.name, ROUND(AVG(r.rating), 2) AS avg_rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.json({ store: null, raters: [] });
    }

    const store = storeResult.rows[0];

    const ratersResult = await pool.query(
      `SELECT u.name AS user_name, u.email AS user_email, r.rating
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY u.name ASC`,
      [store.id]
    );

    res.json({
      store: {
        name: store.name,
        avgRating: store.avg_rating
      },
      raters: ratersResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });

  const passwordErr = validatePassword(newPassword);
  if (passwordErr) return res.status(400).json({ message: passwordErr });

  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
