-- Insert sample projects data into the existing table
INSERT INTO projects (id, name, summary, status, lead, contributors, start_date, capex_category, activities, activities_saved, jira_url) VALUES
('SPARK-001', 'SPARK', 'For Content Generators, it''s important to have visibility on content usage & performance, to effectively allocate their resources towards what works for content consumers.', 'OPEN', 'Dragos Ionita', 'Ionita Dragos, Guta Laurentiu, Proca Cosmin, Carsote Cosmin, Dragomir Diana, Tij Andrei, Tarziu Silvia', '2025-01-06', NULL, '{}', FALSE, 'https://company.atlassian.net/browse/SPARK-001'),
('BQ-002', 'BigQuery Column Lineage Phase 2', 'Complete and ready dashboards, so the lineage will be completed and ready to build applications on top of it.', 'CLOSED', 'Alex Giurgiu', 'Mantu Razvan-Viorel, Vintila Cosmina, Cristea Ionut', '2025-01-06', 'CAPEX', '{"technical-design", "coding", "testing"}', TRUE, 'https://company.atlassian.net/browse/BQ-002'),
('AM-003', 'New Order Model for AM', 'Create new Order model for AM. This a foundational piece for future enhancements.', 'OPEN', 'Alex Giurgiu', 'Streche Diana, Albata Anda, Giurgiu Alexandru, Platon Elena', '2025-01-06', 'CAPEX R&D', '{"functional-design", "technical-design"}', TRUE, 'https://company.atlassian.net/browse/AM-003')
ON CONFLICT (id) DO NOTHING;

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
('AM-003', 'Platon Elena', 'elena.platon@company.com', 'QA Engineer')
ON CONFLICT DO NOTHING;
