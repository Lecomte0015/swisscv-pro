-- Migration: Create testimonials table
-- Date: 2024-12-26
-- Description: Table pour stocker les témoignages utilisateurs avec système de modération

CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    jobTitle TEXT NOT NULL,
    city TEXT NOT NULL,
    text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    rating INTEGER DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
    createdAt TEXT NOT NULL,
    approvedAt TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_createdAt ON testimonials(createdAt DESC);

-- Insérer 3 témoignages de démo (pré-approuvés)
INSERT INTO testimonials (firstName, lastName, jobTitle, city, text, status, rating, createdAt, approvedAt) VALUES
('Marie', 'Laurent', 'Chef de projet', 'Lausanne', 'SwissCV Pro m''a permis de créer un CV professionnel en quelques minutes. J''ai reçu 3 entretiens la semaine suivante ! Les templates sont vraiment adaptés au marché suisse.', 'approved', 5, datetime('now', '-30 days'), datetime('now', '-29 days')),
('Thomas', 'Bernard', 'Développeur Full-Stack', 'Zurich', 'Les lettres de motivation générées par l''IA sont impressionnantes. Elles sont personnalisées et vraiment efficaces. J''ai économisé des heures de travail !', 'approved', 5, datetime('now', '-20 days'), datetime('now', '-19 days')),
('Sophie', 'Martin', 'Marketing Manager', 'Genève', 'L''assistance pour les entretiens m''a donné confiance. Les questions types et les conseils m''ont vraiment aidée à me préparer. Je recommande vivement !', 'approved', 5, datetime('now', '-10 days'), datetime('now', '-9 days'));
