const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/fleet', require('./routes/fleet'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Radha CRM API is running!', status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Radha CRM API',
    endpoints: [
      '/api/auth',
      '/api/trips',
      '/api/drivers',
      '/api/fleet',
      '/api/expenses',
      '/api/invoices',
      '/api/maintenance',
      '/api/users',
      '/api/settings',
      '/api/dashboard'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Radha CRM Server running on port ${PORT}`);
  console.log(`📅 ${new Date().toLocaleString()}`);
});
