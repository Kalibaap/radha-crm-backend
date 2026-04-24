const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, name, email, phone, role, status, avatar, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, name, email, phone, role, status, avatar, created_at FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const u = req.body;
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, name, email, phone, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [u.username, hashedPassword, u.name, u.email, u.phone, u.role || 'Viewer', u.status || 'Active']
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const u = req.body;
    let query = 'UPDATE users SET name=$1, email=$2, phone=$3, role=$4, status=$5, updated_at=NOW() WHERE id=$6';
    let params = [u.name, u.email, u.phone, u.role, u.status, req.params.id];
    
    if (u.password) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      query = 'UPDATE users SET name=$1, email=$2, phone=$3, role=$4, status=$5, password=$6, updated_at=NOW() WHERE id=$7';
      params = [u.name, u.email, u.phone, u.role, u.status, hashedPassword, req.params.id];
    }
    
    await db.query(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
