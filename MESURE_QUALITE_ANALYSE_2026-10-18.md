# Mesure de référence — qualité de l'analyse de CV (18.10.2026)

**Moteur mesuré** : celui de la production (`handleAnalyzeCVText`, modèle `claude-sonnet-4-6`, prompt inchangé, température par défaut), exécuté localement par le vrai Worker avec une base de test. Aucune donnée de production touchée.
**Jeu** : 20 CV **synthétiques** (`tests/quality/cv-set.mjs`) — aucun CV réel. Attentes rédigées par Claude à partir des défauts placés, avant exécution : à relire par le fondateur.
**Exécutions** : 30 analyses (20 CV + 5 CV × 3 pour la reproductibilité), 30 réussies, ~23 s chacune. Coût non enregistré par le banc (défaut du banc corrigé depuis) ; estimation ≈ 30 × 0,028 $ ≈ **0,85 $**.
**Notation** : par Claude, à la main, avec `tests/quality/rubric.md` (0 à 3 par critère). Ce n'est pas une vérité : c'est le point de comparaison pour juger une modification du moteur. Résultats bruts : `tests/quality/results/2026-10-18-12-13-baseline/` (`report.md`, `raw.json`, `notation.json`).

## Résultat en bref

| Indicateur | Mesure | Seuil proposé | Statut |
|---|---|---|---|
| Analyses réussies | 30 / 30 | 100 % | PASS |
| Défauts placés repérés (lecture humaine) | 24 / 26 | — | 2 manqués (colonnes cv09, dates cv18) |
| Erreurs critiques | 1 / 20 (cv13 : fait inventé) | 0 | **FAIL** |
| Moyenne par critère ≥ 2 | 9 critères sur 10 | 10 / 10 | **FAIL** (Utilité 1,55) |
| Reproductibilité du score (écart ≤ 5) | 5 / 5 CV pour le score (max 4) ; ATS : 1 CV à 6 | ≤ 5 | PASS (ATS limite) |
| Reproductibilité des priorités | 3 / 5 CV identiques | — | cv06 et cv14 : la photo prend la 1re place |
| Photo déclarée respectée | 2 / 2 | — | PASS |

**Ce qui fonctionne** : le défaut principal placé est trouvé dans 18 CV sur 20, souvent cité mot pour mot (fautes d'orthographe, chevauchement de dates, allemand absent à Bâle, e-mail non professionnel). Les conseils sont applicables. Le score est très stable (4 CV sur 5 strictement identiques en 3 exécutions). Aucune remarque discriminatoire sur l'âge, l'origine ou une interruption de carrière.

**Les problèmes, par gravité** :
1. **Fait inventé (critique)** — cv13 : point fort « diplôme reconnu en Suisse via la Croix-Rouge suisse », absent du CV et contredit par l'analyse elle-même. Rien ne vérifie qu'un point fort s'appuie sur le CV.
2. **Photo poussée systématiquement** — les 18 CV sans photo reçoivent « ajoutez une photo » (« attendue », « son absence peut être remarquée négativement », « quasi systématiquement attendue ») ; c'est la **1re priorité dans 10 analyses sur 26**, devant de vrais défauts (cv09, cv18, cv20). La consigne du prompt l'autorise explicitement. C'est aussi en contradiction avec le texte affiché désormais sous la case photo (« reste un choix personnel »).
3. **Données personnelles poussées** — 18 CV sur 20 évoquent la date de naissance ou la nationalité ; plusieurs conseillent de les ajouter.
4. **Le score discrimine mal** — 13 CV sur 20 entre 62 et 74 ; le CV désorganisé (cv08) a le même score (62) que des CV propres ; cv04 obtient 88 malgré des blocs de texte « difficiles à parcourir ».
5. **Défauts de mise en forme non vus** — mise en page en deux colonnes (cv09) et dates sans mois / poste terminé en 2025 sans suite (cv18, avec « sans interruption » affirmé).
6. **Remplissage** — conseils déjà appliqués dans le CV (cv02, cv10), « certificats de travail disponibles sur demande » répété presque partout, conseils suisses de **1 740 caractères en moyenne** qui répètent les améliorations.
7. **Mots-clés** — en partie déduits plutôt qu'extraits (« droit bancaire », « Onboarding », « permis B » pour un permis de conduire). Ils alimentent les alertes emploi automatiques.

**Limite du pré-tri automatique** : il a compté 25 / 26 défauts et 1 erreur critique (cv18) ; la lecture montre 24 / 26 et une erreur critique ailleurs (cv13). Les mots-clés trouvent des faux positifs et ne voient pas les faits inventés : la lecture humaine reste indispensable.

## Notation détaillée

| CV | Diagn | Perti | Spéci | Appli | Faits | Rédac | Cohér | Score | Utili | Extra | Total /30 | Critique | Commentaire |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cv01 | 3 | 2 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 22 | non | Langues et tâches bien repérées ; photo présentée comme « attendue », date de naissance poussée. |
| cv02 | 3 | 3 | 3 | 3 | 2 | 2 | 2 | 2 | 1 | 3 | 24 | non | Bon sur la liste de technologies ; « CDI » inventé ; demande d'indiquer le français langue maternelle (déjà fait). |
| cv03 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 2 | 2 | 27 | non | Chevauchement repéré et expliqué, stable sur 3 exécutions. |
| cv04 | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 3 | 2 | 25 | non | Densité bien repérée, mais score 88 / ATS 79 élevés pour des blocs « difficiles à parcourir ». |
| cv05 | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 2 | 2 | 25 | non | Accroche de reconversion demandée ; compétences transférables vues dans les points forts. |
| cv06 | 3 | 2 | 2 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 21 | non | Interruption repérée sans supposer la cause ; à l'exécution 2 la photo passe en 1re priorité. |
| cv07 | 3 | 2 | 3 | 3 | 1 | 2 | 2 | 3 | 2 | 1 | 22 | non | Score bas cohérent ; points forts gonflés (« expérience terrain solide », niveaux de langue supposés) ; mot-clé « permis B » ambigu (permis de conduire). |
| cv08 | 3 | 2 | 3 | 3 | 2 | 2 | 2 | 1 | 2 | 2 | 22 | non | Désordre bien repéré, mais score 62 pour un CV « à réorganiser impérativement ». |
| cv09 | 0 | 2 | 2 | 2 | 1 | 2 | 2 | 1 | 1 | 3 | 16 | non | Mise en page en colonnes NON repérée (pré-tri faux positif) ; Scrum présenté comme une certification ; photo en 1re priorité. |
| cv10 | 3 | 3 | 3 | 3 | 3 | 2 | 2 | 2 | 1 | 2 | 24 | non | Toutes les fautes listées, stable ; conseil sur l'anglais B2 « déjà indiqué » inutile. |
| cv11 | 3 | 3 | 2 | 3 | 2 | 2 | 3 | 3 | 2 | 2 | 25 | non | Absence des langues bien repérée ; exemple qui suppose l'italien langue maternelle. |
| cv12 | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 2 | 2 | 2 | 25 | non | Coordonnées manquantes en 1re priorité : correct. |
| cv13 | 3 | 2 | 2 | 3 | 0 | 2 | 0 | 2 | 1 | 2 | 17 | **OUI** | ERREUR CRITIQUE : point fort « diplôme reconnu en Suisse via la Croix-Rouge suisse » absent du CV, contredit par les améliorations ; photo « quasi systématiquement attendue ». |
| cv14 | 2 | 2 | 2 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 20 | non | Photo en 1re priorité sur les 3 exécutions ; écart ATS de 6 points ; niveaux de langue mal recopiés (« DE/FR/C1 »). |
| cv15 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 2 | 2 | 3 | 27 | non | Absence de l'allemand à Bâle bien priorisée ; permis G reconnu. |
| cv16 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 2 | 1 | 2 | 25 | non | Tâches vagues bien repérées ; photo en 1re priorité. |
| cv17 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 2 | 2 | 2 | 26 | non | Photo déclarée respectée (aucune suggestion) ; profil générique repéré, stable sur 3 exécutions. |
| cv18 | 0 | 2 | 2 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 18 | non | Dates sans mois et situation depuis 2025 NON repérées (pré-tri faux positif) ; « sans interruption » affirmé ; alerte critique automatique = faux positif (« n'est pas obligatoire »). |
| cv19 | 3 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 2 | 2 | 27 | non | Début de carrière à condenser : bien vu ; l'âge est traité sans discrimination. |
| cv20 | 2 | 3 | 2 | 3 | 2 | 2 | 2 | 2 | 1 | 2 | 21 | non | Adresse e-mail repérée seulement au point 6 des conseils, photo en 1re priorité ; mot-clé « droit bancaire » ajouté. |
| **Moyenne** | 2.60 | 2.60 | 2.55 | 2.95 | 2.25 | 2.00 | 2.30 | 2.05 | 1.55 | 2.10 | 22.9 | 1 / 20 | |

## Ce que cette mesure permet de décider (moteur v2, lot 2 — rien n'est modifié sans ton accord)
- Cibles mesurables : 0 fait inventé (vérification que chaque point fort cite le CV), photo et données personnelles traitées comme **choix** (jamais en priorité, jamais « attendues »), score calculé par une grille, conseils suisses courts et non répétitifs, mots-clés limités à ceux présents dans le CV.
- Le même jeu sera relancé après modification (`node tests/quality/run-baseline.mjs --label=v2`) ; une modification n'est retenue que si elle ne dégrade aucun critère et ne crée aucune erreur critique.
- Point à trancher par toi : la position sur la photo (ne plus la suggérer du tout, ou la mentionner une fois comme usage facultatif).
