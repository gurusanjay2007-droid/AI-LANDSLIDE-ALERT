-- ==============================================================================
-- AI-Based Early Warning & Landslide Risk Monitoring System
-- Database Schema: PostgreSQL 15+ with PostGIS Extension
-- ==============================================================================

-- Enable PostGIS Extension for geospatial indexing and spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN' CHECK (role IN ('ADMIN', 'DISASTER_MANAGER', 'ANALYST', 'CITIZEN')),
    assigned_district VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 2. MONITORING LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    elevation_meters DECIMAL(8, 2) NOT NULL,
    average_slope_degrees DECIMAL(5, 2) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    geology_type VARCHAR(150),
    vegetation_index_ndvi DECIMAL(4, 3),
    population_density_per_sqkm INT,
    critical_rainfall_threshold_mm DECIMAL(6, 2) DEFAULT 100.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_geom ON locations USING GIST(geom);
CREATE INDEX idx_locations_district ON locations(district);

-- 3. RISK ZONES (Polygons / Geospatial Hazard Extents)
CREATE TABLE IF NOT EXISTS risk_zones (
    id VARCHAR(50) PRIMARY KEY,
    zone_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    boundary_geom GEOMETRY(Polygon, 4326) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    risk_probability_pct DECIMAL(5, 2) NOT NULL,
    vulnerability_score DECIMAL(5, 2),
    settlement_count INT DEFAULT 0,
    primary_threat VARCHAR(150),
    last_evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_zones_boundary ON risk_zones USING GIST(boundary_geom);
CREATE INDEX idx_risk_zones_level ON risk_zones(risk_level);

-- 4. ENVIRONMENTAL DATA (Telemetry & GEE Satellite Feeds)
CREATE TABLE IF NOT EXISTS environmental_data (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    temperature_celsius DECIMAL(5, 2),
    relative_humidity_pct DECIMAL(5, 2),
    atmospheric_pressure_hpa DECIMAL(7, 2),
    wind_speed_kmh DECIMAL(5, 2),
    solar_radiation_w_sqm DECIMAL(6, 2),
    ground_vibration_mms DECIMAL(6, 3),
    pore_water_pressure_kpa DECIMAL(7, 2),
    source_type VARCHAR(50) DEFAULT 'AWS_STATION' CHECK (source_type IN ('AWS_STATION', 'GEE_SYNTHETIC', 'IMD_RADAR', 'FIELD_PROBE'))
);

CREATE INDEX idx_env_location_time ON environmental_data(location_id, recorded_at DESC);

-- 5. RAINFALL DATA (Hourly & Cumulative Precipitation)
CREATE TABLE IF NOT EXISTS rainfall_data (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rainfall_1h_mm DECIMAL(6, 2) NOT NULL,
    rainfall_24h_mm DECIMAL(6, 2) NOT NULL,
    rainfall_72h_mm DECIMAL(6, 2) NOT NULL,
    rainfall_7d_cumulative_mm DECIMAL(7, 2) NOT NULL,
    intensity_category VARCHAR(50) CHECK (intensity_category IN ('LIGHT', 'MODERATE', 'HEAVY', 'VERY_HEAVY', 'EXTREMELY_HEAVY')),
    source VARCHAR(50) DEFAULT 'IMD_TELEMETRY'
);

CREATE INDEX idx_rainfall_location_time ON rainfall_data(location_id, timestamp DESC);

-- 6. SOIL MOISTURE DATA (SMAP Satellite & In-Situ Time-Domain Probes)
CREATE TABLE IF NOT EXISTS soil_moisture (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    moisture_top_layer_pct DECIMAL(5, 2) NOT NULL, -- 0-10cm depth
    moisture_root_zone_pct DECIMAL(5, 2) NOT NULL,  -- 10-100cm depth
    degree_of_saturation_pct DECIMAL(5, 2) NOT NULL,
    sensor_status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE INDEX idx_soil_location_time ON soil_moisture(location_id, timestamp DESC);

-- 7. SATELLITE & GOOGLE EARTH ENGINE DATA
CREATE TABLE IF NOT EXISTS satellite_data (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(id) ON DELETE CASCADE,
    satellite_mission VARCHAR(100) NOT NULL, -- Sentinel-1 InSAR, Sentinel-2 Optical, NASA SMAP, GPM IMERG
    acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ndvi_index DECIMAL(4, 3),
    surface_deformation_mm DECIMAL(6, 2), -- InSAR line-of-sight displacement
    cloud_cover_pct DECIMAL(5, 2),
    gee_asset_id VARCHAR(255),
    raw_metadata JSONB
);

CREATE INDEX idx_satellite_mission ON satellite_data(satellite_mission, acquisition_date DESC);

-- 8. AI RISK PREDICTIONS & MODEL RESULTS
CREATE TABLE IF NOT EXISTS risk_predictions (
    id BIGSERIAL PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(id) ON DELETE CASCADE,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    risk_probability_pct DECIMAL(5, 2) NOT NULL,
    risk_category VARCHAR(20) NOT NULL CHECK (risk_category IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    model_version VARCHAR(50) NOT NULL DEFAULT 'LS-Ensemble-v2.4',
    model_confidence_score_pct DECIMAL(5, 2) NOT NULL,
    
    -- Component Factor Weights & Normalized Scores (0-100)
    rainfall_factor_score DECIMAL(5, 2) NOT NULL,
    soil_moisture_factor_score DECIMAL(5, 2) NOT NULL,
    slope_factor_score DECIMAL(5, 2) NOT NULL,
    elevation_factor_score DECIMAL(5, 2) NOT NULL,
    historical_activity_factor_score DECIMAL(5, 2) NOT NULL,
    geology_vegetation_factor_score DECIMAL(5, 2) NOT NULL,
    
    -- AI Generated Explanation & Features
    ai_explanation_summary TEXT NOT NULL,
    contributing_factors_json JSONB,
    forecast_6h_risk_pct DECIMAL(5, 2),
    forecast_24h_risk_pct DECIMAL(5, 2),
    forecast_7d_risk_pct DECIMAL(5, 2)
);

CREATE INDEX idx_predictions_loc_time ON risk_predictions(location_id, predicted_at DESC);
CREATE INDEX idx_predictions_risk ON risk_predictions(risk_category);

-- 9. EARLY WARNINGS & ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    location_id VARCHAR(50) REFERENCES locations(id) ON DELETE CASCADE,
    location_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('INFO', 'WATCH', 'WARNING', 'HIGH RISK', 'CRITICAL')),
    risk_probability_pct DECIMAL(5, 2) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    trigger_reason TEXT NOT NULL,
    recommended_actions TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CRITICAL', 'ACKNOWLEDGED', 'RESOLVED')),
    issued_by VARCHAR(100) DEFAULT 'AI Automated Early Warning Engine',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    target_radius_km DECIMAL(5, 2) DEFAULT 10.0
);

CREATE INDEX idx_alerts_status ON alerts(status, alert_level);
CREATE INDEX idx_alerts_issued_at ON alerts(issued_at DESC);

-- 10. CITIZEN HAZARD REPORTS
CREATE TABLE IF NOT EXISTS citizen_reports (
    id VARCHAR(50) PRIMARY KEY,
    reporter_name VARCHAR(150) NOT NULL,
    contact_info VARCHAR(150),
    location_name VARCHAR(150) NOT NULL,
    district VARCHAR(100),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN (
        'Ground cracks',
        'Rockfall',
        'Water accumulation',
        'Soil movement',
        'Landslide',
        'Unusual ground movement',
        'Spring emergence / Mudflow',
        'Other observations'
    )),
    description TEXT NOT NULL,
    photo_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Verified', 'Rejected')),
    assigned_risk_level VARCHAR(20) DEFAULT 'MODERATE' CHECK (assigned_risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    verified_by VARCHAR(150),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_citizen_reports_geom ON citizen_reports USING GIST(geom);
CREATE INDEX idx_citizen_reports_status ON citizen_reports(status);

-- 11. HISTORICAL LANDSLIDE INVENTORY
CREATE TABLE IF NOT EXISTS landslides (
    id VARCHAR(50) PRIMARY KEY,
    event_date DATE NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    severity VARCHAR(20) CHECK (severity IN ('MINOR', 'MODERATE', 'SEVERE', 'CATASTROPHIC')),
    trigger_type VARCHAR(100) DEFAULT 'Monsoon Cloudburst / Extreme Rainfall',
    rainfall_24h_prior_mm DECIMAL(6, 2),
    volume_debris_cubic_meters INT,
    casualties INT DEFAULT 0,
    infrastructure_damage_description TEXT,
    data_source VARCHAR(150) DEFAULT 'Geological Survey of India (GSI) / State Disaster Management Authority'
);

CREATE INDEX idx_landslides_geom ON landslides USING GIST(geom);
CREATE INDEX idx_landslides_date ON landslides(event_date DESC);
CREATE INDEX idx_landslides_district ON landslides(district);
