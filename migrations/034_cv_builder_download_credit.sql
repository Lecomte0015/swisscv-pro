-- ============================================================
-- Migration 034: CV Builder — crédit débité au 1er téléchargement
-- ============================================================
-- download_charged_at : marque le moment où le crédit a été débité pour ce
-- document. NULL tant que le CV n'a jamais été téléchargé. Une fois posé,
-- les téléchargements suivants du même document ne redébitent plus rien —
-- seule la création (= premier export PDF) est facturée.

ALTER TABLE cv_builder_documents ADD COLUMN download_charged_at INTEGER;
