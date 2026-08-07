const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const protect = [authenticate, authorize('normal')];

function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 16) return 'Password must be 8-16 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

// GET /api/user/stores
router.get('/stores', protect, async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id;

    let params = [userId];
    let searchClause = '';

    if (search) {
      searchClause = `AND (s.name ILIKE $2 OR s.address ILIKE $2)`;
      params.push(`%${search}%`);
    }

    const query = `
      SELECT
        s.id,
        s.name,
        s.address,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        ur.rating AS my_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
      WHERE 1=1 ${searchClause}
      GROUP BY s.id, ur.rating
      ORDER BY s.name ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/user/ratings
router.post('/ratings', protect, async (req, res) => {
  const { store_id, rating } = req.body;
  const userId = req.user.id;

  if (!store_id) return res.status(400).json({ message: 'store_id is required' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

  try {
    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [store_id]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating
       RETURNING *`,
      [userId, store_id, rating]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/user/password
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
