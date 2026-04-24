const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const inv = req.body;
    const result = await db.query(
      `INSERT INTO invoices (invoice_number, trip_id, customer_name, total_amount,
       tax_amount, grand_total, paid_amount, balance_amount, status, invoice_date, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [inv.invoiceNumber, inv.tripId, inv.customerName, inv.totalAmount,
       inv.taxAmount, inv.grandTotal, inv.paidAmount, inv.balanceAmount,
       inv.status || 'Draft', inv.invoiceDate, inv.dueDate]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const inv = req.body;
    await db.query(
      `UPDATE invoices SET status=$1, paid_amount=$2, balance_amount=$3 WHERE id=$4`,
      [inv.status, inv.paidAmount, inv.balanceAmount, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
