# Mesure de la qualité de l'analyse — v2-1

CV **synthétiques** uniquement (voir `tests/quality/cv-set.mjs`). Le pré-tri ci-dessous est automatique (mots-clés) : la note se fait à la main avec `tests/quality/rubric.md`.

Appels IA : 30 · jetons : 97567 · coût estimé : 0.735 USD

## Synthèse automatique (1re exécution de chaque CV)

| Indicateur | Valeur |
|---|---|
| Analyses réussies | 20 / 20 |
| Défauts placés repérés (mots-clés) | 24 / 26 |
| Qualités reconnues (mots-clés) | 25 / 26 |
| CV avec motif d'erreur critique | 0 |
| Score hors fourchette indicative | cv03, cv04, cv17, cv19 |
| hasPhoto conforme à la saisie | 20 / 20 |

## Reproductibilité (même CV, plusieurs exécutions)

| CV | Scores | Écart score | Scores ATS | Écart ATS |
|---|---|---|---|---|
| cv03 | 76 · 76 · 76 | 0 | 75 · 75 · 75 | 0 |
| cv06 | 61 · 61 · 61 | 0 | 63 · 63 · 63 | 0 |
| cv10 | 54 · 54 · 50 | 4 | 63 · 63 · 58 | 5 |
| cv14 | 90 · 96 · 96 | 6 | 95 · 95 · 95 | 0 |
| cv17 | 80 · 78 · 74 | 6 | 78 · 78 · 70 | 8 |

Comparer aussi à la main la **première amélioration** de chaque exécution (détail par CV ci-dessous).

## Détail par CV

### cv01 — Premier emploi — employée de commerce CFC

**Exécution 1** — score 54 (fourchette indicative 40-75) · ATS 68 · 20 s

Points forts :
- Le CFC d'employée de commerce obtenu en 2026 est le diplôme de référence pour les postes administratifs en Suisse romande (« CFC d'employée de commerce, École professionnelle commerciale de Lausanne »)
- L'apprentissage réalisé en fiduciaire apporte une exposition concrète à un environnement comptable et administratif exigeant (« Apprentie employée de commerce, Fiduciaire Démo SA, Lausanne »)
- La mention de trois langues couvre les principaux besoins linguistiques du marché suisse romand (« Français, allemand, anglais »)

Améliorations :
- Enrichir les tâches de l'apprentissage avec des éléments de portée ou de contexte (par exemple le type de clients, le volume de documents traités ou les logiciels comptables utilisés) : en l'état, 'saisie de factures' et 'classement' ne permettent pas à un recruteur d'évaluer le niveau d'autonomie atteint.
- Préciser les mois pour les dates de l'apprentissage et du CFC afin de confirmer que la formation est bien terminée au moment du dépôt de candidature.

Conseils suisses : En Suisse, le certificat de travail (Arbeitszeugnis) de la Fiduciaire Démo SA est un document clé : mentionnez qu'il est disponible sur demande. Pour un premier emploi après CFC, une lettre de motivation personnalisée par employeur est attendue et souvent aussi déterminante que le CV lui-même. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : apprentie employée de commerce, fiduciaire, accueil téléphonique, saisie de factures, classement, aide à la comptabilité, Word, Excel, Outlook, français, allemand, anglais

Pré-tri : défauts ✔ Langues sans niveau (CECR) · ✔ Tâches listées sans volume ni résultat | qualités ✔ CFC obtenu / apprentissage complet

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv02 — Junior IT — développeur 2 ans

**Exécution 1** — score 59 (fourchette indicative 45-75) · ATS 68 · 22 s

Points forts :
- Un poste en emploi dès la fin du bachelor, ce qui rassure un recruteur sur la capacité à s'insérer rapidement sur le marché (« 09.2024 - aujourd'hui Développeur web, Démo Digital Sàrl, Genève »)
- Un stage effectué pendant la formation, qui démontre une première exposition au monde professionnel avant l'obtention du diplôme (« 02.2024 - 08.2024 Stagiaire développeur, Agence Fictive SA, Nyon »)
- Des coordonnées complètes incluant un lien GitHub, utile pour un recruteur technique qui souhaite évaluer le code produit (« github.com/noah-exemple »)

Améliorations :
- Enrichir les descriptions de postes chez Démo Digital Sàrl et Agence Fictive SA : remplacer les tâches génériques ('Développement de fonctionnalités', 'Correction de bugs', 'Développement front-end') par des descriptions qui précisent le contexte, les technologies réellement utilisées et, si possible, la portée du travail réalisé.
- Rattacher les compétences techniques de la liste (React, Node.js, Docker, Kubernetes, AWS, etc.) aux expériences où elles ont été effectivement utilisées, afin qu'elles ne semblent pas déclaratives sans fondement.
- Ajouter une courte accroche professionnelle sous le titre 'Développeur web junior' pour contextualiser le profil, notamment utile pour un premier emploi, en précisant par exemple la spécialité ou le type de projets visés.

Conseils suisses : En Suisse, les recruteurs accordent beaucoup d'importance aux certificats de travail (Arbeitszeugnis) : mentionner qu'ils sont disponibles sur demande est un usage courant. Le marché genevois étant bilingue français-anglais dans le secteur tech, le niveau B2 en anglais est un atout à maintenir visible. Un profil GitHub actif est particulièrement valorisé pour les développeurs juniors dans la région. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Développeur web, JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, GraphQL, CI/CD, Bachelor en informatique de gestion, Agile, Scrum, Git

Pré-tri : défauts ✔ Liste de 22 technologies sans contexte ni niveau · ✔ Tâches vagues (« développement de fonctionnalités ») | qualités ✔ Bachelor HES · ✔ Lien GitHub

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv03 — Expérimenté logistique — dates qui se chevauchent

**Exécution 1** — score 76 (fourchette indicative 45-75) · ATS 75 · 26 s

Points forts :
- Résultat chiffré probant en tant que chef d'équipe, directement valorisable auprès d'un recruteur logistique (« Réduction des erreurs de préparation de 4 % à 1,5 % en 18 mois »)
- Certification cariste avec catégories précisées, un critère souvent éliminatoire dans les offres d'entrepôt (« Permis cariste R489 cat. 3 et 5 »)
- Encadrement d'une équipe de taille significative, ce qui positionne le candidat sur des postes de responsabilité (« Encadrement d'une équipe de 12 magasiniers »)
- Maîtrise de SAP mentionnée explicitement, outil très recherché dans la logistique suisse (« Gestion des stocks sur SAP »)

Améliorations :
- Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : ces deux postes se recoupent sur 2017-2019 ; vérifier et corriger les dates pour éviter qu'un recruteur ou un logiciel de tri écarte le CV.
- Les postes de Magasinier (2015-2019) et d'Aide-magasinier (2010-2015) ne contiennent aucun résultat ni volume : ajouter au moins un élément de portée (quantité de références gérées, volume de commandes, etc.) pour chacun afin de renforcer la progression du parcours.
- Ajouter une accroche professionnelle courte sous le titre 'Chef d'équipe logistique' pour résumer le profil et les atouts clés, ce qui facilite la lecture rapide par un recruteur.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) ont autant de poids que le CV lui-même : mentionner leur disponibilité en bas de page est un usage courant. Le niveau d'allemand B1 est un atout en Valais bilingue ; si le candidat vise des postes en région alémanique, il peut être utile de le mettre davantage en avant. Les offres logistiques suisses précisent souvent les catégories de permis cariste exigées : le format actuel (R489 cat. 3 et 5) est déjà optimal. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Chef d'équipe entrepôt, Magasinier principal, Permis cariste R489, SAP, Préparation de commandes, Gestion des stocks, CFC de logisticien, Permis C

Pré-tri : défauts ✔ Postes 2015-2019 et 2017-2021 se chevauchent sans explication | qualités ✔ Résultat chiffré (erreurs 4 % → 1,5 %) · ✔ Encadrement de 12 personnes

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 76 (fourchette indicative 45-75) · ATS 75 · 24 s
- 1re amélioration : Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : ces deux postes se recoupent sur 2017-2019, ce qui interpellera immédiatement tout recruteur. Vérifier et corriger les dates pour qu'elles soient cohérentes.

**Exécution 3** — score 76 (fourchette indicative 45-75) · ATS 75 · 27 s
- 1re amélioration : Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : ces deux postes se recoupent sur 2017-2019, ce qui interpellera immédiatement un recruteur. Vérifier et corriger les dates pour qu'elles soient cohérentes.

### cv04 — Cadre finance — CV très dense de 3 pages (photo déclarée)

**Exécution 1** — score 84 (fourchette indicative 50-80) · ATS 83 · 24 s

Points forts :
- Expérience de direction financière à grande échelle, directement lisible pour un recruteur cherchant un CFO de groupe (« CA 450 MCHF, 1 200 collaborateurs »)
- Réalisation concrète et chiffrée en contrôle de gestion, qui démontre une capacité d'amélioration opérationnelle mesurable (« réduction du délai de clôture de 12 à 6 jours ouvrables »)
- Diplôme fédéral d'expert-comptable, référence reconnue sur le marché suisse qui renforce la crédibilité du profil (« Expert-comptable diplômée (diplôme fédéral) »)
- Trilinguisme avec niveaux certifiés, atout décisif pour un poste de CFO dans un groupe international basé à Zurich (« français (langue maternelle), allemand (C1), anglais (C1) »)

Améliorations :
- Les blocs de texte du poste CFO et du profil sont trop longs : reformuler en listes à puces courtes pour permettre une lecture rapide par un recruteur ou un logiciel ATS.
- Les postes de 2002 à 2011 (auditrice, contrôleuse senior, assistante comptable) ne contiennent aucun résultat ni portée : ajouter au moins un élément de volume ou d'impact pour chacun, en s'appuyant uniquement sur des faits réels.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont systématiquement demandés lors du processus de recrutement : mentionner leur disponibilité en bas de CV est un usage courant. Pour un poste de CFO à Zurich, l'allemand écrit de niveau C1 est souvent testé lors des entretiens. Les recruteurs suisses apprécient un CV d'une à deux pages maximum, ce qui implique de condenser les postes les plus anciens. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : CFO, Directrice financière, IFRS, Swiss GAAP RPC, SAP S/4HANA, consolidation, trésorerie, M&A, contrôle de gestion, reporting consolidé, Expert-comptable diplômée, Power BI, fiscalité, gestion des risques, due diligence

Pré-tri : défauts ✔ Paragraphes très longs, CV trop dense | qualités ✔ Résultats chiffrés (clôture 12 → 6 jours, refinancement 120 MCHF) · ✔ Expert-comptable diplômée

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv05 — Reconversion — boulanger devenu développeur web

**Exécution 1** — score 50 (fourchette indicative 40-70) · ATS 63 · 25 s

Points forts :
- Un projet web concret et en ligne démontre une capacité à livrer, ce qui est décisif pour un profil sans expérience professionnelle en développement (« Site de réservation pour une boulangerie (React, Node.js), en ligne depuis 03.2025 »)
- L'expérience de gestion d'équipe montre une responsabilité opérationnelle réelle, un atout différenciateur face à d'autres juniors en développement (« Gestion d'une équipe de 4 personnes »)
- La formation récente et spécialisée valide l'engagement dans la reconversion et fournit un ancrage technique crédible (« Certificat de développeur web full-stack (bootcamp de 6 mois), École fictive du code, Lausanne »)

Améliorations :
- Enrichir la description des projets web avec des éléments concrets (fonctionnalités principales, nombre d'utilisateurs, lien vers le projet ou le dépôt) pour compenser l'absence d'expérience professionnelle en développement.
- Ajouter les mois aux dates du parcours pour éviter toute ambiguïté sur la période entre la fin du poste de chef boulanger (2024) et le début du bootcamp (2025).
- Compléter la liste des compétences techniques avec les outils effectivement maîtrisés (Git, HTML, CSS, etc.) pour améliorer la visibilité dans les outils de tri automatique.

Conseils suisses : En Suisse, un certificat de bootcamp est moins connu qu'un CFC ou un diplôme HES : préciser le nom complet et la durée de la formation aide le recruteur à en évaluer le sérieux. Pour une reconversion, joindre un portfolio en ligne ou un lien GitHub est fortement recommandé. Les certificats de travail des anciens employeurs sont attendus et peuvent être mentionnés avec la formule « Références et certificats de travail disponibles sur demande ». Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : développeur web, full-stack, React, Node.js, Python, SQLite, bootcamp, certificat de développeur web, CFC, site de réservation, application de gestion de stock

Pré-tri : défauts ✔ Aucune accroche expliquant la reconversion · ✘ Compétences transférables non mises en valeur | qualités ✔ Projets concrets en ligne

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv06 — Interruption de carrière de 4 ans non expliquée

**Exécution 1** — score 61 (fourchette indicative 40-70) · ATS 63 · 22 s

Points forts :
- Gestion opérationnelle de plusieurs clients en simultané, ce qui démontre une capacité à gérer des priorités multiples (« Gestion des réseaux sociaux de 3 clients »)
- La newsletter mentionnée avec un volume d'abonnés donne une mesure concrète de la portée du travail accompli (« newsletter mensuelle (4 000 abonnés) »)
- L'expérience en organisation d'événements à un rythme soutenu illustre une compétence logistique et relationnelle (« Organisation de 15 événements par an »)

Améliorations :
- Une période sans activité apparente s'étend de juin 2019 à mars 2023 (près de 4 ans) : il est fortement conseillé d'indiquer ce qui s'est passé durant cette période (formation, activité indépendante, congé, autre poste), sans quoi tout recruteur s'interrogera immédiatement.
- Le poste 'Assistante de communication, Fictif SA, Lausanne (2012-2014)' est entièrement vide : ajouter au moins une ou deux tâches représentatives pour éviter qu'il paraisse suspect ou inutile.
- Aucun outil ou logiciel métier n'est mentionné (par exemple outils de planification de réseaux sociaux, CRM, outils de création graphique ou d'emailing) : en ajouter renforcerait la lisibilité du profil pour les recruteurs et les logiciels de tri automatique.

Conseils suisses : En Suisse romande, un CV tient généralement sur une à deux pages maximum avec un style sobre et factuel. Le taux d'activité (60 %) est déjà indiqué, ce qui est une bonne pratique appréciée des employeurs suisses. Les certificats de travail (Arbeitszeugnisse) sont très importants en Suisse : mentionner leur disponibilité en fin de CV est un usage courant. Un profil LinkedIn à jour peut compléter utilement ce CV. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : assistante marketing, communication, réseaux sociaux, newsletter, événements, chargée de communication, Bachelor en communication, français, anglais, allemand

Pré-tri : défauts ✔ Période 06.2019 - 03.2023 sans explication | qualités ✔ Chiffres concrets (4 000 abonnés, 15 événements)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 2019, 2023

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 61 (fourchette indicative 40-70) · ATS 63 · 21 s
- 1re amélioration : Une période sans activité apparaît entre juin 2019 et mars 2023 (près de 4 ans) : sans en supposer la cause, il est conseillé d'indiquer une ligne explicative (formation, activité indépendante, congé, etc.) pour éviter que le CV soit écarté sans entretien.

**Exécution 3** — score 61 (fourchette indicative 40-70) · ATS 63 · 19 s
- 1re amélioration : Une période sans activité apparente s'étend de juin 2019 à mars 2023 (près de 4 ans) : indiquer une activité, une formation ou toute autre mention factuelle pour cette période afin d'éviter qu'un recruteur n'écarte le CV sans lire plus loin.

### cv07 — CV très court

**Exécution 1** — score 36 (fourchette indicative 10-45) · ATS 35 · 19 s

Points forts :
- Stabilité professionnelle : un poste de magasinier tenu depuis 2019 chez le même employeur, ce qui rassure un recruteur sur la fiabilité du candidat (« magasinier depuis 2019 chez Exemple SA »)
- Permis de conduire B mentionné, atout concret pour des postes en logistique ou en livraison (« Permis de conduire B »)
- Bilinguisme français-portugais, utile dans des environnements de travail multiculturels (« Langues : français, portugais »)

Améliorations :
- Ajouter un numéro de téléphone et une localité : sans ces éléments, un recruteur ne peut pas vous contacter rapidement et le CV risque d'être écarté.
- Décrire les tâches concrètes du poste de magasinier chez Exemple SA (réception, stockage, préparation de commandes, outils utilisés, etc.) : sans cela, le recruteur ne peut pas évaluer votre expérience.
- Détailler les 'divers emplois' antérieurs avec au minimum un intitulé de poste et une période pour chacun, afin d'éviter une zone d'ombre sur plusieurs années de parcours.
- Préciser le niveau de chaque langue (par exemple 'langue maternelle' ou niveau CECR) pour que le recruteur puisse évaluer vos compétences linguistiques réelles.
- Structurer le CV en rubriques distinctes (Expérience professionnelle, Formation, Compétences, Langues) pour faciliter la lecture et le traitement par les logiciels de tri.

Conseils suisses : En Suisse, un CV tient généralement sur une à deux pages avec des rubriques claires et un ordre antichronologique. Joindre les certificats de travail (Arbeitszeugnisse) est une pratique courante et souvent attendue dès la candidature ; vous pouvez indiquer : « Références et certificats de travail disponibles sur demande ». L'adresse e-mail utilisée est au format exemple invalide : vérifiez qu'elle est fonctionnelle avant d'envoyer vos candidatures. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : magasinier, permis de conduire B, français, portugais

Pré-tri : défauts ✔ CV très incomplet (pas de détails, pas de téléphone, pas de lieu) · ✔ « Divers emplois » sans précision

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv08 — Mal structuré — ordre et rubriques mélangés

**Exécution 1** — score 38 (fourchette indicative 30-60) · ATS 43 · 25 s

Points forts :
- Expérience en facturation médicale avec un outil spécialisé, ce qui est un atout concret pour les cabinets médicaux ou cliniques (« facturation TARMED »)
- Le poste actuel inclut la gestion des plaintes clients, compétence valorisée dans les métiers d'accueil et de service (« gestion des plaintes clients »)

Améliorations :
- Restructurer le CV en rubriques claires et en ordre antichronologique strict (expériences, puis formation) : actuellement la formation est insérée entre deux postes et les expériences ne sont pas dans l'ordre, ce qui désorganise la lecture.
- Reformuler les tâches de chaque poste en phrases nominales professionnelles et supprimer les tournures orales ('je faisais l'accueil et le courrier', 'anglais un peu') qui nuisent à la crédibilité du document.
- Remplacer l'adresse e-mail par une adresse à l'aspect professionnel (prénom.nom@domaine.ch ou similaire) pour éviter d'être écarté dès la première lecture.
- Enrichir les descriptions de poste avec des éléments de contexte ou de portée (type d'établissement, volume d'activité si connu) pour donner du poids aux expériences, notamment pour le poste à l'Hôtel Exemple.

Conseils suisses : En Suisse, un CV tient généralement sur une à deux pages avec des rubriques bien séparées et un ordre antichronologique strict. La mention 'Références et certificats de travail disponibles sur demande' est l'usage standard. Le CFC est un titre reconnu : il mérite d'être mis en valeur avec son intitulé complet. Pour un poste en région neuchâteloise, indiquer un niveau d'allemand, même modeste, peut faire la différence. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : réceptionniste, assistante administrative, secrétaire, accueil, réservations, gestion des plaintes clients, facturation TARMED, agenda des médecins, Excel, Word, CFC employée de bureau

Pré-tri : défauts ✔ Pas de rubriques claires, chronologie dans le désordre · ✔ « anglais un peu » | qualités ✔ Compétence métier spécifique (facturation TARMED)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv09 — PDF à deux colonnes — texte extrait mélangé

**Exécution 1** — score 68 (fourchette indicative 35-70) · ATS 68 · 22 s

Points forts :
- Certification PMP obtenue, qui est une référence reconnue en gestion de projet et renforce la crédibilité du profil face aux recruteurs IT (« PMP (2019) »)

Améliorations :
- Vérifier et corriger l'adresse e-mail : elle se termine en .invalid et ne permet pas de contacter le candidat, ce qui est le premier obstacle à un entretien.
- Ajouter au moins un résultat concret pour chaque expérience : pour le poste d'analyste métier, indiquer par exemple ce que le recueil des besoins a produit (livraison, délai, satisfaction) ; pour le poste actuel, préciser si la migration a été livrée dans les délais ou le budget.
- Corriger la structure du document source pour éviter le mélange des colonnes à l'extraction : les logiciels de tri (ATS) lisent le texte linéairement et peuvent mal interpréter un CV en colonnes, ce qui risque de faire écarter le profil avant toute lecture humaine.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont des documents clés attendus par les recruteurs ; mentionner leur disponibilité en fin de CV est un usage courant. Le secteur bancaire romand valorise fortement la maîtrise de l'allemand, déjà présente ici. Un CV d'une page est la norme pour un profil expérimenté en Suisse. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Chef de projet IT, Gestion de projet, Prince2, Scrum, PMP, Jira, Confluence, Core banking, Analyste métier, Migration, Banque, Master HEC

Pré-tri : défauts ✔ Mise en page en deux colonnes mal lue par les logiciels de tri | qualités ✘ Projet chiffré (8 MCHF, 40 personnes) · ✔ Certification PMP

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv10 — Administratif — fautes d'orthographe

**Exécution 1** — score 54 (fourchette indicative 40-70) · ATS 63 · 22 s

Points forts :
- Stabilité et progression dans l'assistanat de direction, rassurante pour un recruteur cherchant un profil fiable (« 2019 - aujourd'hui Assistante de direction, Fondation Fictive, Genève »)
- Expérience en environnement juridique, un atout différenciant pour des postes exigeant rigueur et confidentialité (« Secrétaire, Étude d'avocats Exemple, Genève »)
- Maîtrise d'Abacus, logiciel très répandu en Suisse, qui renforce la crédibilité du profil sur le marché local (« Abacus »)

Améliorations :
- Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : « PROFESSIONELLE », « Organistion », « procès-verbals », « générale », « par ans », « Microsft Ofice » — ces erreurs peuvent entraîner un rejet immédiat du CV.
- Enrichir les descriptions de poste avec la portée des tâches : préciser par exemple le nombre de membres du conseil de fondation, le volume de courriers traités ou tout autre élément concret déjà connu, afin de dépasser la simple liste de tâches.
- Vérifier la cohérence chronologique de la formation : le diplôme d'assistante de direction (2017) est obtenu après le début du poste de secrétaire (2014), ce qui mérite d'être mis en valeur explicitement comme formation continue.

Conseils suisses : En Suisse, un CV sans fautes est un critère éliminatoire strict, particulièrement dans les secteurs juridique et institutionnel. La mention « Références et certificats de travail disponibles sur demande » est attendue en fin de CV. Pour Genève, indiquer un niveau de français écrit irréprochable est implicitement attendu pour un poste d'assistante de direction. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : assistante de direction, secrétaire, gestion de l'agenda, conseil de fondation, courriers juridiques, gestion des délais, diplôme d'assistante de direction, Word, Excel, PowerPoint, Abacus, anglais B2

Pré-tri : défauts ✔ Fautes d'orthographe (professionelle, organistion, procès-verbals, Microsft Ofice) | qualités ✔ Diplôme d'assistante de direction
Mots-clés absents du texte du CV : anglais B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 54 (fourchette indicative 40-70) · ATS 63 · 23 s
- 1re amélioration : Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : 'professionelle', 'Organistion', 'procès-verbals', 'par ans', 'générale' (accord avec 'directeur'), 'Microsft Ofice' — ces erreurs peuvent entraîner un rejet immédiat.

**Exécution 3** — score 50 (fourchette indicative 40-70) · ATS 58 · 21 s
- 1re amélioration : Corriger toutes les fautes d'orthographe et de frappe qui nuisent à la crédibilité : « PROFESSIONELLE », « Organistion », « procès-verbals », « directeur générale », « 6 par ans », « Microsft Ofice ».

### cv11 — Commercial — résultats chiffrés, aucune langue

**Exécution 1** — score 68 (fourchette indicative 55-85) · ATS 75 · 21 s

Points forts :
- Résultat commercial quantifié qui démontre une progression réelle du portefeuille (« Chiffre d'affaires du secteur passé de 6,2 à 7,3 MCHF (+18 %) »)
- Expérience sur un portefeuille large et diversifié, crédible pour un recruteur du secteur médical (« Portefeuille de 45 cliniques et hôpitaux au Tessin et en Suisse alémanique »)
- Reconnaissance par les pairs attestée dans le poste précédent (« Meilleur vendeur régional 2018 »)
- Brevet fédéral de spécialiste de vente, diplôme reconnu sur le marché suisse (« Brevet fédéral de spécialiste de vente »)

Améliorations :
- Ajouter une rubrique Langues avec les niveaux (par exemple CECR ou « langue maternelle ») : l'absence totale de cette information est rédhibitoire pour un poste couvrant le Tessin et la Suisse alémanique.
- Développer la liste des compétences en illustrant chaque élément par un contexte tiré des expériences : « appels d'offres publics » et « négociation » apparaissent sans lien explicite avec les postes décrits.
- Préciser l'intitulé du poste chez Exemple Médical Sàrl : « Représentant » seul est vague ; ajouter le domaine (médical, par exemple) renforcerait la cohérence du parcours.

Conseils suisses : En Suisse, les recruteurs attendent systématiquement les certificats de travail (Arbeitszeugnis) pour chaque poste ; indiquer « Références et certificats de travail disponibles sur demande » est l'usage courant. Le brevet fédéral est un titre valorisé et reconnu nationalement : il peut être mis en avant dans l'accroche. Pour les appels d'offres publics cantonaux, mentionner explicitement les cantons concernés renforce la crédibilité du profil. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Key Account Manager, distribution de matériel médical, Salesforce, négociation, appels d'offres publics, contrats cadres, prospection, Brevet fédéral de spécialiste de vente, CFC de laborantin, B2B, cliniques, hôpitaux

Pré-tri : défauts ✔ Aucune rubrique langues (alors qu'il travaille au Tessin et en Suisse alémanique) | qualités ✔ Résultats chiffrés (+18 %, 45 clients)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv12 — Vente terrain — coordonnées manquantes

**Exécution 1** — score 54 (fourchette indicative 35-65) · ATS 55 · 18 s

Points forts :
- Responsabilité de formation, qui démontre une capacité d'encadrement valorisée par les recruteurs (« Formation de 2 apprenties »)
- Bilinguisme français-allemand adapté au marché bilingue de Bienne, atout direct pour le conseil clientèle (« Français (langue maternelle), allemand (B1) »)
- Poste actuel de longue durée avec responsabilités élargies, signe de fiabilité et d'évolution interne (« Responsable de la vitrine »)

Améliorations :
- Coordonnées absentes : ajouter impérativement un numéro de téléphone, une adresse e-mail professionnelle et une localité, sans quoi le CV ne peut pas générer de contact.
- Les tâches listées n'indiquent aucune portée ni résultat : préciser, par exemple, le type de clientèle, le volume de ventes ou l'impact de la vitrine pour donner du poids aux expériences.
- Aucun outil métier n'est mentionné : si des logiciels de caisse, de gestion de stock ou d'autres outils ont été utilisés, les ajouter pour améliorer la visibilité auprès des systèmes de tri automatique.

Conseils suisses : En Suisse, un certificat de travail (Arbeitszeugnis) est attendu pour chaque poste ; mentionner leur disponibilité rassure les recruteurs. Pour Bienne, le bilinguisme français-allemand est un atout concret à mettre en avant dès l'accroche. L'AFP est un titre reconnu en Suisse : son intitulé complet peut être conservé tel quel. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : vendeuse, commerce de détail, conseil clientèle, encaissement, vitrine, français, allemand, arabe

Pré-tri : défauts ✔ Ni téléphone, ni e-mail, ni localité | qualités ✔ Forme des apprenties

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv13 — Soins — infirmière frontalière, diplôme français

**Exécution 1** — score 59 (fourchette indicative 45-75) · ATS 63 · 24 s

Points forts :
- Un chiffre concret illustre la charge de travail en médecine interne, ce qui donne immédiatement une idée du niveau d'autonomie et de la capacité à gérer plusieurs patients simultanément (« Prise en charge de 12 patients par poste »)
- L'encadrement d'étudiants infirmiers démontre une reconnaissance professionnelle et une capacité à transmettre les savoirs, qualité appréciée dans les établissements suisses (« Encadrement des étudiants infirmiers »)
- Le Diplôme d'État d'infirmier constitue la base réglementaire du métier et atteste d'une formation complète reconnue en France (« Diplôme d'État d'infirmier, IFSI fictif, Lyon »)

Améliorations :
- Le diplôme d'infirmière a été obtenu en France et le CV ne mentionne aucune reconnaissance suisse : il est prioritaire d'indiquer si la reconnaissance par la Croix-Rouge suisse (CRS) a été obtenue ou est en cours, car sans cette mention, un recruteur suisse ne peut pas savoir si la candidate est autorisée à exercer en Suisse.
- La résidence est en France et aucun permis de travail suisse n'est mentionné : ajouter une ligne indiquant le statut (par exemple frontalier G) est indispensable pour ne pas être écarté d'emblée.
- Le poste en EHPAD (2017-2020) ne contient aucune description : ajouter au moins une ou deux tâches ou responsabilités concrètes pour que ce poste ne soit pas perçu comme un blanc.
- L'allemand n'est pas mentionné alors que la région suisse frontalière avec Annemasse est majoritairement germanophone ou bilingue selon le canton visé : indiquer le niveau d'allemand, même débutant, ou son absence, clarifie la situation pour le recruteur.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont des documents clés : mentionner qu'ils sont disponibles sur demande est un usage courant. Les établissements de santé suisses attendent généralement que le diplôme étranger soit reconnu par la Croix-Rouge suisse avant l'embauche. Le statut de frontalier (permis G) doit être explicitement indiqué sur un CV envoyé depuis France. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : infirmière diplômée d'État, médecine interne, EHPAD, encadrement des étudiants infirmiers, Diplôme d'État d'infirmier, français, anglais

Pré-tri : défauts ✔ Reconnaissance du diplôme français (CRS / Croix-Rouge suisse) non mentionnée · ✔ Statut de travail en Suisse (permis G) non indiqué | qualités ✔ Encadrement d'étudiants, 12 patients par poste

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv14 — Multilingue FR/DE/EN — langues bien renseignées

**Exécution 1** — score 90 (fourchette indicative 60-90) · ATS 95 · 21 s

Points forts :
- Résultat chiffré sur la qualité de service : l'amélioration du taux de résolution au premier appel démontre un impact direct et mesurable, très valorisé par les recruteurs (« Taux de résolution au premier appel passé de 68 % à 81 % »)
- Direction d'équipe bilingue : encadrer 18 conseillers en deux langues atteste d'une capacité managériale concrète dans un contexte multilingue suisse (« Direction d'une équipe de 18 conseillers (FR/DE) »)
- Trilinguisme documenté avec niveaux CECR : un atout différenciant sur le marché suisse, en particulier pour un poste basé à Berne (« Allemand (langue maternelle), français (C1), anglais (B2) »)
- Outils CRM de référence explicitement mentionnés : leur présence facilite le passage des filtres automatiques des systèmes de tri de CV (« Salesforce Service Cloud, Zendesk, MS Office »)

Améliorations :
- Le poste chez Exemple Services AG (2017-2021) ne contient aucun résultat chiffré ni indicateur de portée : ajouter au moins un élément mesurable (volume de réclamations traitées, taux de satisfaction, etc.) pour équilibrer les deux expériences.
- Les mois de début et de fin ne sont indiqués pour aucun poste ni diplôme : préciser au moins les mois pour le poste actuel et le brevet fédéral de 2020 renforcerait la lisibilité du parcours.

Conseils suisses : En Suisse, le brevet fédéral est un titre reconnu nationalement : il peut être mentionné avec sa désignation officielle complète pour maximiser son impact. Les certificats de travail (Arbeitszeugnisse) sont attendus dès le premier entretien ; indiquer qu'ils sont disponibles sur demande est un usage courant. Pour un poste à Berne, la maîtrise du français C1 est un avantage concret à mettre en avant dans la lettre de motivation. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Responsable service clientèle, Telecom, Salesforce Service Cloud, Zendesk, MS Office, Brevet fédéral, Management de la clientèle, Allemand, Français, Anglais, Réclamations, Chat client, Taux de résolution

Pré-tri : défauts ✔ Pas de mention des certificats de travail / références | qualités ✔ Langues avec niveaux CECR · ✔ Résultat chiffré (68 % → 81 %)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 96 (fourchette indicative 60-90) · ATS 95 · 21 s
- 1re amélioration : Ajouter les mois aux dates de toutes les expériences et formations (ex. : janvier 2021 – aujourd'hui) pour répondre aux attentes des recruteurs suisses et des logiciels de tri ATS.

**Exécution 3** — score 96 (fourchette indicative 60-90) · ATS 95 · 21 s
- 1re amélioration : Ajouter les mois aux dates de toutes les expériences et formations (ex. : « janvier 2021 – aujourd'hui ») pour lever toute ambiguïté auprès des recruteurs et des logiciels de tri ATS.

### cv15 — Frontalier avec permis G — allemand absent

**Exécution 1** — score 65 (fourchette indicative 45-75) · ATS 63 · 22 s

Points forts :
- Un résultat chiffré et daté au poste actuel, directement parlant pour un recruteur en industrie (« Réduction des arrêts non planifiés de 22 % en 2023 »)
- Une habilitation électrique spécifique mentionnée, qui atteste d'une compétence réglementée valorisée en maintenance industrielle (« Habilitation électrique BR »)
- Le permis G est indiqué, ce qui lève immédiatement la question du statut frontalier pour un recruteur bâlois (« Permis G »)
- La portée opérationnelle du poste actuel est précisée, ce qui situe concrètement le niveau de responsabilité (« Maintenance préventive de 30 lignes de production »)

Améliorations :
- L'allemand est absent du CV alors que Bâle est une région germanophone : si vous avez un niveau en allemand, même limité, indiquez-le avec son niveau CECR ; son absence peut conduire à un rejet immédiat.
- Le poste 'Électromécanicien, Usine Fictive, Mulhouse (2014–2019)' ne contient aucune tâche ni résultat : ajoutez au moins une ligne décrivant les activités principales pour éviter qu'un recruteur perçoive ce poste comme un blanc.
- Aucun outil ou logiciel métier n'est mentionné (par exemple GMAO, automates, marques d'équipements) : si vous en utilisez, citez-les explicitement pour améliorer la détection par les logiciels de tri et la pertinence aux yeux du recruteur.

Conseils suisses : En Suisse, les employeurs attendent généralement un certificat de travail (Arbeitszeugnis) pour chaque poste ; mentionnez en bas de CV : « Références et certificats de travail disponibles sur demande ». Le CV suisse est habituellement limité à une ou deux pages. Pour un poste en région bâloise, une candidature en allemand ou au moins un CV traduit en allemand est souvent attendu. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : technicien de maintenance, maintenance préventive, électromécanicien, habilitation électrique BR, lignes de production, BTS Maintenance des systèmes, permis G

Pré-tri : défauts ✔ Travaille à Bâle mais aucune mention de l'allemand | qualités ✔ Permis G indiqué · ✔ Résultat chiffré (−22 % d'arrêts)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv16 — Permis B — ingénieure civile, tâches vagues

**Exécution 1** — score 65 (fourchette indicative 45-75) · ATS 78 · 22 s

Points forts :
- Poste actuel en Suisse dans le domaine cible, ce qui rassure immédiatement un recruteur suisse sur l'intégration professionnelle locale (« Ingénieure civile, Bureau d'ingénieurs Démo SA, Sion »)
- Maîtrise de la norme SIA, référence incontournable pour tout bureau d'ingénieurs suisse (« SIA Norm »)
- Diplôme reconnu mentionné explicitement, ce qui lève un doute fréquent pour un titre étranger (« reconnu par le Swiss Engineering STV fictif »)
- Permis B indiqué, information utile pour les recruteurs suisses qui vérifient systématiquement le droit au travail (« Permis B »)

Améliorations :
- Enrichir les bullets de chaque poste avec la portée des missions : type d'ouvrages traités, taille des projets ou toute information concrète présente dans le CV, afin de dépasser la simple liste de tâches qui ne permet pas à un recruteur d'évaluer le niveau de responsabilité réel.
- Préciser le niveau d'allemand (A2) dans le contexte suisse : en Valais, la frontière linguistique est proche et certains employeurs attendent une capacité minimale en allemand ; si ce niveau est en cours de progression, l'indiquer (ex. « en cours ») valorise la démarche.
- Ajouter les mois aux dates d'emploi pour éviter toute ambiguïté sur la durée réelle des postes, notamment pour le poste au Portugal (2018–2022).

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis/certificat de travail) sont des documents clés : mentionner « Références et certificats de travail disponibles sur demande » en fin de CV est un usage courant. Le marché suisse du génie civil valorise la connaissance des normes SIA, déjà présente ici. Un CV d'une page est la norme pour un profil de ce niveau d'expérience. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : ingénieure civile, génie civil, responsable de projets, suivi de chantiers, calculs de structures, conception d'ouvrages, AutoCAD, Revit, SIA Norm, Cubus, Master en génie civil, coordination

Pré-tri : défauts ✔ « Responsable de projets » sans taille, budget ni type d'ouvrage | qualités ✔ Permis B indiqué · ✔ Connaissance des normes SIA

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv17 — Avec photo — profil générique (photo déclarée)

**Exécution 1** — score 80 (fourchette indicative 45-75) · ATS 78 · 22 s

Points forts :
- Volumes de recrutement chiffrés qui rassurent immédiatement un recruteur sur le niveau d'activité réel du poste (« Recrutement de 40 à 60 collaborateurs par an »)
- Le brevet fédéral de spécialiste RH est le titre de référence sur le marché suisse pour ce métier, ce qui renforce la crédibilité du profil (« Brevet fédéral de spécialiste RH »)
- La gestion des salaires pour un effectif précis démontre une responsabilité administrative concrète (« Gestion administrative des salaires (250 collaborateurs) »)
- La maîtrise de trois langues avec des niveaux explicites est un atout direct pour le marché suisse romand (« Français (langue maternelle), anglais (B2), allemand (B1) »)

Améliorations :
- Le poste d'Assistante RH (2016-2020) est entièrement vide : ajouter au moins deux tâches ou responsabilités concrètes exercées chez Exemple Retail SA pour que ce poste ne soulève pas de questions.
- L'accroche se limite à des qualificatifs génériques sans lien avec le métier RH : la remplacer par deux phrases qui précisent la spécialité, le secteur ou la valeur ajoutée apportée, en s'appuyant sur les éléments déjà présents dans le CV.
- Les outils utilisés (logiciel de paie, ATS, SIRH) ne sont pas mentionnés : les ajouter si pertinents, car ils figurent souvent dans les critères de tri des offres RH.

Conseils suisses : En Suisse romande, le brevet fédéral est bien reconnu : il peut figurer en tête de la rubrique Formation. Les certificats de travail (Arbeitszeugnis) sont attendus à chaque étape du recrutement ; la mention « Références et certificats de travail disponibles sur demande » est l'usage courant. Un CV d'une page est la norme pour un profil de ce niveau. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Spécialiste RH, recrutement, gestion administrative des salaires, processus d'intégration, brevet fédéral de spécialiste RH, Bachelor en psychologie, Assistante RH, français, anglais, allemand

Pré-tri : défauts ✔ Profil générique (« dynamique, motivée, polyvalente ») | qualités ✔ Chiffres concrets (40-60 recrutements, 250 salaires)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 78 (fourchette indicative 45-75) · ATS 78 · 23 s
- 1re amélioration : Le poste chez Exemple Retail SA (2016-2020) est entièrement vide : ajouter au moins deux tâches ou résultats concrets pour éviter qu'un recruteur ou un logiciel de tri l'ignore.

**Exécution 3** — score 74 (fourchette indicative 45-75) · ATS 70 · 22 s
- 1re amélioration : Le poste d'Assistante RH chez Exemple Retail SA (2016-2020) est entièrement vide : ajouter au moins deux tâches ou responsabilités concrètes pour que ce poste ne soulève pas de questions chez le recruteur.

### cv18 — Sans photo — dates sans mois

**Exécution 1** — score 70 (fourchette indicative 50-80) · ATS 73 · 21 s

Points forts :
- Le brevet fédéral de spécialiste en finance et comptabilité est un diplôme reconnu et recherché sur le marché suisse, qui crédibilise directement la candidature (« Brevet fédéral de spécialiste en finance et comptabilité »)
- La maîtrise d'Abacus, logiciel de référence en Suisse, est un atout concret pour les recruteurs suisses (« Abacus, SAP FI, Excel avancé »)
- La gestion simultanée de plusieurs entités démontre une capacité à gérer une charge de travail complexe (« Tenue de la comptabilité de 3 sociétés du groupe »)
- Le niveau d'allemand B2 est un avantage significatif pour un poste basé à Neuchâtel, région bilingue (« allemand (B2) »)

Améliorations :
- Le poste d'aide-comptable chez Fiduciaire Exemple est entièrement vide : ajouter au moins une ou deux tâches principales exercées pour que ce poste contribue au dossier.
- Les tâches chez Horlogerie Fictive SA sont listées sans portée ni résultat : enrichir chaque point avec un élément de contexte ou d'impact (volume traité, périmètre, fréquence) pour dépasser la simple liste de tâches.

Conseils suisses : En Suisse, il est d'usage d'ajouter en fin de CV la mention « Références et certificats de travail disponibles sur demande ». Le brevet fédéral est un titre protégé en Suisse : il peut être mis en avant explicitement dans l'intitulé ou l'accroche du CV. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Comptable, Aide-comptable, Brevet fédéral de spécialiste en finance et comptabilité, CFC d'employé de commerce, Bouclements, TVA, Abacus, SAP FI, Excel avancé, Fiduciaire, Horlogerie

Pré-tri : défauts ✘ Dates sans mois ; poste terminé en 2025 sans indication de la suite | qualités ✔ Brevet fédéral

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv19 — Senior 58 ans — début de carrière trop détaillé

**Exécution 1** — score 84 (fourchette indicative 50-80) · ATS 85 · 25 s

Points forts :
- Direction multi-sites à grande échelle : gérer 3 sites et 140 collaborateurs est un signal fort de capacité managériale pour tout recruteur cherchant un directeur de production (« Direction de 3 sites, 140 collaborateurs »)
- Résultat chiffré crédible : une hausse de productivité documentée sur une période précise renforce la crédibilité du candidat face aux recruteurs exigeants (« Productivité augmentée de 15 % entre 2018 et 2023 »)
- Certification IFS obtenue et maintenue : dans l'agroalimentaire suisse, la maîtrise de ce référentiel qualité est un critère de sélection fréquent (« Certification IFS obtenue en 2014 et maintenue depuis »)
- Diplôme fédéral de maître technologue : titre reconnu en Suisse qui atteste d'une expertise métier validée par un examen fédéral (« Diplôme fédéral de maître technologue »)

Améliorations :
- Les postes de chef d'équipe (1990–1998) et d'ouvrier de production (1986–1990) ne contiennent que des tâches sans portée ni résultat : ajouter au moins un élément de volume ou d'impact (taille de l'équipe, volume traité, amélioration obtenue) pour chacun, ou regrouper ces deux postes en une entrée synthétique si l'espace est limité.
- Le poste de responsable de production chez Fromagerie Fictive SA (1998–2010) mentionne 45 collaborateurs mais aucun résultat ni réalisation sur 12 ans : ajouter au moins un résultat concret ou une responsabilité distinctive pour valoriser cette période clé.
- Aucun mot-clé opérationnel du secteur (par exemple HACCP, gestion de la qualité, amélioration continue, planification de production) n'apparaît dans le CV : si le candidat maîtrise ces domaines, les mentionner explicitement augmente la visibilité dans les systèmes de tri automatique.

Conseils suisses : En Suisse, un CV de cadre dirigeant dépasse rarement deux pages ; ce document est bien calibré. Les certificats de travail (Arbeitszeugnisse) sont attendus dès le premier entretien : préparez-les pour chaque poste. Pour un poste en région bilingue, préciser le niveau d'allemand B2 est un atout à mettre en avant lors des entretiens. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Directeur de production, Responsable de production, Chef d'équipe, Agroalimentaire, Industrie laitière, IFS, Certification IFS, Diplôme fédéral de maître technologue, Productivité, Allemand B2, Payerne

Pré-tri : défauts ✔ Postes de 1984-1998 trop détaillés par rapport à l'expérience récente | qualités ✔ Résultats (IFS, +15 %, 140 collaborateurs)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 12
Mots-clés absents du texte du CV : Allemand B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv20 — Étudiant master — adresse e-mail non professionnelle

**Exécution 1** — score 63 (fourchette indicative 40-70) · ATS 65 · 21 s

Points forts :
- Un poste d'assistant juridique en cours, directement lié au master, qui montre une pratique professionnelle parallèle aux études (« Assistant juridique (20 %), Étude Exemple & Associés, Genève »)
- Une expérience en milieu bancaire qui renforce la crédibilité pour des postes en droit des affaires ou en compliance (« Stagiaire, Service juridique, Banque Démo SA, Genève »)
- La participation à un moot court avec un résultat concret (demi-finaliste) démontre des compétences en argumentation juridique (« moot court 2025 (demi-finaliste) »)

Améliorations :
- L'adresse e-mail 'lebogossdu74@example.invalid' n'est pas professionnelle et risque de faire écarter le CV immédiatement : la remplacer par une adresse au format prénom.nom.
- Le stage à la Banque Démo SA ne contient aucune description : ajouter au moins deux tâches concrètes effectuées pour que ce poste ait du poids aux yeux d'un recruteur.
- Les tâches de l'assistant juridique manquent de portée : préciser, par exemple, le type de contrats traités ou la nature des notes rédigées, sans inventer de chiffres.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) sont très attendus par les recruteurs : mentionner qu'ils sont disponibles sur demande est un usage courant. Pour un poste en droit des affaires à Genève, un niveau d'allemand B1 est un atout à valoriser explicitement, car il ouvre l'accès aux mandats avec des contreparties alémaniques. Le moot court est bien perçu dans les études d'avocats suisses : il peut figurer dans une rubrique dédiée aux activités juridiques plutôt que dans « Divers ». Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : droit des affaires, droit des contrats, assistant juridique, recherches juridiques, service juridique, master en droit, bachelor en droit, moot court, anglais C1, allemand B1

Pré-tri : défauts ✔ Adresse e-mail non professionnelle | qualités ✔ Parcours universitaire cohérent + emploi à temps partiel
Mots-clés absents du texte du CV : anglais C1, allemand B1

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non
