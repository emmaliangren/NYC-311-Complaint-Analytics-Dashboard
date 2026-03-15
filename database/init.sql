CREATE DATABASE IF NOT EXISTS devdb;

USE devdb;

CREATE TABLE IF NOT EXISTS complaints (
    unique_key VARCHAR(50) PRIMARY KEY,
    created_date DATETIME NOT NULL,
    closed_date DATETIME,
    complaint_type VARCHAR(255) NOT NULL,
    borough VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    INDEX idx_geo (latitude, longitude),
    INDEX idx_complaint_type (complaint_type),
    INDEX idx_status (status),
    INDEX idx_borough (borough),
    INDEX idx_created_date (created_date)
    -- agency VARCHAR(100),
    -- agency_name VARCHAR(100),
    -- descriptor VARCHAR(255),
    -- descriptor_2 VARCHAR(255),
    -- location_type VARCHAR(50),
    -- incident_zip VARCHAR(10),
    -- incident_address VARCHAR(255),
    -- street_name VARCHAR(255),
    -- cross_street_1 VARCHAR(255),
    -- cross_street_2 VARCHAR(255),
    -- intersection_street_1 VARCHAR(255),
    -- intersection_street_2 VARCHAR(255),
    -- address_type VARCHAR(50),
    -- city VARCHAR(100),
    -- landmark VARCHAR(255),
    -- facility_type VARCHAR(255),
    -- due_date DATETIME,
    -- resolution_description TEXT,
    -- resolution_action_updated_date DATETIME,
    -- community_board VARCHAR(20),
    -- council_district VARCHAR(20),
    -- police_precinct VARCHAR(50),
    -- open_data_channel_type VARCHAR(50),
    -- park_facility_name VARCHAR(255),
    -- park_borough VARCHAR(50),
    -- vehicle_type VARCHAR(50),
    -- taxi_company_borough VARCHAR(50),
    -- taxi_pick_up_location VARCHAR(255),
    -- bridge_highway_name VARCHAR(255),
    -- bridge_highway_direction VARCHAR(50),
    -- road_ramp VARCHAR(50),
    -- bridge_highway_segment VARCHAR(50),
    -- x_coordinate_state_plane DOUBLE,
    -- y_coordinate_state_plane DOUBLE,
    -- bbl VARCHAR(20),
    -- location POINT
);

-- Table for ETL refresh tracking
CREATE TABLE IF NOT EXISTS data_refresh_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refresh_started_at TIMESTAMP NOT NULL,
    refresh_completed_at TIMESTAMP,
    records_processed INT,
    status ENUM('IN_PROGRESS', 'SUCCESS', 'FAILED') NOT NULL,
    INDEX idx_status_completed_at (status, refresh_completed_at DESC)
);
