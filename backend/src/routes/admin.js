const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const protect = [authenticate, authorize('admin')];

const SORT_WHITELIST_USERS = ['name', 'email', 'address', 'role'];
const SORT_WHITELIST_STORES = ['name', 'email', 'address', 'rating'];

function validateName(name) {
  if (!name || name.length < 20 || name.length > 60) return 'Name must be between 20 and 60 characters';
  return null;
}

function validateEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 16) return 'Password must be 8-16 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

function validateAddress(address) {
  if (!address || address.length === 0) return 'Address is required';
  if (address.length > 400) return 'Address must be at most 400 characters';
  return null;
}

// GET /api/admin/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const storesResult = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsResult = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalStores: parseInt(storesResult.rows[0].count),
      totalRatings: parseInt(ratingsResult.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', protect, async (req, res) => {
  try {
    const { name, email, address, role, sort } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (name) {
      conditions.push(`u.name ILIKE $${paramIndex++}`);
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push(`u.email ILIKE $${paramIndex++}`);
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push(`u.address ILIKE $${paramIndex++}`);
      params.push(`%${address}%`);
    }
    if (role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY u.id ASC';
    if (sort) {
      const [field, direction] = sort.split(':');
      if (SORT_WHITELIST_USERS.includes(field)) {
        const dir = direction === 'desc' ? 'DESC' : 'ASC';
        orderClause = `ORDER BY u.${field} ${dir}`;
      }
    }

    const query = `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at FROM users u ${whereClause} ${orderClause}`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userResult = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.role === 'store_owner') {
      const storeResult = await pool.query(
        `SELECT s.name AS store_name, ROUND(AVG(r.rating), 2) AS avg_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1
         GROUP BY s.name`,
        [id]
      );

      if (storeResult.rows.length > 0) {
        user.store_name = storeResult.rows[0].store_name;
        user.avg_rating = storeResult.rows[0].avg_rating;
      }
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users
router.post('/users', protect, async (req, res) => {
  const { name, email, password, address, role } = req.body;

  const nameErr = validateName(name);
  if (nameErr) return res.status(400).json({ message: nameErr });

  const emailErr = validateEmail(email);
  if (emailErr) return res.status(400).json({ message: emailErr });

  const passwordErr = validatePassword(password);
  if (passwordErr) return res.status(400).json({ message: passwordErr });

  const addressErr = validateAddress(address);
  if (addressErr) return res.status(400).json({ message: addressErr });

  const validRoles = ['admin', 'normal', 'store_owner'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/stores
router.get('/stores', protect, async (req, res) => {
  try {
    const { name, email, address, sort } = req.query;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (name) {
      conditions.push(`s.name ILIKE $${paramIndex++}`);
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push(`s.email ILIKE $${paramIndex++}`);
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push(`s.address ILIKE $${paramIndex++}`);
      params.push(`%${address}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY s.id ASC';
    if (sort) {
      const [field, direction] = sort.split(':');
      if (SORT_WHITELIST_STORES.includes(field)) {
        const dir = direction === 'desc' ? 'DESC' : 'ASC';
        if (field === 'rating') {
          orderClause = `ORDER BY avg_rating ${dir} NULLS LAST`;
        } else {
          orderClause = `ORDER BY s.${field} ${dir}`;
        }
      }
    }

    const query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             ROUND(AVG(r.rating), 2) AS avg_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY s.id
      ${orderClause}
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/stores
router.post('/stores', protect, async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || name.length === 0) return res.status(400).json({ message: 'Store name is required' });
  if (name.length > 60) return res.status(400).json({ message: 'Store name must be at most 60 characters' });

  const emailErr = validateEmail(email);
  if (emailErr) return res.status(400).json({ message: emailErr });

  const addressErr = validateAddress(address);
  if (addressErr) return res.status(400).json({ message: addressErr });

  try {
    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'A store with this email already exists' });
    }

    if (owner_id) {
      const ownerCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'store_owner'", [owner_id]);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Owner not found or not a store_owner role' });
      }
    }

    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, owner_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
