const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const tripsCount = await db.query('SELECT COUNT(*) as count FROM trips');
    const activeTrips = await db.query('SELECT COUNT(*) as count FROM trips WHERE status IN ($1, $2, $3)', ['Loading', 'In Transit', 'Unloading']);
    const completedTrips = await db.query('SELECT COUNT(*) as count FROM trips WHERE status = $1', ['Completed']);
    
    const fleetCount = await db.query('SELECT COUNT(*) as count FROM trucks');
    const activeFleet = await db.query('SELECT COUNT(*) as count FROM trucks WHERE status = $1', ['Active']);
    
    const driversCount = await db.query('SELECT COUNT(*) as count FROM drivers');
    const availableDrivers = await db.query('SELECT COUNT(*) as count FROM drivers WHERE status = $1', ['Available']);
    
    const revenue = await db.query('SELECT SUM(total_trip_rate) as total FROM trips');
    const pendingRevenue = await db.query('SELECT SUM(total_trip_rate) as total FROM trips WHERE status != $1', ['Completed']);
    
    const tripExpenses = await db.query('SELECT SUM(amount) as total FROM trip_expenses');
    const generalExpenses = await db.query('SELECT SUM(amount) as total FROM expenses');
    
    const alerts = await db.query(
      `SELECT id, 'insurance' as type, insurance_expiry as expiry_date FROM trucks 
       WHERE insurance_expiry IS NOT NULL AND insurance_expiry <= CURRENT_DATE + INTERVAL '15 days'
       UNION ALL
       SELECT id, 'permit', permit_expiry FROM trucks 
       WHERE permit_expiry IS NOT NULL AND permit_expiry <= CURRENT_DATE + INTERVAL '15 days'
       UNION ALL
       SELECT id, 'fitness', fitness_expiry FROM trucks 
       WHERE fitness_expiry IS NOT NULL AND fitness_expiry <= CURRENT_DATE + INTERVAL '15 days'`
    );

    res.json({
      trips: { total: parseInt(tripsCount.rows[0].count), active: parseInt(activeTrips.rows[0].count), completed: parseInt(completedTrips.rows[0].count) },
      fleet: { total: parseInt(fleetCount.rows[0].count), active: parseInt(activeFleet.rows[0].count) },
      drivers: { total: parseInt(driversCount.rows[0].count), available: parseInt(availableDrivers.rows[0].count) },
      revenue: { total: parseFloat(revenue.rows[0].total || 0), pending: parseFloat(pendingRevenue.rows[0].total || 0) },
      expenses: { trip: parseFloat(tripExpenses.rows[0].total || 0), general: parseFloat(generalExpenses.rows[0].total || 0) },
      alerts: alerts.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/revenue-chart', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT TO_CHAR(loading_date, 'Mon') as month, SUM(total_trip_rate) as amount
       FROM trips WHERE loading_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY EXTRACT(MONTH FROM loading_date), TO_CHAR(loading_date, 'Mon') ORDER BY MIN(loading_date)`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent-trips', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, truck_number, driver_name, customer_name, status, loading_date, total_trip_rate FROM trips ORDER BY created_at DESC LIMIT 5'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
