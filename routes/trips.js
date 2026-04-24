const express = require('express');
const db = require('../config/database');
const router = express.Router();

// GET all trips
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trips ORDER BY created_at DESC');
    const trips = result.rows || [];
    
    for (const trip of trips) {
      try {
        const expResult = await db.query('SELECT * FROM trip_expenses WHERE trip_id = $1', [trip.id]);
        trip.expenses = expResult.rows || [];
      } catch (e) {
        trip.expenses = [];
      }
      
      trip.rateCalculation = trip.rate_type ? {
        rateType: trip.rate_type,
        rate: parseFloat(trip.rate || 0),
        kl: parseFloat(trip.rate_kl || 0),
        km: parseFloat(trip.rate_km || 0),
        totalTripRate: parseFloat(trip.total_trip_rate || 0)
      } : null;
    }
    
    res.json(trips);
  } catch (err) {
    console.error('GET /trips error:', err.message);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// GET single trip
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trips WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    
    const trip = result.rows[0];
    try {
      const expResult = await db.query('SELECT * FROM trip_expenses WHERE trip_id = $1', [trip.id]);
      trip.expenses = expResult.rows || [];
    } catch (e) {
      trip.expenses = [];
    }
    
    trip.rateCalculation = trip.rate_type ? {
      rateType: trip.rate_type,
      rate: parseFloat(trip.rate || 0),
      kl: parseFloat(trip.rate_kl || 0),
      km: parseFloat(trip.rate_km || 0),
      totalTripRate: parseFloat(trip.total_trip_rate || 0)
    } : null;
    
    res.json(trip);
  } catch (err) {
    console.error('GET /trips/:id error:', err.message);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// CREATE trip
router.post('/', async (req, res) => {
  try {
    const t = req.body;
    const rc = t.rateCalculation || {};
    
    await db.query(
      `INSERT INTO trips (id, truck_id, truck_number, driver_id, driver_name, customer_name, 
       material_name, loading_location, destination, loading_date, document_number, 
       invoice_number, quantity_loaded, trip_start_km, advance_payment, status,
       rate_type, rate, rate_kl, rate_km, total_trip_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        t.id, t.truckId || null, t.truckNumber || '', t.driverId || null, t.driverName || '', 
        t.customerName || '', t.materialName || '', t.loadingLocation || '', t.destination || '', 
        t.loadingDate || null, t.documentNumber || '', t.invoiceNumber || '', 
        t.quantityLoaded || 0, t.tripStartKm || 0, t.advancePayment || 0, t.status || 'Pending',
        rc.rateType || null, rc.rate || 0, rc.kl || t.quantityLoaded || 0, rc.km || 0, rc.totalTripRate || 0
      ]
    );
    
    if (t.expenses && t.expenses.length > 0) {
      for (const exp of t.expenses) {
        await db.query(
          'INSERT INTO trip_expenses (trip_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)',
          [t.id, exp.type || '', exp.amount || 0, exp.description || '', exp.date || null]
        );
      }
    }
    
    res.json({ success: true, id: t.id });
  } catch (err) {
    console.error('POST /trips error:', err.message);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// UPDATE trip
router.put('/:id', async (req, res) => {
  try {
    const t = req.body;
    const rc = t.rateCalculation || {};
    
    await db.query(
      `UPDATE trips SET 
       truck_number=$1, driver_name=$2, customer_name=$3, material_name=$4,
       loading_location=$5, destination=$6, loading_date=$7, unloading_date=$8,
       closing_date=$9, document_number=$10, invoice_number=$11, quantity_loaded=$12,
       quantity_unloaded=$13, shortage_quantity=$14, trip_start_km=$15, trip_end_km=$16,
       total_km=$17, advance_payment=$18, status=$19,
       rate_type=$20, rate=$21, rate_kl=$22, rate_km=$23, total_trip_rate=$24,
       truck_id=$25, driver_id=$26, updated_at=NOW()
       WHERE id=$27`,
      [
        t.truckNumber || '', t.driverName || '', t.customerName || '', t.materialName || '',
        t.loadingLocation || '', t.destination || '', t.loadingDate || null, t.unloadingDate || null,
        t.closingDate || null, t.documentNumber || '', t.invoiceNumber || '', t.quantityLoaded || 0,
        t.quantityUnloaded || 0, t.shortageQuantity || 0, t.tripStartKm || 0, t.tripEndKm || 0,
        t.totalKm || 0, t.advancePayment || 0, t.status || 'Pending',
        rc.rateType || null, rc.rate || 0, rc.kl || 0, rc.km || 0, rc.totalTripRate || 0,
        t.truckId || null, t.driverId || null, req.params.id
      ]
    );
    
    await db.query('DELETE FROM trip_expenses WHERE trip_id = $1', [req.params.id]);
    if (t.expenses && t.expenses.length > 0) {
      for (const exp of t.expenses) {
        await db.query(
          'INSERT INTO trip_expenses (trip_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5)',
          [req.params.id, exp.type || '', exp.amount || 0, exp.description || '', exp.date || null]
        );
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /trips/:id error:', err.message);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

// DELETE trip
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM trip_expenses WHERE trip_id = $1', [req.params.id]);
    await db.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /trips/:id error:', err.message);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

module.exports = router;
