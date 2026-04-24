const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const e = req.body;
    const result = await db.query(
      `INSERT INTO expenses (type, category, amount, description, date, truck_id, driver_id, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [e.type, e.category, e.amount, e.description, e.date, e.truckId, e.driverId, e.status || 'Pending', e.createdBy]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const e = req.body;
    await db.query(
      `UPDATE expenses SET type=$1, category=$2, amount=$3, description=$4,
       date=$5, truck_id=$6, driver_id=$7, status=$8 WHERE id=$9`,
      [e.type, e.category, e.amount, e.description, e.date, e.truckId, e.driverId, e.status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
