-- Create the projects table in Supabase
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'IN_PROGRESS')),
    lead VARCHAR(100),
    contributors INTEGER DEFAULT 0,
    start_date DATE,
    capex_category VARCHAR(20) CHECK (capex_category IN ('CAPEX', 'CAPEX R&D', 'OPEX')),
    activities TEXT[] DEFAULT '{}',
    activities_saved BOOLEAN DEFAULT FALSE,
    jira_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the contributors table
CREATE TABLE IF NOT EXISTS contributors (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    role VARCHAR(100)
);

-- Create the monthly_efforts table
CREATE TABLE IF NOT EXISTS monthly_efforts (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
    contributor_name VARCHAR(100),
    month_year VARCHAR(20), -- Format: "2024-01"
    hours_spent DECIMAL(5,2) DEFAULT 0,
    documentation_links TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_by VARCHAR(100),
    UNIQUE(project_id, contributor_name, month_year)
);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO projects (id, name, summary, status, lead, contributors, start_date, capex_category, activities, activities_saved, jira_url) VALUES
('SPARK-001', 'SPARK', 'For Content Generators, it''s important to have visibility on content usage & performance, to effectively allocate their resources towards what works for content consumers.', 'OPEN', 'Dragos Ionita', 7, '2025-01-06', NULL, '{}', FALSE, 'https://company.atlassian.net/browse/SPARK-001'),
('BQ-002', 'BigQuery Column Lineage Phase 2', 'Complete and ready dashboards, so the lineage will be completed and ready to build applications on top of it.', 'CLOSED', 'Alex Giurgiu', 3, '2025-01-06', 'CAPEX', '{"technical-design", "coding", "testing"}', TRUE, 'https://company.atlassian.net/browse/BQ-002'),
('AM-003', 'New Order Model for AM', 'Create new Order model for AM. This a foundational piece for future enhancements.', 'OPEN', 'Alex Giurgiu', 4, '2025-01-06', 'CAPEX R&D', '{"functional-design", "technical-design"}', TRUE, 'https://company.atlassian.net/browse/AM-003');

-- Insert sample contributors
INSERT INTO contributors (project_id, name, email, role) VALUES
('SPARK-001', 'Ionita Dragos', 'dragos.ionita@company.com', 'Product Manager'),
('SPARK-001', 'Guta Laurentiu', 'laurentiu.guta@company.com', 'Frontend Developer'),
('SPARK-001', 'Proca Cosmin', 'cosmin.proca@company.com', 'Backend Developer'),
('SPARK-001', 'Carsote Cosmin', 'cosmin.carsote@company.com', 'DevOps Engineer'),
('SPARK-001', 'Dragomir Diana', 'diana.dragomir@company.com', 'UX Designer'),
('SPARK-001', 'Tij Andrei', 'andrei.tij@company.com', 'QA Engineer'),
('SPARK-001', 'Tarziu Silvia', 'silvia.tarziu@company.com', 'Data Analyst'),
('BQ-002', 'Mantu Razvan-Viorel', 'razvan.mantu@company.com', 'Data Engineer'),
('BQ-002', 'Vintila Cosmina', 'cosmina.vintila@company.com', 'Backend Developer'),
('BQ-002', 'Cristea Ionut', 'ionut.cristea@company.com', 'Frontend Developer'),
('AM-003', 'Streche Diana', 'diana.streche@company.com', 'Product Manager'),
('AM-003', 'Albata Anda', 'anda.albata@company.com', 'Backend Developer'),
('AM-003', 'Giurgiu Alexandru', 'alexandru.giurgiu@company.com', 'Technical Lead'),
('AM-003', 'Platon Elena', 'elena.platon@company.com', 'QA Engineer');
