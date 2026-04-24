const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM maintenance ORDER BY service_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const m = req.body;
    const result = await db.query(
      `INSERT INTO maintenance (truck_id, truck_number, service_type, description,
       service_date, next_service_date, cost, service_center, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [m.truckId, m.truckNumber, m.serviceType, m.description, m.serviceDate,
       m.nextServiceDate, m.cost || 0, m.serviceCenter, m.status || 'Scheduled']
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const m = req.body;
    await db.query(
      `UPDATE maintenance SET service_type=$1, description=$2, service_date=$3,
       next_service_date=$4, cost=$5, service_center=$6, status=$7 WHERE id=$8`,
      [m.serviceType, m.description, m.serviceDate, m.nextServiceDate,
       m.cost, m.serviceCenter, m.status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM maintenance WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
