const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trucks ORDER BY created_at DESC');
    result.rows.forEach(row => {
      try { row.documents = JSON.parse(row.documents); } catch (e) { row.documents = []; }
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trucks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Truck not found' });
    try { result.rows[0].documents = JSON.parse(result.rows[0].documents); } catch (e) { result.rows[0].documents = []; }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const t = req.body;
    await db.query(
      `INSERT INTO trucks (id, registration_number, model, capacity, year, chassis_number,
       engine_number, fuel_type, mileage, owner_name, owner_phone, status, 
       insurance_expiry, permit_expiry, pollution_expiry, fitness_expiry,
       road_tax_expiry, documents, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [t.id, t.registrationNumber, t.model, t.capacity, t.year, t.chassisNumber,
       t.engineNumber, t.fuelType || 'Diesel', t.mileage || 0, t.ownerName,
       t.ownerPhone, t.status || 'Active', t.insuranceExpiry, t.permitExpiry,
       t.pollutionExpiry, t.fitnessExpiry, t.roadTaxExpiry,
       JSON.stringify(t.documents || []), t.notes]
    );
    res.json({ success: true, id: t.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const t = req.body;
    await db.query(
      `UPDATE trucks SET registration_number=$1, model=$2, capacity=$3, year=$4, 
       chassis_number=$5, engine_number=$6, fuel_type=$7, mileage=$8, owner_name=$9,
       owner_phone=$10, status=$11, insurance_expiry=$12, permit_expiry=$13,
       pollution_expiry=$14, fitness_expiry=$15, road_tax_expiry=$16, documents=$17, notes=$18,
       updated_at=NOW() WHERE id=$19`,
      [t.registrationNumber, t.model, t.capacity, t.year, t.chassisNumber,
       t.engineNumber, t.fuelType, t.mileage, t.ownerName, t.ownerPhone,
       t.status, t.insuranceExpiry, t.permitExpiry, t.pollutionExpiry,
       t.fitnessExpiry, t.roadTaxExpiry, JSON.stringify(t.documents || []), t.notes,
       req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM trucks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
