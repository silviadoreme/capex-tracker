-- Create database schema for CAPEX Tracker
-- This would integrate with existing Jira MySQL replica

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    status ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
    lead VARCHAR(100),
    capex_category ENUM('CAPEX', 'CAPEX R&D', 'OPEX') NULL,
    jira_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contributors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(100),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monthly_efforts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50),
    contributor_name VARCHAR(100),
    month_year VARCHAR(20), -- Format: "2024-01"
    hours_spent DECIMAL(5,2) DEFAULT 0,
    documentation_links TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_by VARCHAR(100),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_effort (project_id, contributor_name, month_year)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('pm_new_project', 'pm_monthly_reminder', 'finance_new_capex', 'finance_submission') NOT NULL,
    recipient VARCHAR(100) NOT NULL,
    project_id VARCHAR(50),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slack_channel VARCHAR(100),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO projects (id, name, summary, status, lead, capex_category, jira_url) VALUES
('PROJ-123', 'Customer Portal Redesign', 'Complete overhaul of customer-facing portal with new UI/UX', 'In Progress', 'Sarah Johnson', 'CAPEX', 'https://company.atlassian.net/browse/PROJ-123'),
('PROJ-124', 'Mobile App Performance Optimization', 'Improve app loading times and reduce memory usage', 'Open', 'Alex Rodriguez', NULL, 'https://company.atlassian.net/browse/PROJ-124'),
('PROJ-125', 'Analytics Dashboard Enhancement', 'Add new metrics and visualization capabilities', 'In Progress', 'Tom Wilson', 'CAPEX R&D', 'https://company.atlassian.net/browse/PROJ-125');

INSERT INTO contributors (project_id, name, email, role) VALUES
('PROJ-123', 'Sarah Johnson', 'sarah.johnson@company.com', 'Product Manager'),
('PROJ-123', 'Mike Chen', 'mike.chen@company.com', 'Frontend Developer'),
('PROJ-123', 'Lisa Wang', 'lisa.wang@company.com', 'UX Designer'),
('PROJ-123', 'David Kim', 'david.kim@company.com', 'Backend Developer'),
('PROJ-124', 'Alex Rodriguez', 'alex.rodriguez@company.com', 'Product Manager'),
('PROJ-124', 'Emma Thompson', 'emma.thompson@company.com', 'Mobile Developer'),
('PROJ-125', 'Tom Wilson', 'tom.wilson@company.com', 'Product Manager'),
('PROJ-125', 'Rachel Green', 'rachel.green@company.com', 'Data Engineer'),
('PROJ-125', 'John Doe', 'john.doe@company.com', 'Frontend Developer');
