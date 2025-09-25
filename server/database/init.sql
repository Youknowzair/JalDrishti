-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Hamlets table
-- CREATE TABLE hamlets (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     hamlet_code VARCHAR(50) UNIQUE NOT NULL,
--     population INT,
--     avg_demand_lpcd FLOAT,
--     notes TEXT,
--     geom geometry(MultiPolygon,4326) NOT NULL
-- );

-- Water assets table
-- CREATE TABLE water_assets (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     geom geometry(Point,4326) NOT NULL,
--     hamlet_id INT REFERENCES hamlets(id) ON DELETE SET NULL
-- );

-- Reports table
-- CREATE TABLE reports (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(100) NOT NULL,
--     geom geometry(Point,4326) NOT NULL,
--     hamlet_id INT REFERENCES hamlets(id) ON DELETE SET NULL
-- );