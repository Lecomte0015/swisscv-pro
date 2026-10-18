-- Lot 1 (audit du 18.10.2026) — corrections de contenu en base, à exécuter UNIQUEMENT après accord explicite :
--   npx wrangler d1 execute swisscv-db --remote --file=scripts/lot1-donnees.sql
-- Aucune suppression : les témoignages sont seulement masqués (réversible en repassant status='approved').

-- 1. Témoignages 1, 2 et 3 : insérés par la migration 001 (exemples de démarrage), ce ne sont pas de vrais clients.
UPDATE testimonials SET status = 'rejected' WHERE id IN (1, 2, 3) AND status = 'approved';

-- 2. CMS page d'accueil : carte « Analyse » (promesse d'évaluation par section qui n'existe pas)
--    et badge « Premium » de la carte « Lettres » (les lettres sont accessibles à tous, 2 crédits).
UPDATE page_sections
SET content = json_set(content,
      '$.features[0].description', 'Un score global sur 100, vos points forts, les améliorations prioritaires et des conseils adaptés aux usages suisses (photo, langues, références). Une estimation pour vous guider, pas un verdict.',
      '$.features[2].badge', '2 crédits'),
    updated_at = datetime('now')
WHERE section_key = 'features';
