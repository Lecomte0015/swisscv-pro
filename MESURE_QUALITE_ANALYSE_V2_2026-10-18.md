# Moteur d'analyse v2 — comparaison avec la référence (18.10.2026)

Même jeu de 20 CV **synthétiques**, même grille (`tests/quality/rubric.md`), même script. Référence : MESURE_QUALITE_ANALYSE_2026-10-18.md.
⚠️ **Biais à connaître** : le moteur v2 et la notation sont tous deux de Claude. Les analyses brutes sont dans `tests/quality/results/2026-10-18-12-46-v2-1/report.md` : une relecture de quelques CV par le fondateur est recommandée avant de considérer ces notes comme acquises.

## Ce qui a changé dans le moteur (`index.js`, non déployé)
- **Grille de 7 critères** notés 0 à 4 par l'IA (réalisations, structure, dates, mots-clés, langues, coordonnées, rédaction). Le **score global et le score ATS sont calculés par le code** (pondération fixe `CV_CRITERIA`), plus par l'IA. Le détail s'affiche sous le score dans `app.html`.
- **Points forts vérifiés** : chaque point fort doit citer le CV mot pour mot ; citation introuvable, chiffre absent du CV ou qualificatif non appuyé (« certifié », « international ») = point fort supprimé. La citation est affichée à l'utilisateur.
- **Photo, date de naissance, nationalité** : jamais en amélioration, une seule phrase neutre (« facultatives… votre choix ») ajoutée par le code.
- **Certificats de travail / références** : jamais en amélioration, une seule mention dans les conseils.
- **Priorités** explicites (coordonnées, fautes, texte illisible, langue indispensable, chevauchements, interruptions > 6 mois, diplôme étranger non reconnu, puis contenu ; les mois des dates en dernier).
- **Mots-clés** : seuls ceux présents dans le CV sont gardés (ils alimentent les alertes emploi).
- CV délimité dans le prompt (protection contre les instructions cachées dans un CV), température 0, texte refusé avant débit s'il fait moins de 100 ou plus de 30 000 caractères.
- Format de réponse inchangé pour l'application (mêmes champs) + `criteria` et `engineVersion`.

## Résultats

| Critère | Avant (production) | v2.1 |
|---|---|---|
| Diagnostic | 2.60 | 2.65 |
| Pertinence | 2.60 | 2.80 |
| Spécificité | 2.55 | 3.00 |
| Applicabilité | 2.95 | 3.00 |
| Faits | 2.25 | 2.85 |
| Rédaction | 2.00 | 2.00 |
| Cohérence | 2.30 | 3.00 |
| Score | 2.05 | 2.15 |
| Utilité | 1.55 | 2.55 |
| Extraction | 2.10 | 2.95 |
| **Total /30** | **22.9** | **26.9** |

| Indicateur | Avant | v2.1 |
|---|---|---|
| Erreurs critiques | 1 / 20 (fait inventé) | **0 / 20** |
| Photo conseillée sans photo | 18 / 18 CV (1re priorité 10 fois) | **0** (une phrase neutre) |
| Défauts placés traités en amélioration | 24 / 26 | 24 / 26 (cv18 « poste terminé en 2025 » toujours manqué ; mois des dates volontairement secondaires) |
| Écart des scores (min-max) | 32-88, 13 CV entre 62 et 74 | 36-96, scores mieux répartis (CV désorganisé 62 → 38) |
| Reproductibilité du score (≤ 5 points) | 5 / 5 | **3 / 5** (cv14 et cv17 : 6 points) |
| Reproductibilité ATS (≤ 5 points) | 4 / 5 | 4 / 5 (cv17 : 8 points) |
| Coût par analyse | ≈ 0,028 $ | ≈ 0,025 $ (0,735 $ / 30) |

Étapes : une première version (v2) a été mesurée et **rejetée** (points forts devenus vagues, « ajoutez les mois » en tête presque partout, interruption de cv06 et reconnaissance de diplôme de cv13 sortis des priorités, certificats de travail répétés). Résultats bruts conservés : `tests/quality/results/2026-10-18-12-40-v2/`.

## Ce qui reste imparfait
1. **Stabilité du score** légèrement moins bonne : un critère qui passe de 3 à 4 entre deux exécutions déplace le score de 4 à 6 points. L'ancien moteur était stable mais donnait presque toujours 62, 72 ou 74. Options : accepter (le détail par critère l'explique), ou faire deux appels et prendre la moyenne (coût doublé).
2. **Une erreur factuelle générale** (cv13 : « la région d'Annemasse est majoritairement germanophone », faux pour Genève). Pas un fait inventé sur la personne, mais un conseil inexact.
3. **cv18** : un poste terminé en 2025 sans suite n'est toujours pas signalé.
4. **Artefact du jeu de test** : les adresses fictives en `.invalid` sont (à raison) signalées comme inutilisables, ce qui fausse cv08 et cv09. À remplacer dans le jeu avant la prochaine mesure.
5. Le partage gratuit / Premium (1 point fort et 1 amélioration visibles en gratuit) n'a pas été modifié : décision commerciale (lot 5).

## Mise à jour : deux analyses moyennées (v2.2, demandé par le fondateur)
Chaque analyse lance maintenant **deux appels IA en parallèle** ; la note de chaque critère est la moyenne des deux (au demi-point), le score est recalculé, les textes viennent de la première réponse valide. Toujours **1 crédit** pour l'utilisateur ; coût pour SwissCV Pro ≈ **0,049 $** par analyse (1,473 $ / 60 appels × 2). Si aucun des deux appels n'est exploitable : une nouvelle série de deux, puis erreur et crédit rendu.

| CV | Scores (3 exécutions) | Écart | ATS | Écart |
|---|---|---|---|---|
| cv03 | 75 · 76 · 76 | 1 | 74 · 75 · 75 | 1 |
| cv06 | 63 · 65 · 64 | 2 | 64 · 65 · 64 | 1 |
| cv10 | 54 · 52 · 54 | 2 | 63 · 60 · 63 | 3 |
| cv14 | 96 · 92 · 96 | 4 | 95 · 94 · 95 | 1 |
| cv17 | 76 · 79 · 75 | 4 | 70 · 75 · 70 | 5 |

Reproductibilité : **5 / 5 CV ≤ 5 points** (score et ATS). Contenu relu par échantillon (cv01, 04, 05, 06, 07, 08, 09, 13, 14, 18, 19, 20) : niveau équivalent à la v2.1, sans nouvelle notation complète. cv09 place désormais la mise en page en colonnes en 1re priorité ; cv13 corrige sa remarque sur l'allemand. Toujours manqué : cv18 (poste terminé en 2025). Résultats : `tests/quality/results/2026-10-18-13-06-v2-2-moyenne/`.
