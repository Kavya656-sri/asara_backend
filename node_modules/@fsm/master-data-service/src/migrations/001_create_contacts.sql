CREATE DATABASE IF NOT EXISTS contact_service;
USE contact_service;

CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    create_date DATE DEFAULT NULL,
    external_id VARCHAR(50) DEFAULT NULL,
    designation VARCHAR(100) DEFAULT NULL,
    company_id INT NOT NULL,
    status TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_id (company_id),
    INDEX idx_email (email),
    INDEX idx_mobile_no (mobile_no),
    INDEX idx_status (status)
);

-- Restrict a dedicated service account to only this table:
-- CREATE USER 'contact_svc'@'%' IDENTIFIED BY 'change_me';
-- GRANT SELECT, INSERT, UPDATE ON contact_service.contacts TO 'contact_svc'@'%';
