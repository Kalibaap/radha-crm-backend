const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const s = req.body;
    await db.query(
      `UPDATE settings SET company_name=$1, company_address=$2, company_phone=$3,
       company_email=$4, gst_number=$5, pan_number=$6, theme=$7, language=$8,
       currency=$9, date_format=$10, updated_at=NOW() WHERE id=1`,
      [s.companyName, s.companyAddress, s.companyPhone, s.companyEmail,
       s.gstNumber, s.panNumber, s.theme, s.language, s.currency, s.dateFormat]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
