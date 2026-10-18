# Mesure de la qualité de l'analyse — v2

CV **synthétiques** uniquement (voir `tests/quality/cv-set.mjs`). Le pré-tri ci-dessous est automatique (mots-clés) : la note se fait à la main avec `tests/quality/rubric.md`.

Appels IA : 30 · jetons : 80839 · coût estimé : 0.668 USD

## Synthèse automatique (1re exécution de chaque CV)

| Indicateur | Valeur |
|---|---|
| Analyses réussies | 20 / 20 |
| Défauts placés repérés (mots-clés) | 23 / 26 |
| Qualités reconnues (mots-clés) | 17 / 26 |
| CV avec motif d'erreur critique | 0 |
| Score hors fourchette indicative |  |
| hasPhoto conforme à la saisie | 20 / 20 |

## Reproductibilité (même CV, plusieurs exécutions)

| CV | Scores | Écart score | Scores ATS | Écart ATS |
|---|---|---|---|---|
| cv03 | 71 · 71 · 71 | 0 | 69 · 69 · 69 | 0 |
| cv06 | 61 · 61 · 61 | 0 | 60 · 60 · 60 | 0 |
| cv10 | 50 · 50 · 50 | 0 | 60 · 60 · 60 | 0 |
| cv14 | 84 · 84 · 84 | 0 | 78 · 78 · 78 | 0 |
| cv17 | 71 · 68 · 68 | 3 | 69 · 60 · 60 | 9 |

Comparer aussi à la main la **première amélioration** de chaque exécution (détail par CV ci-dessous).

## Détail par CV

### cv01 — Premier emploi — employée de commerce CFC

**Exécution 1** — score 50 (fourchette indicative 40-75) · ATS 60 · 21 s

Points forts :
- Diplôme professionnel reconnu en Suisse obtenu à l'issue de l'apprentissage
- Expérience pratique en fiduciaire couvrant plusieurs domaines de l'employée de commerce
- Trois langues mentionnées, atout dans le contexte romand

Améliorations :
- Enrichir les tâches de l'apprentissage chez Fiduciaire Démo SA en ajoutant des éléments de portée ou de contexte pour chaque mission (par exemple : volume de documents traités, type de clients, logiciels comptables utilisés), afin de dépasser une simple liste de tâches.
- Indiquer les mois en plus des années pour toutes les entrées de formation et d'expérience, afin de donner une chronologie précise conforme aux attentes du marché suisse.
- Ajouter une ligne de références du type « Certificats de travail et références disponibles sur demande » en fin de CV, usage courant en Suisse.

Conseils suisses : En Suisse, le certificat de travail (Arbeitszeugnis) est un document clé : mentionner qu'il est disponible sur demande rassure les recruteurs. Pour un premier emploi après CFC, une lettre de motivation personnalisée et soignée est souvent aussi déterminante que le CV lui-même. Les offres en Romandie valorisent explicitement le bilinguisme français-allemand : un niveau précis d'allemand peut faire la différence. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : CFC d'employée de commerce, employée de commerce, fiduciaire, accueil téléphonique, saisie de factures, classement, aide à la comptabilité, Word, Excel, Outlook, français, allemand, anglais

Pré-tri : défauts ✔ Langues sans niveau (CECR) · ✔ Tâches listées sans volume ni résultat | qualités ✔ CFC obtenu / apprentissage complet

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv02 — Junior IT — développeur 2 ans

**Exécution 1** — score 66 (fourchette indicative 45-75) · ATS 81 · 20 s

Points forts :
- Présence d'un profil GitHub, atout concret pour un recruteur technique.
- Chronologie complète avec mois et continuité du parcours.

Améliorations :
- Enrichir les descriptions de poste chez Démo Digital Sàrl et Agence Fictive SA : remplacer les tâches génériques par des réalisations concrètes qui précisent le contexte, la technologie utilisée et l'impact obtenu (ex. : type de projet, fonctionnalité livrée, problème résolu).
- Réduire ou hiérarchiser la liste de compétences : des outils avancés comme Kubernetes, AWS, Azure et GCP côtoient un profil junior sans justification dans les expériences, ce qui peut nuire à la crédibilité ; ne conserver que les outils réellement maîtrisés et utilisés.
- Ajouter une mention de références en bas de CV selon l'usage suisse : « Références et certificats de travail disponibles sur demande ».

Conseils suisses : En Suisse romande, les employeurs attendent souvent un certificat de travail (Arbeitszeugnis) pour chaque poste ; mentionner leur disponibilité rassure le recruteur. Le marché tech genevois valorise les profils capables de travailler en anglais au-delà du B2 ; progresser vers C1 serait un avantage. Enfin, un CV d'une page est la norme pour un profil junior en Suisse. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Développeur web, JavaScript, TypeScript, React, Node.js, Python, Django, PostgreSQL, Docker, GraphQL, CI/CD, Bachelor en informatique de gestion, Agile, Scrum, Git

Pré-tri : défauts ✔ Liste de 22 technologies sans contexte ni niveau · ✔ Tâches vagues (« développement de fonctionnalités ») | qualités ✘ Bachelor HES · ✔ Lien GitHub

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv03 — Expérimenté logistique — dates qui se chevauchent

**Exécution 1** — score 71 (fourchette indicative 45-75) · ATS 69 · 25 s

Points forts :
- Résultat chiffré démontrant un impact opérationnel direct
- Expérience d'encadrement d'équipe clairement quantifiée
- Certifications métier spécifiques mentionnées
- Outil ERP du secteur explicitement cité

Améliorations :
- Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : vérifier et corriger les années pour supprimer ce chevauchement, qui soulève une question immédiate chez un recruteur.
- Ajouter les mois à toutes les dates (ex. 'mars 2021 – aujourd'hui') pour respecter le standard suisse et éviter toute ambiguïté sur la durée réelle des postes.
- Enrichir les postes antérieurs (Magasinier 2015-2019 et Aide-magasinier 2010-2015) avec au moins un élément de portée ou de volume, car ils se réduisent actuellement à une seule tâche sans contexte.
- Ajouter en fin de CV la mention 'Références et certificats de travail disponibles sur demande', conforme à l'usage suisse.

Conseils suisses : En Suisse romande, les certificats de travail (Arbeitszeugnis) sont systématiquement demandés : préparez-les pour chaque poste. Le niveau B1 en allemand est un atout en Valais bilingue ; précisez si vous pouvez travailler en contexte germanophone. Les employeurs suisses apprécient les CV d'une à deux pages maximum, ce que ce document respecte bien. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : chef d'équipe entrepôt, magasinier, logistique, préparation de commandes, gestion des stocks, SAP, permis cariste, R489, permis C

Pré-tri : défauts ✔ Postes 2015-2019 et 2017-2021 se chevauchent sans explication | qualités ✔ Résultat chiffré (erreurs 4 % → 1,5 %) · ✔ Encadrement de 12 personnes

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 71 (fourchette indicative 45-75) · ATS 69 · 23 s
- 1re amélioration : Chevauchement de dates entre 'Magasinier principal, 2017-2021' et 'Magasinier, 2015-2019' : vérifier et corriger les années pour que le parcours soit cohérent et sans recoupement inexpliqué.

**Exécution 3** — score 71 (fourchette indicative 45-75) · ATS 69 · 23 s
- 1re amélioration : Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : vérifier et corriger les années pour que le parcours soit cohérent et sans recoupement.

### cv04 — Cadre finance — CV très dense de 3 pages (photo déclarée)

**Exécution 1** — score 74 (fourchette indicative 50-80) · ATS 68 · 24 s

Points forts :
- Expérience de direction financière à grande échelle clairement documentée
- Réalisation stratégique majeure mise en avant avec un chiffre concret
- Maîtrise de trois langues à un niveau élevé, atout décisif sur le marché zurichois
- Diplôme fédéral reconnu explicitement mentionné avec son année

Améliorations :
- Reformater le poste actuel (CFO, Groupe Industriel Fictif AG) en liste à puces : le bloc de texte continu de plusieurs lignes masque les réalisations clés et décourage la lecture rapide d'un recruteur.
- Ajouter les mois à toutes les périodes (ex. : 'janvier 2018 – aujourd'hui') : l'absence de mois est perçue comme un manque de précision sur le marché suisse et peut susciter des doutes.
- Ajouter un lien LinkedIn dans les coordonnées : pour un profil CFO, l'absence de présence professionnelle en ligne est un signal négatif auprès des recruteurs et chasseurs de têtes suisses.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) ont une valeur déterminante : mentionner 'Références et certificats de travail disponibles sur demande' est un usage attendu. Pour un poste de CFO à Zurich, la maîtrise de l'allemand est un avantage concurrentiel fort, déjà bien mis en valeur. Le diplôme fédéral d'expert-comptable est une référence très reconnue : son positionnement en formation est approprié. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : CFO, Directrice financière, IFRS, Swiss GAAP RPC, SAP S/4HANA, consolidation, trésorerie, M&A, contrôle de gestion, Expert-comptable diplômée, reporting consolidé, gestion des risques, Power BI, fiscalité, conduite du changement

Pré-tri : défauts ✔ Paragraphes très longs, CV trop dense | qualités ✔ Résultats chiffrés (clôture 12 → 6 jours, refinancement 120 MCHF) · ✔ Expert-comptable diplômée

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv05 — Reconversion — boulanger devenu développeur web

**Exécution 1** — score 50 (fourchette indicative 40-70) · ATS 60 · 24 s

Points forts :
- Une expérience concrète de management est mentionnée dans le parcours.
- Un projet web en ligne démontre une mise en pratique réelle des compétences acquises.
- La reconversion est appuyée par une formation récente et identifiable.

Améliorations :
- Enrichir les descriptions des projets web (Site de réservation, Application de gestion de stock) en précisant le contexte, les fonctionnalités développées et les technologies utilisées côté client et serveur, afin de démontrer concrètement le niveau technique.
- Ajouter les compétences et outils manquants du métier de développeur web (par exemple HTML, CSS, Git, bases de données, méthodes de travail) dans une rubrique Compétences dédiée, pour améliorer la visibilité auprès des recruteurs et des outils de tri automatique.
- Ajouter les mois manquants pour les dates de formation et de fin de poste (ex. « 2024 » pour la fin chez Boulangerie Démo) afin de couvrir la chronologie sans zone d'ombre.
- Ajouter en bas de CV la mention « Références et certificats de travail disponibles sur demande », usage courant en Suisse.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont des documents clés : mentionner leur disponibilité rassure les recruteurs. Pour une reconversion, le canton de Fribourg étant bilingue, un niveau d'allemand précis est un atout décisif à mettre en avant. Les bootcamps sont encore peu connus de certains employeurs suisses : un lien vers le projet en ligne ou un portfolio renforce la crédibilité du profil. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Développeur web, Full-stack, React, Node.js, Python, SQLite, Certificat de développeur web full-stack, Bootcamp, Commandes fournisseurs

Pré-tri : défauts ✔ Aucune accroche expliquant la reconversion · ✘ Compétences transférables non mises en valeur | qualités ✔ Projets concrets en ligne

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv06 — Interruption de carrière de 4 ans non expliquée

**Exécution 1** — score 61 (fourchette indicative 40-70) · ATS 60 · 21 s

Points forts :
- Des indicateurs de portée concrets sont présents dans le poste actuel.
- La newsletter est associée à un volume d'audience chiffré.
- Les niveaux de langue sont indiqués selon le référentiel CECR.

Améliorations :
- Le poste « Assistante de communication, Fictif SA, Lausanne (2012-2014) » ne contient aucune tâche ni réalisation : ajouter au moins deux puces décrivant les missions principales.
- Aucun outil concret n'est mentionné dans tout le CV : citer les logiciels ou plateformes utilisés (outils d'emailing, outils de gestion des réseaux sociaux, CMS, etc.) pour renforcer la lisibilité par les recruteurs et les ATS.
- Le taux d'activité (60 %) du poste actuel est indiqué mais pas pour les postes précédents : préciser le taux pour chaque poste si pertinent, car c'est un usage courant en Suisse.

Conseils suisses : En Suisse romande, il est d'usage de joindre les certificats de travail (Arbeitszeugnisse) aux candidatures ou d'indiquer « Références et certificats de travail disponibles sur demande ». Le taux d'activité est une information attendue pour chaque poste. Un CV d'une page est la norme pour un profil avec ce niveau d'expérience. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : assistante marketing, communication, réseaux sociaux, newsletter, chargée de communication, Bachelor en communication, français, anglais, allemand

Pré-tri : défauts ✘ Période 06.2019 - 03.2023 sans explication | qualités ✔ Chiffres concrets (4 000 abonnés, 15 événements)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 61 (fourchette indicative 40-70) · ATS 60 · 23 s
- 1re amélioration : Période 06.2019 – 03.2023 : une interruption de près de quatre ans est visible sans aucune indication ; ajouter une ligne factuelle (formation, activité indépendante, autre poste) si applicable, ou mentionner brièvement la situation pour éviter que les recruteurs ne s'interrogent.

**Exécution 3** — score 61 (fourchette indicative 40-70) · ATS 60 · 23 s
- 1re amélioration : Poste 2012-2014 chez Fictif SA : ajouter au moins une ou deux missions concrètes pour éviter qu'une expérience entière apparaisse comme un blanc, et préciser les mois de début et de fin.

### cv07 — CV très court

**Exécution 1** — score 30 (fourchette indicative 10-45) · ATS 25 · 17 s

Points forts :
- Stabilité professionnelle démontrée chez un même employeur
- Permis de conduire mentionné, atout courant dans le métier
- Bilinguisme français-portugais indiqué

Améliorations :
- Détailler les tâches et responsabilités du poste de magasinier (réception, stockage, préparation de commandes, inventaires, outils utilisés, etc.) : sans ces informations, le CV ne permet pas à un recruteur d'évaluer le profil.
- Ajouter un numéro de téléphone et une localité (ville ou région) : ces éléments sont indispensables pour être contacté et pour que les recruteurs suisses situent le candidat.
- Détailler les emplois antérieurs ('divers emplois') avec au moins les intitulés de poste, les employeurs et les années, afin d'éviter un parcours opaque.
- Ajouter la mention 'Références et certificats de travail disponibles sur demande' en fin de CV, usage standard en Suisse.

Conseils suisses : En Suisse, les recruteurs attendent généralement les certificats de travail (Arbeitszeugnis) pour chaque poste ; précisez que vous pouvez les fournir sur demande. La localité du candidat est importante car les employeurs suisses tiennent compte des temps de trajet. Un CV suisse standard fait une à deux pages avec des rubriques claires et un ordre antichronologique. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : magasinier, français, portugais, permis de conduire B

Pré-tri : défauts ✔ CV très incomplet (pas de détails, pas de téléphone, pas de lieu) · ✔ « Divers emplois » sans précision

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv08 — Mal structuré — ordre et rubriques mélangés

**Exécution 1** — score 38 (fourchette indicative 30-60) · ATS 40 · 23 s

Points forts :
- Une compétence spécialisée dans la facturation médicale est mentionnée explicitement.
- Une expérience en gestion de la relation client est présente.

Améliorations :
- Restructurer le CV en rubriques distinctes et ordonnées (Expériences professionnelles en antichronologique, puis Formation, puis Compétences, puis Langues) : actuellement tout est mélangé dans un bloc illisible qui nuit immédiatement à la lisibilité.
- Ajouter les mois à toutes les dates d'expérience et de formation (ex. 'janvier 2022 – aujourd'hui') : seules des années sont indiquées, ce qui est insuffisant selon les standards suisses.
- Remplacer les niveaux de langue informels par des niveaux CECR : 'anglais un peu' ne permet pas à un recruteur d'évaluer la compétence réelle.
- Enrichir les descriptions de poste avec la portée des tâches : par exemple pour 'agenda des médecins', préciser le contexte ou l'environnement de travail plutôt qu'une simple liste de tâches.
- Reformuler l'accroche 'J'aime le contact humain et je suis motivée' en une phrase professionnelle centrée sur le profil et les secteurs visés, sans affirmations génériques.

Conseils suisses : En Suisse, les recruteurs attendent des mois précis pour chaque poste, pas seulement les années. La mention 'Références et certificats de travail disponibles sur demande' est l'usage standard. Un CV suisse tient généralement sur une à deux pages avec des rubriques clairement titrées. Pour la région de Neuchâtel, indiquer un niveau de français natif ou courant est un atout à valoriser explicitement. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : réceptionniste, assistante administrative, secrétaire, accueil, facturation TARMED, check-in, réservations, gestion des plaintes clients, agenda des médecins, CFC employée de bureau, Excel, Word

Pré-tri : défauts ✔ Pas de rubriques claires, chronologie dans le désordre · ✔ « anglais un peu » | qualités ✔ Compétence métier spécifique (facturation TARMED)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv09 — PDF à deux colonnes — texte extrait mélangé

**Exécution 1** — score 70 (fourchette indicative 35-70) · ATS 59 · 20 s

Points forts :
- Certification professionnelle reconnue internationalement mentionnée

Améliorations :
- Ajouter les mois aux dates de toutes les expériences (ex. « janvier 2020 – aujourd'hui ») : les recruteurs suisses attendent des dates précises pour évaluer la durée exacte des postes.
- Enrichir le poste chez Assurance Démo SA avec au moins un résultat ou une portée mesurable pour les 3 applications métier mentionnées, afin d'éviter une simple liste de tâches.
- Ajouter en bas du CV la mention « Références et certificats de travail disponibles sur demande », conformément à l'usage suisse.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont des documents clés : préparez-les pour chaque poste. Le marché bancaire romand valorise fortement les profils trilingues ; le niveau B2 en allemand est un atout à mettre en avant dans la lettre de motivation. Un CV suisse tient idéalement sur une à deux pages avec une mise en page sobre et sans colonnes entremêlées. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Chef de projet IT, Gestion de projet, Prince2, Scrum, Jira, Confluence, PMP, Core banking, Analyste métier, Master HEC, Migration, Banque, Assurance

Pré-tri : défauts ✔ Mise en page en deux colonnes mal lue par les logiciels de tri | qualités ✘ Projet chiffré (8 MCHF, 40 personnes) · ✔ Certification PMP

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv10 — Administratif — fautes d'orthographe

**Exécution 1** — score 50 (fourchette indicative 40-70) · ATS 60 · 22 s

Points forts :
- Continuité professionnelle dans le même domaine depuis plusieurs années
- Outil de comptabilité suisse mentionné explicitement

Améliorations :
- Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : 'PROFESSIONELLE', 'Organistion', 'directeur générale', 'procès-verbals', 'par ans', 'Microsft Ofice' nuisent fortement à la crédibilité d'une assistante de direction.
- Enrichir les tâches avec des éléments de portée ou de contexte : pour 'Organistion des séances du conseil de fondation (6 par ans)', préciser par exemple la préparation des dossiers, la coordination des participants ou la rédaction des convocations.
- Ajouter les mois aux dates de toutes les expériences et formations, car les recruteurs suisses attendent une précision mois/année pour évaluer les durées et les transitions.
- Développer les mots-clés métier en ajoutant des compétences explicites absentes du CV, comme la gestion de la correspondance, l'accueil, la coordination ou les outils de communication utilisés.
- Ajouter une ligne 'Références et certificats de travail disponibles sur demande' en bas du CV, conformément à l'usage suisse.

Conseils suisses : En Suisse romande, les certificats de travail (Arbeitszeugnis) sont systématiquement demandés : mentionnez leur disponibilité. Pour un poste en fondation à Genève, la maîtrise du français écrit irréprochable est un critère éliminatoire. Un CV d'une page est la norme pour ce profil. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Assistante de direction, Secrétaire, Gestion de l'agenda, Conseil de fondation, Courriers juridiques, Gestion des délais, CFC d'employée de commerce, Diplôme d'assistante de direction, Word, Excel, PowerPoint, Abacus, Anglais B2

Pré-tri : défauts ✔ Fautes d'orthographe (professionelle, organistion, procès-verbals, Microsft Ofice) | qualités ✘ Diplôme d'assistante de direction
Mots-clés absents du texte du CV : Anglais B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 50 (fourchette indicative 40-70) · ATS 60 · 20 s
- 1re amélioration : Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : « Organistion », « procès-verbals », « par ans », « Microsft Ofice », « générale » (accord avec « directeur »).

**Exécution 3** — score 50 (fourchette indicative 40-70) · ATS 60 · 22 s
- 1re amélioration : Corriger toutes les fautes d'orthographe et de frappe ('professionelle', 'Organistion', 'procès-verbals', 'par ans', 'générale', 'Microsft Ofice') : elles nuisent gravement à la crédibilité d'une assistante de direction dont la rédaction est un cœur de métier.

### cv11 — Commercial — résultats chiffrés, aucune langue

**Exécution 1** — score 64 (fourchette indicative 55-85) · ATS 69 · 23 s

Points forts :
- Résultats commerciaux chiffrés et crédibles
- Portefeuille client significatif couvrant deux régions linguistiques
- Reconnaissance par les pairs dans le poste précédent
- Expérience en marchés publics, compétence rare et valorisée

Améliorations :
- Ajouter une rubrique Langues avec les niveaux (ex. CECR) pour l'italien, l'allemand et toute autre langue pratiquée : l'absence totale est très pénalisante pour un poste couvrant le Tessin et la Suisse alémanique.
- Préciser les mois de début et de fin pour chaque expérience et formation afin de répondre aux attentes suisses de transparence chronologique.
- Enrichir le poste de Représentant chez Exemple Médical Sàrl avec au moins un résultat quantifié, au-delà de la seule mention des 120 cabinets médicaux.
- Ajouter un profil LinkedIn ou une URL de profil professionnel dans les coordonnées, désormais attendu par la majorité des recruteurs suisses.

Conseils suisses : En Suisse, les recruteurs attendent systématiquement les certificats de travail (Arbeitszeugnis) : mentionner « Références et certificats de travail disponibles sur demande » en bas de CV est un usage courant. Le marché medtech suisse valorise la maîtrise des appels d'offres publics cantonaux, déjà visible ici. Pour les postes couvrant plusieurs régions linguistiques, indiquer les langues avec leur niveau est quasi obligatoire. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Key Account Manager, distribution de matériel médical, Salesforce, négociation, appels d'offres publics, contrats cadres, prospection, B2B, brevet fédéral de spécialiste de vente, Medtech, hôpitaux, cliniques

Pré-tri : défauts ✔ Aucune rubrique langues (alors qu'il travaille au Tessin et en Suisse alémanique) | qualités ✔ Résultats chiffrés (+18 %, 45 clients)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv12 — Vente terrain — coordonnées manquantes

**Exécution 1** — score 54 (fourchette indicative 35-65) · ATS 60 · 19 s

Points forts :
- Responsabilité d'encadrement démontrée dès le poste actuel
- Multilinguisme adapté au marché bilingue de Bienne
- Prise en charge de la mise en valeur du point de vente

Améliorations :
- Ajouter immédiatement un numéro de téléphone, une adresse e-mail et une localité : sans ces coordonnées, aucun recruteur ne peut contacter la candidate.
- Préciser les mois pour toutes les dates d'expérience (ex. : mars 2021 – aujourd'hui) afin de répondre aux attentes de précision du marché suisse.
- Enrichir les tâches du poste actuel avec des éléments de portée ou de contexte (type de magasin, gamme de produits, environnement de travail) pour dépasser une simple liste de tâches.
- Ajouter des mots-clés métier concrets absents du CV, tels que les outils ou logiciels de caisse utilisés, ou des compétences comme la gestion de stock ou le merchandising, si cela correspond à la réalité.

Conseils suisses : En Suisse, il est d'usage de joindre les certificats de travail (Arbeitszeugnisse) à chaque candidature ou d'indiquer « Références et certificats de travail disponibles sur demande ». Le marché de Bienne étant bilingue, mentionner l'allemand B1 est un atout à valoriser dans la lettre de motivation. Une lettre de motivation personnalisée reste attendue pour la grande majorité des postes en commerce de détail. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : vendeuse, commerce de détail, conseil clientèle, encaissement, vitrine, assistante du commerce de détail, AFP, français, allemand, arabe, sens du service

Pré-tri : défauts ✔ Ni téléphone, ni e-mail, ni localité | qualités ✘ Forme des apprenties

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv13 — Soins — infirmière frontalière, diplôme français

**Exécution 1** — score 59 (fourchette indicative 45-75) · ATS 60 · 23 s

Points forts :
- Expérience en encadrement pédagogique mentionnée explicitement
- Volume de charge de travail chiffré pour le poste actuel

Améliorations :
- Ajouter les mois aux dates de toutes les expériences et de la formation (ex. 'mars 2020 – aujourd'hui') pour répondre aux attentes suisses de précision chronologique.
- Développer le poste en EHPAD avec au moins deux missions ou éléments de contexte, car il est actuellement vide de tout contenu.
- Intégrer des mots-clés techniques infirmiers absents du CV (ex. : soins de plaies, gestion de la douleur, dossier patient informatisé, protocoles) pour passer les filtres de sélection.
- Ajouter une mention du niveau d'allemand ou indiquer explicitement son absence, car la Suisse est majoritairement germanophone et les employeurs suisses y sont attentifs.
- Ajouter en bas de CV la mention 'Références et certificats de travail disponibles sur demande', conforme à l'usage suisse.

Conseils suisses : En Suisse, les employeurs attendent systématiquement des certificats de travail (Arbeitszeugnis) pour chaque poste ; mentionnez leur disponibilité. La résidence à Annemasse implique de préciser votre situation de frontalière (permis G) dès la candidature pour rassurer les recruteurs suisses. Les hôpitaux suisses romands valorisent fortement la connaissance du système de santé suisse (LAMal, DRG) ; une phrase sur votre intérêt ou votre connaissance de ce cadre peut faire la différence. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Infirmière diplômée d'État, médecine interne, EHPAD, encadrement des étudiants infirmiers, Diplôme d'État d'infirmier, français, anglais

Pré-tri : défauts ✘ Reconnaissance du diplôme français (CRS / Croix-Rouge suisse) non mentionnée · ✔ Statut de travail en Suisse (permis G) non indiqué | qualités ✔ Encadrement d'étudiants, 12 patients par poste

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv14 — Multilingue FR/DE/EN — langues bien renseignées

**Exécution 1** — score 84 (fourchette indicative 60-90) · ATS 78 · 20 s

Points forts :
- Résultats quantifiés démontrant un impact direct sur la qualité de service
- Profil trilingue adapté au marché suisse bilingue DE/FR
- Expérience de direction d'équipe clairement dimensionnée
- Outils CRM du secteur explicitement mentionnés

Améliorations :
- Ajouter les mois aux dates de chaque poste (ex. : 'janvier 2021 – aujourd'hui') afin de permettre aux recruteurs de vérifier la continuité du parcours, exigence courante en Suisse.
- Préciser dans la section Formation la date d'obtention effective du brevet fédéral et l'organisme certificateur, car ce diplôme est un atout différenciant qui mérite d'être détaillé.
- Ajouter en bas de CV la mention 'Références et certificats de travail disponibles sur demande', conformément à l'usage suisse.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont systématiquement demandés lors du processus de recrutement : préparez-les pour chaque poste listé. Le brevet fédéral est un titre reconnu nationalement ; mentionner l'organisme émetteur renforce sa crédibilité. Pour le marché bernois bilingue, la mise en avant du profil FR/DE en tête de CV est un avantage concurrentiel réel. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Responsable service clientèle, Conseiller clientèle senior, Salesforce Service Cloud, Zendesk, MS Office, Brevet fédéral, Management de la clientèle, Télécommunications, Traitement des réclamations, Chat client, Trilingue

Pré-tri : défauts ✔ Pas de mention des certificats de travail / références | qualités ✔ Langues avec niveaux CECR · ✔ Résultat chiffré (68 % → 81 %)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 84 (fourchette indicative 60-90) · ATS 78 · 22 s
- 1re amélioration : Ajouter les mois de début et de fin pour chaque poste (ex. 'janvier 2021 – aujourd'hui') : les recruteurs suisses et les ATS attendent des dates complètes pour évaluer la durée exacte des expériences.

**Exécution 3** — score 84 (fourchette indicative 60-90) · ATS 78 · 20 s
- 1re amélioration : Ajouter les mois aux dates de toutes les expériences (ex. : 'janvier 2021 – aujourd'hui') afin de permettre aux recruteurs de vérifier la continuité du parcours, exigence courante en Suisse.

### cv15 — Frontalier avec permis G — allemand absent

**Exécution 1** — score 65 (fourchette indicative 45-75) · ATS 60 · 21 s

Points forts :
- Résultat chiffré démontrant un impact opérationnel direct
- Portée du poste clairement quantifiée
- Certification électrique mentionnée explicitement
- Statut frontalier clairement indiqué, rassurant pour un employeur suisse

Améliorations :
- L'allemand est absent : indiquer le niveau (même débutant) est indispensable pour un poste à Bâle, où cette langue est la langue de travail dominante.
- Le poste 'Électromécanicien, Usine Fictive, Mulhouse (2014-2019)' ne contient aucune tâche ni résultat : ajouter au moins deux lignes décrivant les missions ou équipements traités.
- Aucune rubrique Compétences techniques n'est présente : ajouter une section listant les outils, types d'équipements ou logiciels (ex. GMAO) maîtrisés pour améliorer la détection par les ATS.
- Ajouter en bas de CV la mention 'Références et certificats de travail disponibles sur demande', conforme à l'usage suisse.

Conseils suisses : En Suisse, les employeurs attendent systématiquement les certificats de travail (Arbeitszeugnis) pour chaque poste : préparez-les avant de postuler. Le CV suisse standard fait une à deux pages maximum. Pour la région de Bâle, une connaissance même partielle de l'allemand est un critère de sélection fréquent et doit figurer explicitement. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Technicien de maintenance, Électromécanicien, Maintenance préventive, Habilitation électrique BR, BTS Maintenance des systèmes, Lignes de production, Permis G

Pré-tri : défauts ✔ Travaille à Bâle mais aucune mention de l'allemand | qualités ✘ Permis G indiqué · ✔ Résultat chiffré (−22 % d'arrêts)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv16 — Permis B — ingénieure civile, tâches vagues

**Exécution 1** — score 65 (fourchette indicative 45-75) · ATS 69 · 19 s

Points forts :
- Maîtrise d'outils logiciels spécifiques au génie civil suisse
- Expérience en cours en Suisse dans un bureau d'ingénieurs
- Niveau de français adapté au marché romand
- Formation en génie civil avec reconnaissance mentionnée

Améliorations :
- Enrichir les tâches listées sous chaque poste avec des éléments de portée ou de contexte (type d'ouvrages, phases de projet, responsabilités concrètes) pour dépasser le niveau d'une simple liste de tâches.
- Ajouter en bas du CV la mention 'Références et certificats de travail disponibles sur demande', conforme à l'usage suisse.

Conseils suisses : En Suisse, les employeurs attendent souvent les certificats de travail (Arbeitszeugnis) pour chaque poste : les préparer à l'avance est un avantage. La connaissance des normes SIA est un atout distinctif à mettre en avant dans la lettre de motivation. Le marché romand valorise la maîtrise du français écrit professionnel, notamment pour la rédaction de rapports techniques. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : ingénieure civile, génie civil, responsable de projets, suivi de chantiers, calculs de structures, conception d'ouvrages, AutoCAD, Revit, SIA Norm, Cubus, Master en génie civil, bureau d'ingénieurs

Pré-tri : défauts ✔ « Responsable de projets » sans taille, budget ni type d'ouvrage | qualités ✘ Permis B indiqué · ✘ Connaissance des normes SIA

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv17 — Avec photo — profil générique (photo déclarée)

**Exécution 1** — score 71 (fourchette indicative 45-75) · ATS 69 · 20 s

Points forts :
- Des volumes chiffrés concrets illustrent la portée du poste actuel.
- Une réalisation structurante est mentionnée au-delà des tâches courantes.
- Le brevet fédéral, diplôme de référence en RH suisse, est clairement indiqué.

Améliorations :
- Ajouter les mois aux dates de toutes les expériences (ex. : 'janvier 2020 – aujourd'hui') pour répondre aux attentes des recruteurs suisses et éviter tout doute sur la continuité du parcours.
- Compléter le poste 'Assistante RH, Exemple Retail SA, Morges' avec au moins deux tâches ou résultats concrets, car cette expérience de quatre ans est actuellement vide.
- Mentionner les outils ou logiciels RH utilisés (SIRH, logiciel de paie, ATS) dans les expériences, car ces mots-clés sont déterminants pour le tri automatisé des candidatures.
- Remplacer le profil générique ('dynamique, motivée et polyvalente') par deux ou trois éléments factuels tirés du parcours, afin de le rendre immédiatement différenciant.

Conseils suisses : En Suisse romande, il est d'usage de conclure le CV par la mention 'Références et certificats de travail disponibles sur demande'. Le brevet fédéral est un signal fort sur le marché suisse : il peut être mis davantage en avant dans le profil. Un CV d'une page est la norme pour un profil de ce niveau d'expérience. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Spécialiste RH, Recrutement, Gestion administrative des salaires, Processus d'intégration, Assistante RH, Brevet fédéral de spécialiste RH, Bachelor en psychologie, Français, Anglais, Allemand

Pré-tri : défauts ✔ Profil générique (« dynamique, motivée, polyvalente ») | qualités ✔ Chiffres concrets (40-60 recrutements, 250 salaires)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 68 (fourchette indicative 45-75) · ATS 60 · 22 s
- 1re amélioration : Ajouter les mois à toutes les dates d'expérience et de formation (ex. : 'janvier 2020 – aujourd'hui') : les recruteurs suisses attendent une précision au mois pour évaluer la durée réelle des postes.

**Exécution 3** — score 68 (fourchette indicative 45-75) · ATS 60 · 21 s
- 1re amélioration : Ajouter les mois aux dates de toutes les expériences et formations (ex. : 'janvier 2020 – aujourd'hui') pour permettre une lecture précise de la continuité du parcours.

### cv18 — Sans photo — dates sans mois

**Exécution 1** — score 65 (fourchette indicative 50-80) · ATS 69 · 20 s

Points forts :
- Maîtrise de logiciels comptables standards du marché suisse
- Responsabilité étendue couvrant plusieurs entités
- Diplôme fédéral reconnu en finance et comptabilité

Améliorations :
- Ajouter les mois aux dates de toutes les expériences et formations (ex. : 'janvier 2019 – décembre 2025') pour répondre aux attentes de précision des recruteurs suisses.
- Enrichir le poste d'aide-comptable chez Fiduciaire Exemple avec au moins deux tâches concrètes, car la rubrique est actuellement vide.
- Ajouter une indication de portée ou de contexte aux tâches du poste chez Horlogerie Fictive SA (ex. : volume de transactions, type de clôtures) pour dépasser le niveau d'une simple liste de tâches.
- Ajouter en bas de CV la mention 'Références et certificats de travail disponibles sur demande', conforme à l'usage suisse.

Conseils suisses : En Suisse romande, les recruteurs en comptabilité accordent une grande importance aux certificats de travail (Arbeitszeugnis) : mentionnez leur disponibilité. Le brevet fédéral est un titre reconnu nationalement ; il peut être mis davantage en valeur dans le titre ou l'accroche. La maîtrise d'Abacus est un atout distinctif sur le marché suisse, notamment dans les PME et fiduciaires. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Comptable, Aide-comptable, Brevet fédéral de spécialiste en finance et comptabilité, CFC d'employé de commerce, Abacus, SAP FI, Excel avancé, Bouclements, TVA, Déclarations TVA, Fiduciaire

Pré-tri : défauts ✔ Dates sans mois ; poste terminé en 2025 sans indication de la suite | qualités ✘ Brevet fédéral

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv19 — Senior 58 ans — début de carrière trop détaillé

**Exécution 1** — score 68 (fourchette indicative 50-80) · ATS 60 · 25 s

Points forts :
- Réalisations quantifiées au poste actuel, démontrant un impact concret sur la performance.
- Envergure managériale significative clairement exprimée.
- Certification qualité sectorielle obtenue et maintenue, gage de rigueur.
- Double formation professionnelle solide et cohérente avec le secteur.

Améliorations :
- Ajouter les mois aux dates de toutes les expériences (ex. « janvier 2010 – aujourd'hui ») : les recruteurs suisses s'attendent à des dates précises pour évaluer les transitions.
- Enrichir la rubrique 'mots-clés / compétences' ou les descriptions de poste avec des outils concrets utilisés (ERP, logiciels de planification, normes qualité complémentaires à IFS) pour améliorer la visibilité auprès des systèmes de tri automatique (ATS).
- Réduire fortement le détail des postes 1986-1998 (Chef d'équipe et Ouvrier de production) : des tâches comme 'Chargement des camions' ou 'Nettoyage des installations' n'apportent pas de valeur pour un profil de Directeur de production et diluent l'impact du CV.
- Ajouter en bas de CV la mention 'Références et certificats de travail disponibles sur demande', conformément à l'usage suisse.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont des documents clés : mentionner leur disponibilité rassure immédiatement le recruteur. Le marché agroalimentaire romand valorise fortement les certifications IFS et BRC ; les citer dans un titre ou un résumé de profil renforce la pertinence dès le premier regard. Un profil LinkedIn à jour est de plus en plus consulté par les recruteurs suisses avant même le premier contact. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Directeur de production, Responsable de production, Agroalimentaire, IFS, Technologue en industrie laitière, CFC, Diplôme fédéral, Maître technologue, Chef d'équipe, Fromagerie, Laiterie, Allemand B2

Pré-tri : défauts ✔ Postes de 1984-1998 trop détaillés par rapport à l'expérience récente | qualités ✔ Résultats (IFS, +15 %, 140 collaborateurs)
Mots-clés absents du texte du CV : Allemand B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv20 — Étudiant master — adresse e-mail non professionnelle

**Exécution 1** — score 53 (fourchette indicative 40-70) · ATS 60 · 21 s

Points forts :
- Expérience professionnelle en cours dans un cabinet juridique, cohérente avec la formation.
- Maîtrise de trois langues avec niveaux certifiés, atout sur le marché suisse.
- Participation à une compétition juridique internationale reconnue.

Améliorations :
- Enrichir les descriptions de poste (Assistant juridique et stages) en ajoutant la portée des tâches : types de dossiers traités, volume de recherches, nature des notes rédigées — une liste de tâches sans contexte ne permet pas à un recruteur d'évaluer le niveau réel.
- Remplacer l'adresse e-mail « lebogossdu74@example.invalid » par une adresse au format prénom.nom, nettement plus professionnelle pour un profil juridique.
- Ajouter les mois aux dates de toutes les entrées (formation et expériences) : le marché suisse attend une chronologie précise au mois près.
- Mentionner des domaines juridiques supplémentaires ou des outils utilisés (bases de données juridiques, logiciels de recherche) afin d'améliorer la visibilité du CV auprès des recruteurs et des systèmes de tri automatique.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) ont une valeur centrale : indiquer « Références et certificats de travail disponibles sur demande » en bas de CV est un usage courant. Pour un poste en droit des affaires à Genève, le niveau d'allemand B1 peut être un atout à valoriser explicitement selon les cantons visés. Le taux d'activité (20 %) est bien mentionné, ce qui est conforme aux attentes suisses. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : droit des affaires, assistant juridique, droit des contrats, recherches juridiques, service juridique, master en droit, bachelor en droit, moot court, anglais C1, allemand B1, Genève

Pré-tri : défauts ✔ Adresse e-mail non professionnelle | qualités ✘ Parcours universitaire cohérent + emploi à temps partiel
Mots-clés absents du texte du CV : anglais C1, allemand B1

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non
