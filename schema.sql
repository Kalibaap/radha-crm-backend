-- ==========================================
-- RADHA CRM - PostgreSQL Database Schema
-- ==========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'Viewer',
  status VARCHAR(20) DEFAULT 'Active',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trucks / Fleet table
CREATE TABLE IF NOT EXISTS trucks (
  id VARCHAR(20) PRIMARY KEY,
  registration_number VARCHAR(50) NOT NULL,
  model VARCHAR(100),
  capacity VARCHAR(20),
  year INTEGER,
  chassis_number VARCHAR(100),
  engine_number VARCHAR(100),
  fuel_type VARCHAR(20) DEFAULT 'Diesel',
  mileage INTEGER DEFAULT 0,
  owner_name VARCHAR(100),
  owner_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'Active',
  insurance_expiry DATE,
  permit_expiry DATE,
  pollution_expiry DATE,
  fitness_expiry DATE,
  road_tax_expiry DATE,
  last_service_date DATE,
  next_service_due DATE,
  documents TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  license_number VARCHAR(50),
  license_expiry DATE,
  address TEXT,
  emergency_contact VARCHAR(20),
  blood_group VARCHAR(10),
  joining_date DATE,
  status VARCHAR(20) DEFAULT 'Available',
  photo TEXT,
  experience_years INTEGER DEFAULT 0,
  salary DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(20) PRIMARY KEY,
  truck_id VARCHAR(20) REFERENCES trucks(id) ON DELETE SET NULL,
  truck_number VARCHAR(50),
  driver_id VARCHAR(20) REFERENCES drivers(id) ON DELETE SET NULL,
  driver_name VARCHAR(100),
  customer_name VARCHAR(100),
  material_name VARCHAR(100),
  loading_location VARCHAR(200),
  destination VARCHAR(200),
  loading_date DATE,
  unloading_date DATE,
  closing_date DATE,
  document_number VARCHAR(100),
  invoice_number VARCHAR(100),
  quantity_loaded DECIMAL(10,2),
  quantity_unloaded DECIMAL(10,2),
  shortage_quantity DECIMAL(10,4),
  trip_start_km INTEGER,
  trip_end_km INTEGER,
  total_km INTEGER,
  advance_payment DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Pending',
  rate_type VARCHAR(20) DEFAULT 'per_km_kl',
  rate DECIMAL(10,2) DEFAULT 0,
  rate_kl DECIMAL(10,2) DEFAULT 0,
  rate_km DECIMAL(10,2) DEFAULT 0,
  total_trip_rate DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trip expenses table
CREATE TABLE IF NOT EXISTS trip_expenses (
  id SERIAL PRIMARY KEY,
  trip_id VARCHAR(20) NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  amount DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  date DATE,
  truck_id VARCHAR(20) REFERENCES trucks(id) ON DELETE SET NULL,
  driver_id VARCHAR(20) REFERENCES drivers(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  trip_id VARCHAR(20) REFERENCES trips(id) ON DELETE SET NULL,
  customer_name VARCHAR(100),
  total_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  grand_total DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Draft',
  invoice_date DATE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance (
  id SERIAL PRIMARY KEY,
  truck_id VARCHAR(20) NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  truck_number VARCHAR(50),
  service_type VARCHAR(100),
  description TEXT,
  service_date DATE,
  next_service_date DATE,
  cost DECIMAL(12,2) DEFAULT 0,
  service_center VARCHAR(200),
  status VARCHAR(20) DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  company_name VARCHAR(100) DEFAULT 'Radha Logistics',
  company_address TEXT,
  company_phone VARCHAR(20),
  company_email VARCHAR(100),
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  theme VARCHAR(20) DEFAULT 'system',
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'INR',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, name, email, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjXAgWqFJqK3QGJqK3QGJqK3QGJqK3', 'System Admin', 'admin@radhalogistics.com', 'Admin', 'Active')
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (id, company_name, company_address, company_phone, gst_number, pan_number) VALUES
(1, 'Radha Logistics', 'A-1, Industrial Area, Lucknow, UP - 226001', '1800-123-4567', '09AABCR1234C1ZX', 'AABCR1234C')
ON CONFLICT DO NOTHING;
