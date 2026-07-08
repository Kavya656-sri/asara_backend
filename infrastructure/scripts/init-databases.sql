-- FSM Microservices — Database Initialization
-- Creates separate databases and users per service

CREATE DATABASE IF NOT EXISTS fsm_auth;
CREATE DATABASE IF NOT EXISTS fsm_master_data;
CREATE DATABASE IF NOT EXISTS fsm_projects;
CREATE DATABASE IF NOT EXISTS fsm_tasks;
CREATE DATABASE IF NOT EXISTS fsm_tickets;
CREATE DATABASE IF NOT EXISTS fsm_attendance;
CREATE DATABASE IF NOT EXISTS fsm_finance;
CREATE DATABASE IF NOT EXISTS fsm_notifications;
CREATE DATABASE IF NOT EXISTS fsm_reporting;

-- Service-specific users (principle of least privilege)
CREATE USER IF NOT EXISTS 'fsm_auth'@'%' IDENTIFIED BY 'auth_password';
GRANT ALL PRIVILEGES ON fsm_auth.* TO 'fsm_auth'@'%';

CREATE USER IF NOT EXISTS 'fsm_master'@'%' IDENTIFIED BY 'master_password';
GRANT ALL PRIVILEGES ON fsm_master_data.* TO 'fsm_master'@'%';

CREATE USER IF NOT EXISTS 'fsm_project'@'%' IDENTIFIED BY 'project_password';
GRANT ALL PRIVILEGES ON fsm_projects.* TO 'fsm_project'@'%';

CREATE USER IF NOT EXISTS 'fsm_task'@'%' IDENTIFIED BY 'task_password';
GRANT ALL PRIVILEGES ON fsm_tasks.* TO 'fsm_task'@'%';

CREATE USER IF NOT EXISTS 'fsm_ticket'@'%' IDENTIFIED BY 'ticket_password';
GRANT ALL PRIVILEGES ON fsm_tickets.* TO 'fsm_ticket'@'%';

CREATE USER IF NOT EXISTS 'fsm_attendance'@'%' IDENTIFIED BY 'attendance_password';
GRANT ALL PRIVILEGES ON fsm_attendance.* TO 'fsm_attendance'@'%';

CREATE USER IF NOT EXISTS 'fsm_finance'@'%' IDENTIFIED BY 'finance_password';
GRANT ALL PRIVILEGES ON fsm_finance.* TO 'fsm_finance'@'%';

CREATE USER IF NOT EXISTS 'fsm_notify'@'%' IDENTIFIED BY 'notify_password';
GRANT ALL PRIVILEGES ON fsm_notifications.* TO 'fsm_notify'@'%';

CREATE USER IF NOT EXISTS 'fsm_report'@'%' IDENTIFIED BY 'report_password';
GRANT ALL PRIVILEGES ON fsm_reporting.* TO 'fsm_report'@'%';

-- Reporting service needs read access to all databases (for read replicas approach)
GRANT SELECT ON fsm_auth.* TO 'fsm_report'@'%';
GRANT SELECT ON fsm_master_data.* TO 'fsm_report'@'%';
GRANT SELECT ON fsm_projects.* TO 'fsm_report'@'%';
GRANT SELECT ON fsm_tasks.* TO 'fsm_report'@'%';
GRANT SELECT ON fsm_tickets.* TO 'fsm_report'@'%';
GRANT SELECT ON fsm_attendance.* TO 'fsm_report'@'%';
GRANT SELECT ON fsm_finance.* TO 'fsm_report'@'%';

FLUSH PRIVILEGES;
