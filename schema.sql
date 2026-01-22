-- ============================================================
-- SwissCV Pro - Database Schema (Cloudflare D1)
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  supabase_id TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT,
  profile_completed INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  canton TEXT,
  linkedin_url TEXT,
  bio TEXT,
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Work experiences
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current INTEGER DEFAULT 0,
  description TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User skills
CREATE TABLE IF NOT EXISTS user_skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User languages
CREATE TABLE IF NOT EXISTS user_languages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_name TEXT NOT NULL,
  proficiency_level TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT,
  date_obtained TEXT,
  credential_url TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Career goals
CREATE TABLE IF NOT EXISTS career_goals (
  user_id TEXT PRIMARY KEY,
  desired_position TEXT,
  contract_types TEXT,
  min_salary INTEGER,
  max_salary INTEGER,
  preferred_locations TEXT,
  remote_preference TEXT,
  availability_date TEXT,
  willing_to_relocate INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- CV analyses
CREATE TABLE IF NOT EXISTS cv_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER,
  ats_score INTEGER,
  strong_points TEXT,
  improvements TEXT,
  swiss_advice TEXT,
  keywords TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Job applications tracker
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_url TEXT,
  status TEXT DEFAULT 'to_review',
  notes TEXT,
  applied_date INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Free tier usage tracking
CREATE TABLE IF NOT EXISTS free_usage (
  user_id TEXT PRIMARY KEY,
  analysis_count INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- NEW: Job Offers Table
-- ============================================================
CREATE TABLE IF NOT EXISTS job_offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  job_type TEXT,
  experience_level TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  source TEXT,
  url TEXT,
  posted_date INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_job_location ON job_offers(location);
CREATE INDEX IF NOT EXISTS idx_job_posted_date ON job_offers(posted_date);
CREATE INDEX IF NOT EXISTS idx_job_title ON job_offers(title);

-- ============================================================
-- NEW: Job Matches Cache (optional)
-- ============================================================
CREATE TABLE IF NOT EXISTS job_matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_offer_id TEXT NOT NULL,
  match_score INTEGER,
  strengths TEXT,
  gaps TEXT,
  recommendation TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_offer_id) REFERENCES job_offers(id)
);

-- ============================================================
-- Sample Job Offers Data (Swiss Market)
-- ============================================================

INSERT INTO job_offers (id, title, company, location, description, requirements, job_type, experience_level, salary_min, salary_max, source, url, posted_date) VALUES
('job-001', 'Développeur Full Stack Senior', 'SwissTech SA', 'Genève', 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe dynamique. Vous travaillerez sur des projets innovants utilisant React, Node.js et PostgreSQL.', 'React, Node.js, PostgreSQL, 5+ ans d''expérience, Français courant', 'CDI', 'Senior', 95000, 130000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-full-stack-geneve/', unixepoch() - 86400),

('job-002', 'Data Scientist', 'FinanceHub Suisse', 'Zurich', 'Rejoignez notre équipe Data Science pour développer des modèles prédictifs et des solutions d''analyse avancées dans le secteur financier.', 'Python, Machine Learning, SQL, Master en Data Science, Anglais et Allemand', 'CDI', 'Confirmé', 100000, 140000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/data-scientist-zurich/', unixepoch() - 172800),

('job-003', 'Chef de Projet IT', 'Digital Solutions AG', 'Lausanne', 'Pilotez des projets de transformation digitale pour nos clients grands comptes. Expérience en méthodologie Agile requise.', 'Gestion de projet, Agile/Scrum, 3+ ans d''expérience, Français et Anglais', 'CDI', 'Confirmé', 85000, 115000, 'indeed', 'https://ch.indeed.com/emploi/chef-projet-it-lausanne/', unixepoch() - 259200),

('job-004', 'Développeur Backend Python', 'StartupLab', 'Genève', 'Startup en forte croissance recherche un développeur Python passionné pour construire notre plateforme SaaS.', 'Python, Django/FastAPI, Docker, PostgreSQL, 2+ ans d''expérience', 'CDI', 'Junior', 70000, 90000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-python-geneve/', unixepoch() - 345600),

('job-005', 'UX/UI Designer', 'CreativeStudio Suisse', 'Lausanne', 'Concevez des expériences utilisateur exceptionnelles pour nos clients. Portfolio requis.', 'Figma, Adobe XD, Design Thinking, 3+ ans d''expérience, Portfolio', 'CDI', 'Confirmé', 75000, 95000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/ux-ui-designer-lausanne/', unixepoch() - 432000),

('job-006', 'DevOps Engineer', 'CloudTech SA', 'Zurich', 'Automatisez et optimisez nos infrastructures cloud. Expertise Kubernetes et AWS requise.', 'Kubernetes, AWS, Terraform, CI/CD, 4+ ans d''expérience', 'CDI', 'Senior', 105000, 145000, 'indeed', 'https://ch.indeed.com/emploi/devops-engineer-zurich/', unixepoch() - 518400),

('job-007', 'Développeur Mobile Flutter', 'AppFactory', 'Genève', 'Développez des applications mobiles cross-platform pour nos clients internationaux.', 'Flutter, Dart, Firebase, 2+ ans d''expérience, Anglais', 'CDI', 'Junior', 75000, 95000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-flutter-geneve/', unixepoch() - 604800),

('job-008', 'Architecte Solutions Cloud', 'SwissCloud AG', 'Zurich', 'Concevez et implémentez des architectures cloud scalables pour nos clients entreprise.', 'AWS/Azure, Microservices, 7+ ans d''expérience, Certifications cloud', 'CDI', 'Expert', 120000, 160000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/architecte-cloud-zurich/', unixepoch() - 691200),

('job-009', 'Business Analyst IT', 'ConsultingPro', 'Lausanne', 'Analysez les besoins métier et traduisez-les en spécifications techniques.', 'Analyse fonctionnelle, SQL, UML, 3+ ans d''expérience, Français et Anglais', 'CDI', 'Confirmé', 80000, 105000, 'indeed', 'https://ch.indeed.com/emploi/business-analyst-lausanne/', unixepoch() - 777600),

('job-010', 'Développeur Frontend React', 'WebAgency Suisse', 'Genève', 'Créez des interfaces web modernes et performantes avec React et TypeScript.', 'React, TypeScript, CSS/SASS, 3+ ans d''expérience', 'CDI', 'Confirmé', 80000, 110000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-react-geneve/', unixepoch() - 864000),

('job-011', 'Ingénieur Sécurité', 'SecureIT SA', 'Zurich', 'Protégez nos systèmes et ceux de nos clients contre les cybermenaces.', 'Cybersécurité, Pentesting, ISO 27001, 5+ ans d''expérience', 'CDI', 'Senior', 110000, 150000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/ingenieur-securite-zurich/', unixepoch() - 950400),

('job-012', 'Product Owner', 'AgileTech', 'Lausanne', 'Définissez la vision produit et priorisez le backlog en collaboration avec les équipes.', 'Product Management, Agile, 3+ ans d''expérience, Certification PO', 'CDI', 'Confirmé', 90000, 120000, 'indeed', 'https://ch.indeed.com/emploi/product-owner-lausanne/', unixepoch() - 1036800),

('job-013', 'Développeur Java/Spring', 'Enterprise Solutions', 'Genève', 'Développez des applications d''entreprise robustes avec Java et Spring Boot.', 'Java, Spring Boot, Microservices, 4+ ans d''expérience', 'CDI', 'Senior', 95000, 125000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-java-geneve/', unixepoch() - 1123200),

('job-014', 'Scrum Master', 'AgileConsulting', 'Zurich', 'Accompagnez les équipes dans leur transformation Agile et facilitez les cérémonies Scrum.', 'Scrum, Facilitation, 3+ ans d''expérience, Certification CSM', 'CDI', 'Confirmé', 85000, 115000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/scrum-master-zurich/', unixepoch() - 1209600),

('job-015', 'Développeur .NET', 'Microsoft Partner SA', 'Lausanne', 'Développez des solutions .NET pour nos clients grands comptes.', '.NET Core, C#, Azure, 3+ ans d''expérience', 'CDI', 'Confirmé', 85000, 115000, 'indeed', 'https://ch.indeed.com/emploi/developpeur-net-lausanne/', unixepoch() - 1296000),

('job-016', 'Analyste Cybersécurité', 'CyberDefense Suisse', 'Genève', 'Surveillez et analysez les menaces de sécurité pour protéger nos infrastructures.', 'SOC, SIEM, Threat Intelligence, 2+ ans d''expérience', 'CDI', 'Junior', 75000, 100000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/analyste-cybersecurite-geneve/', unixepoch() - 1382400),

('job-017', 'Développeur Blockchain', 'CryptoTech SA', 'Zurich', 'Développez des smart contracts et des applications décentralisées.', 'Solidity, Ethereum, Web3.js, 2+ ans d''expérience', 'CDI', 'Confirmé', 100000, 140000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-blockchain-zurich/', unixepoch() - 1468800),

('job-018', 'Ingénieur Machine Learning', 'AI Research Lab', 'Lausanne', 'Recherche et développement de modèles ML pour des applications industrielles.', 'Python, TensorFlow/PyTorch, PhD ou Master, Publications scientifiques', 'CDI', 'Expert', 110000, 150000, 'indeed', 'https://ch.indeed.com/emploi/ingenieur-ml-lausanne/', unixepoch() - 1555200),

('job-019', 'Développeur iOS Swift', 'MobileFirst', 'Genève', 'Créez des applications iOS natives pour nos clients premium.', 'Swift, SwiftUI, 3+ ans d''expérience, Portfolio requis', 'CDI', 'Confirmé', 85000, 115000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/developpeur-ios-geneve/', unixepoch() - 1641600),

('job-020', 'Consultant SAP', 'ERP Solutions AG', 'Zurich', 'Implémentez et paramétrez des solutions SAP pour nos clients.', 'SAP S/4HANA, ABAP, 5+ ans d''expérience, Certification SAP', 'CDI', 'Senior', 100000, 140000, 'jobs.ch', 'https://www.jobs.ch/fr/emploi/consultant-sap-zurich/', unixepoch() - 1728000);
