# Grille de notation — qualité de l'analyse de CV

À remplir **à la main** pour chaque CV de `cv-set.mjs`, en lisant l'analyse produite (fichier `report.md` du run).
Le pré-tri automatique du script (défauts détectés par mots-clés, chiffres absents du CV) aide la lecture mais
**ne remplace pas** la note humaine : un mot-clé trouvé ne prouve pas que le conseil est bon.

Note de 0 à 3 par critère : 0 = absent ou faux · 1 = faible · 2 = correct · 3 = excellent.

| # | Critère | 1 = faible | 3 = excellent |
|---|---|---|---|
| 1 | Exactitude du diagnostic | Passe à côté du défaut principal placé dans le CV | Repère les défauts placés, dans le bon ordre de gravité |
| 2 | Pertinence métier et niveau | Conseils identiques pour un apprenti et un CFO | Conseils adaptés au métier, au niveau et au marché suisse visé |
| 3 | Spécificité | « Ajoutez des résultats chiffrés » sans dire où | Cite la ligne concernée du CV et dit quoi y changer |
| 4 | Applicabilité | Conseil impossible à appliquer seul | Le candidat peut corriger en 10 minutes avec la consigne |
| 5 | Respect des faits | Reformule les faits de travers | Aucun fait déformé, aucune information ajoutée |
| 6 | Qualité rédactionnelle | Fautes, jargon, phrases creuses | Français clair, vouvoiement, phrases courtes |
| 7 | Cohérence interne | Point fort et amélioration se contredisent | Points forts, améliorations et conseils suisses cohérents |
| 8 | Justification du score | Score sans lien visible avec les constats | Score cohérent avec la gravité des constats |
| 9 | Absence de conseils inutiles ou contradictoires | Conseils génériques de remplissage, ou déjà appliqués dans le CV | Uniquement des conseils utiles et nouveaux pour ce CV |
| 10 | Qualité de l'extraction (mots-clés) | Mots-clés hors sujet ou inventés | Mots-clés présents dans le CV et utiles pour la recherche |

**Erreurs critiques** (une seule = échec du CV, quelle que soit la moyenne) :
- expérience, diplôme, compétence ou chiffre inventé ;
- recommandation discriminatoire (âge, origine, sexe, situation familiale, santé) ;
- conseil trompeur (ex. présenter la photo comme obligatoire, demander d'ajouter ce qui est déjà présent) ;
- score incohérent avec les constats.

**Reproductibilité** (5 CV × 3 exécutions) : variation acceptable = formulation ; défaut = constats prioritaires
différents d'une exécution à l'autre, ou écart de score supérieur à 5 points (seuil à valider).

**Seuils proposés pour décider (à valider)** : moyenne ≥ 2 sur chaque critère, 0 erreur critique sur 20 CV,
écart de score ≤ 5 points en reproductibilité. Ces seuils servent à comparer avant/après une modification du moteur,
pas à affirmer qu'une analyse est « juste ».
