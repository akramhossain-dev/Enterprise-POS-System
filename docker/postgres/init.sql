-- Enterprise POS System — PostgreSQL Initialization
-- This script runs once when the PostgreSQL container is first created.
-- Extensions and configuration will be added as schemas grow.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_crypto for hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Confirm initialization
SELECT 'Enterprise POS database initialized successfully' AS status;
