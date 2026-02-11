-- Migration 020: CMS Page Sections
-- Date: 2026-02-05
-- Description: Table for editable landing page sections via CMS back-office

CREATE TABLE IF NOT EXISTS page_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT UNIQUE NOT NULL,
    section_label TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL DEFAULT '{}',
    styles TEXT NOT NULL DEFAULT '{}',
    media TEXT NOT NULL DEFAULT '{}',
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_page_sections_key ON page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(display_order);

-- Seed default data from current index.html

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('hero', 'Hero', 1, '{"title":"Optimisez votre CV pour le","title_highlight":"marché suisse","description":"Analyse détaillée, scoring ATS, lettres de motivation générées par IA. Tout ce qu''il faut pour décrocher un entretien en Suisse romande.","primary_cta_text":"Commencer gratuitement","primary_cta_link":"app.html","secondary_cta_text":"Se connecter","secondary_cta_link":"login.html","hero_note":"5 crédits offerts à l''inscription, sans engagement"}', '{}', '{}', 1, datetime('now'));

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('trust_bar', 'Barre de confiance', 2, '{"items":[{"text":"Hébergé en Suisse"},{"text":"12''000+ CV analysés"},{"text":"Compatible ATS"},{"text":"Données sécurisées"}]}', '{}', '{}', 1, datetime('now'));

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('steps', 'Comment ça marche', 3, '{"section_title":"Comment ça marche","section_subtitle":"Trois étapes pour un CV qui fait la différence","steps":[{"title":"1. Uploadez votre CV","description":"Importez votre CV au format PDF. L''analyse démarre instantanément."},{"title":"2. Recevez votre analyse","description":"Score détaillé, compatibilité ATS, points forts et axes d''amélioration."},{"title":"3. Optimisez et postulez","description":"Appliquez les recommandations et générez vos lettres de motivation."}]}', '{}', '{}', 1, datetime('now'));

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('features', 'Fonctionnalités', 4, '{"section_title":"Des outils pensés pour le marché suisse","section_subtitle":"Tout ce dont vous avez besoin pour décrocher votre prochain poste","features":[{"title":"Analyse CV complète","description":"Score détaillé sur 100, évaluation de chaque section (expérience, formation, compétences), conseils personnalisés adaptés aux standards suisses. Photo, langues, références : tout est vérifié.","badge":""},{"title":"Recherche d''emploi","description":"Trouvez les offres qui correspondent à votre profil directement depuis la plateforme. Recherche par secteur, localisation et type de poste sur le marché suisse.","badge":""},{"title":"Lettres de motivation IA","description":"Génération automatique de lettres professionnelles adaptées au marché suisse romand. Basées sur votre CV et l''offre d''emploi visée, prêtes à envoyer.","badge":"Premium"},{"title":"Suivi de candidatures","description":"Organisez toutes vos candidatures de manière claire. Suivez l''état de chaque postulation, les relances à faire et ne perdez plus aucune opportunité.","badge":""}]}', '{}', '{}', 1, datetime('now'));

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('testimonials', 'Témoignages', 5, '{"section_title":"Ce que disent nos utilisateurs","section_subtitle":"Des professionnels satisfaits en Suisse romande"}', '{}', '{}', 1, datetime('now'));

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('cta_final', 'CTA Final', 6, '{"title":"Prêt à optimiser votre CV ?","description":"5 crédits offerts à l''inscription, sans engagement","cta_text":"Commencer l''analyse gratuite","cta_link":"app.html"}', '{}', '{}', 1, datetime('now'));

INSERT INTO page_sections (section_key, section_label, display_order, content, styles, media, is_active, updated_at)
VALUES ('footer', 'Footer', 7, '{"about_title":"SwissCV Pro","about_text":"Outil d''optimisation de CV spécialement conçu pour le marché suisse romand. Analyse gratuite, confidentielle et instantanée avec IA.","email":"contact@swisscv-pro.ch","hosting_note":"Hébergé en Suisse - Données traitées selon standards suisses","copyright":"© 2024 SwissCV Pro. Tous droits réservés. - Hébergé en Suisse","columns":[{"title":"Produit","links":[{"label":"Analyser mon CV","url":"app.html"},{"label":"Tarifs","url":"pricing.html"},{"label":"Dashboard","url":"dashboard.html"}]},{"title":"Entreprises","links":[{"label":"SwissCV Pro","url":"pricing.html#pro"},{"label":"API Documentation","url":"#"},{"label":"Team Management","url":"#"}]},{"title":"Légal","links":[{"label":"Conditions d''utilisation","url":"terms.html"},{"label":"Confidentialité","url":"privacy.html"},{"label":"Cookies","url":"cookies.html"},{"label":"RGPD","url":"rgpd.html"},{"label":"Contact","url":"contact.html"}]}]}', '{}', '{}', 1, datetime('now'));
