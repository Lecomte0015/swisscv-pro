-- Migration: Ajouter colonne filename à cv_analyses
-- Date: 2025-12-12

ALTER TABLE cv_analyses ADD COLUMN filename TEXT DEFAULT 'CV sans nom';
