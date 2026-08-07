require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function seed() {
  const name = 'System Administrator';
  const email = 'admin@storerating.com';
  const password = 'Admin@123';
  const address = 'Admin Office, 123 Main Street';
  const role = 'admin';

  const hashed = await bcrypt.hash(password, 10);

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashed, address, role]
    );
    console.log('Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
