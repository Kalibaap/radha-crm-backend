const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM drivers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM drivers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const d = req.body;
    await db.query(
      `INSERT INTO drivers (id, name, phone, license_number, license_expiry, address,
       emergency_contact, blood_group, joining_date, status, photo, experience_years, salary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [d.id, d.name, d.phone, d.licenseNumber, d.licenseExpiry, d.address,
       d.emergencyContact, d.bloodGroup, d.joiningDate, d.status || 'Available', 
       d.photo, d.experienceYears || 0, d.salary || 0]
    );
    res.json({ success: true, id: d.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const d = req.body;
    await db.query(
      `UPDATE drivers SET name=$1, phone=$2, license_number=$3, license_expiry=$4, address=$5,
       emergency_contact=$6, blood_group=$7, joining_date=$8, status=$9, photo=$10,
       experience_years=$11, salary=$12, updated_at=NOW() WHERE id=$13`,
      [d.name, d.phone, d.licenseNumber, d.licenseExpiry, d.address,
       d.emergencyContact, d.bloodGroup, d.joiningDate, d.status, d.photo,
       d.experienceYears, d.salary, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
