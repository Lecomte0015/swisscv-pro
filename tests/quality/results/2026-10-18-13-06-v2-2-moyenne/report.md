# Mesure de la qualité de l'analyse — v2-2-moyenne

CV **synthétiques** uniquement (voir `tests/quality/cv-set.mjs`). Le pré-tri ci-dessous est automatique (mots-clés) : la note se fait à la main avec `tests/quality/rubric.md`.

Appels IA : 60 · jetons : 195370 · coût estimé : 1.473 USD

## Synthèse automatique (1re exécution de chaque CV)

| Indicateur | Valeur |
|---|---|
| Analyses réussies | 20 / 20 |
| Défauts placés repérés (mots-clés) | 22 / 26 |
| Qualités reconnues (mots-clés) | 23 / 26 |
| CV avec motif d'erreur critique | 0 |
| Score hors fourchette indicative | cv04, cv14, cv17, cv19 |
| hasPhoto conforme à la saisie | 20 / 20 |

## Reproductibilité (même CV, plusieurs exécutions)

| CV | Scores | Écart score | Scores ATS | Écart ATS |
|---|---|---|---|---|
| cv03 | 75 · 76 · 76 | 1 | 74 · 75 · 75 | 1 |
| cv06 | 63 · 65 · 64 | 2 | 64 · 65 · 64 | 1 |
| cv10 | 54 · 52 · 54 | 2 | 63 · 60 · 63 | 3 |
| cv14 | 96 · 92 · 96 | 4 | 95 · 94 · 95 | 1 |
| cv17 | 76 · 79 · 75 | 4 | 70 · 75 · 70 | 5 |

Comparer aussi à la main la **première amélioration** de chaque exécution (détail par CV ci-dessous).

## Détail par CV

### cv01 — Premier emploi — employée de commerce CFC

**Exécution 1** — score 55 (fourchette indicative 40-75) · ATS 69 · 21 s

Points forts :
- Le CFC d'employée de commerce est un diplôme reconnu et directement valorisable sur le marché suisse (« CFC d'employée de commerce, École professionnelle commerciale de Lausanne »)
- L'expérience en fiduciaire apporte une exposition concrète à la comptabilité, domaine recherché pour les postes administratifs (« Aide à la comptabilité »)
- La maîtrise des outils bureautiques standards est explicitement mentionnée, ce qui répond à une exigence fréquente des offres (« Word, Excel, Outlook »)

Améliorations :
- Enrichir les tâches de l'apprentissage avec des éléments de portée ou de contexte (type de documents traités, logiciels comptables utilisés, volume approximatif) pour dépasser la simple liste de tâches.
- Ajouter une courte accroche ou un titre de profil sous le nom pour indiquer clairement le poste visé, ce qui est particulièrement utile pour un premier emploi après CFC.

Conseils suisses : En Suisse, le certificat de travail (Arbeitszeugnis) de la fiduciaire est un document clé : mentionnez que références et certificats de travail sont disponibles sur demande. Les recruteurs romands apprécient un CV d'une page pour un profil junior. Préciser le niveau d'allemand est stratégique en Suisse, où le bilinguisme est souvent un critère de sélection. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : fiduciaire, accueil téléphonique, saisie de factures, classement, aide à la comptabilité, Word, Excel, Outlook, français, allemand, anglais

Pré-tri : défauts ✔ Langues sans niveau (CECR) · ✔ Tâches listées sans volume ni résultat | qualités ✔ CFC obtenu / apprentissage complet

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv02 — Junior IT — développeur 2 ans

**Exécution 1** — score 61 (fourchette indicative 45-75) · ATS 70 · 23 s

Points forts :
- Poste actuel en entreprise dès la fin du bachelor, ce qui montre une insertion rapide sur le marché du travail (« 09.2024 - aujourd'hui Développeur web, Démo Digital Sàrl, Genève »)
- Un lien GitHub est fourni, ce qui permet à un recruteur technique de consulter directement les réalisations du candidat (« github.com/noah-exemple »)
- La formation est cohérente avec le métier visé et récemment achevée (« Bachelor en informatique de gestion, HES fictive de Genève »)

Améliorations :
- Enrichir les descriptions de poste chez Démo Digital Sàrl et Agence Fictive SA : remplacer les tâches génériques ('Développement de fonctionnalités', 'Correction de bugs') par des phrases qui précisent le contexte, la technologie utilisée et l'effet concret de chaque contribution.
- Ancrer les compétences techniques dans les expériences : indiquer, pour chaque poste, quels outils de la liste (React, Node.js, PostgreSQL, Docker, etc.) ont été réellement utilisés, afin que la liste de compétences soit crédible aux yeux d'un recruteur.
- Ajouter une accroche ou un résumé de profil sous le titre 'Développeur web junior' : pour un premier emploi ou une sortie d'études récente, quelques lignes ciblées aident le recruteur à comprendre immédiatement la valeur et l'orientation du candidat.

Conseils suisses : En Suisse, les recruteurs s'attendent à des descriptions de poste concrètes et vérifiables, souvent complétées par des certificats de travail (Arbeitszeugnis) : mentionner 'Références et certificats de travail disponibles sur demande' est un usage courant. Le marché genevois étant bilingue, le niveau d'anglais B2 est un atout à valoriser explicitement dans l'accroche. Un CV d'une page est la norme pour un profil junior en Suisse romande. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Développeur web, JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, GraphQL, CI/CD, Agile, Bachelor en informatique de gestion

Pré-tri : défauts ✔ Liste de 22 technologies sans contexte ni niveau · ✔ Tâches vagues (« développement de fonctionnalités ») | qualités ✔ Bachelor HES · ✔ Lien GitHub

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv03 — Expérimenté logistique — dates qui se chevauchent

**Exécution 1** — score 75 (fourchette indicative 45-75) · ATS 74 · 24 s

Points forts :
- Résultat chiffré démontrant un impact direct sur la qualité opérationnelle, très valorisé par les recruteurs en logistique (« Réduction des erreurs de préparation de 4 % à 1,5 % en 18 mois »)
- L'encadrement d'une équipe de 12 personnes positionne le candidat clairement comme profil de management intermédiaire (« Encadrement d'une équipe de 12 magasiniers »)
- La maîtrise de SAP est un outil explicitement mentionné et recherché dans les offres logistiques en Suisse (« Gestion des stocks sur SAP »)

Améliorations :
- Chevauchement de dates entre le poste chez Transports Exemple Sàrl (2017-2021) et celui chez Distribution Démo SA (2015-2019) : ces deux postes se recoupent sur 2017-2019, ce qui interpellera immédiatement un recruteur. Vérifier et corriger les dates pour qu'elles soient cohérentes.
- Les postes de Magasinier (2015-2019) et d'Aide-magasinier (2010-2015) ne contiennent aucun résultat ni portée : ajouter au moins un élément concret (volume traité, responsabilité spécifique) pour chacun afin de renforcer la progression du parcours.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnisse) ont autant de poids que le CV lui-même : mentionner qu'ils sont disponibles sur demande est une pratique attendue. Le Valais étant bilingue, le niveau d'allemand B1 est un atout à maintenir visible. Un CV d'une page est la norme pour les profils opérationnels en logistique. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : chef d'équipe entrepôt, magasinier principal, logisticien, CFC de logisticien, SAP, permis cariste R489, préparation de commandes, gestion des stocks, permis C

Pré-tri : défauts ✔ Postes 2015-2019 et 2017-2021 se chevauchent sans explication | qualités ✔ Résultat chiffré (erreurs 4 % → 1,5 %) · ✔ Encadrement de 12 personnes

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 76 (fourchette indicative 45-75) · ATS 75 · 25 s
- 1re amélioration : Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : ces deux postes se recoupent sur 2017-2019, ce qui interpellera immédiatement tout recruteur. Vérifier et corriger les années pour que le parcours soit cohérent.

**Exécution 3** — score 76 (fourchette indicative 45-75) · ATS 75 · 26 s
- 1re amélioration : Chevauchement de dates entre 'Magasinier principal, Transports Exemple Sàrl, Martigny (2017-2021)' et 'Magasinier, Distribution Démo SA, Sion (2015-2019)' : ces deux postes se recoupent sur 2017-2019, ce qui interpellera immédiatement tout recruteur. Vérifier et corriger les dates exactes, ou préciser s'il s'agissait d'un cumul.

### cv04 — Cadre finance — CV très dense de 3 pages (photo déclarée)

**Exécution 1** — score 84 (fourchette indicative 50-80) · ATS 83 · 29 s

Points forts :
- Périmètre CFO de grande envergure clairement documenté, rassurant pour un recruteur sur la capacité à tenir un rôle de direction financière complexe (« CA 450 MCHF, 1 200 collaborateurs »)
- Résultat opérationnel chiffré au poste de directrice du contrôle de gestion, qui démontre une capacité d'amélioration concrète des processus (« réduction du délai de clôture de 12 à 6 jours ouvrables »)
- Diplôme fédéral d'expert-comptable, référence reconnue sur le marché suisse pour les fonctions financières de haut niveau (« Expert-comptable diplômée (diplôme fédéral) »)
- Trilinguisme opérationnel couvrant les trois principales régions linguistiques suisses et les marchés internationaux (« Français (langue maternelle), allemand (C1), anglais (C1) »)

Améliorations :
- Le bloc de texte du poste de CFO (2018 - aujourd'hui) est une phrase unique très longue : le reformuler en points distincts (responsabilités d'un côté, réalisations chiffrées de l'autre) pour permettre une lecture rapide et un repérage immédiat des résultats.
- Les postes de contrôleuse de gestion senior (2006-2011) et d'auditrice (2002-2006) ne contiennent aucun résultat chiffré ni indicateur de portée : ajouter au moins un élément de volume ou d'impact pour chacun afin d'éviter qu'ils paraissent creux face au reste du parcours.
- L'accroche (profil) est rédigée en une seule phrase très longue et générique : la restructurer en deux ou trois phrases courtes mettant en avant les éléments les plus distinctifs du parcours.

Conseils suisses : En Suisse, les recruteurs et les ATS accordent une grande importance à la lisibilité immédiate du CV : privilégier les listes à puces aux blocs de texte, surtout pour un poste de direction. Un certificat de travail (Arbeitszeugnis) est attendu pour chaque poste ; la mention « Références et certificats de travail disponibles sur demande » est l'usage standard. Pour un rôle de CFO à Zurich, l'allemand C1 est un atout décisif à mettre en valeur dès l'accroche. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : CFO, Directrice financière, IFRS, Swiss GAAP RPC, SAP S/4HANA, consolidation, trésorerie, M&A, contrôle de gestion, reporting consolidé, due diligence, Power BI, Expert-comptable diplômée, fiscalité, gestion des risques

Pré-tri : défauts ✔ Paragraphes très longs, CV trop dense | qualités ✔ Résultats chiffrés (clôture 12 → 6 jours, refinancement 120 MCHF) · ✔ Expert-comptable diplômée

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv05 — Reconversion — boulanger devenu développeur web

**Exécution 1** — score 50 (fourchette indicative 40-70) · ATS 63 · 24 s

Points forts :
- Le certificat de développeur web full-stack atteste d'une formation structurée et récente, rassurante pour un recruteur face à une reconversion (« Certificat de développeur web full-stack (bootcamp de 6 mois) »)
- Un projet web déjà en ligne démontre une capacité à livrer un produit fonctionnel, ce qui compense l'absence d'expérience professionnelle en développement (« Site de réservation pour une boulangerie (React, Node.js), en ligne depuis 03.2025 »)
- L'expérience de gestion d'équipe est un atout transférable valorisable dans des environnements de développement collaboratif (« Gestion d'une équipe de 4 personnes »)

Améliorations :
- Enrichir la section Projets avec des détails concrets sur chaque réalisation (fonctionnalités développées, technologies côté serveur ou base de données, lien ou dépôt) pour compenser l'absence d'expérience professionnelle en développement.
- Ajouter les mois aux dates de début et de fin des postes afin de clarifier la période entre la fin du poste de chef boulanger et le début du bootcamp, et éviter qu'un recruteur suppose une interruption longue.
- Compléter la liste des compétences techniques (HTML, CSS, Git, SQLite est déjà présent dans les projets) en les regroupant dans une rubrique dédiée, pour améliorer la lisibilité par les logiciels de tri automatique.

Conseils suisses : En Suisse, un CV de reconversion gagne à inclure une courte accroche personnalisée qui relie l'ancienne expérience au nouveau métier visé. Les certificats de travail (Arbeitszeugnisse) sont très attendus par les employeurs suisses : mentionnez qu'ils sont disponibles sur demande. À Fribourg, le bilinguisme français-allemand est souvent exigé : précisez votre niveau. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : développeur web, full-stack, React, Node.js, Python, SQLite, bootcamp, CFC

Pré-tri : défauts ✔ Aucune accroche expliquant la reconversion · ✘ Compétences transférables non mises en valeur | qualités ✔ Projets concrets en ligne

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv06 — Interruption de carrière de 4 ans non expliquée

**Exécution 1** — score 63 (fourchette indicative 40-70) · ATS 64 · 22 s

Points forts :
- La gestion de comptes clients actifs avec un volume mesurable renforce la crédibilité du poste actuel auprès d'un recruteur (« Gestion des réseaux sociaux de 3 clients »)
- La newsletter avec une audience chiffrée démontre une responsabilité éditoriale concrète et régulière (« Rédaction de la newsletter mensuelle (4 000 abonnés) »)
- L'organisation d'événements à volume régulier illustre une capacité opérationnelle et logistique vérifiable (« Organisation de 15 événements par an »)

Améliorations :
- Une période sans activité apparente s'étend de juin 2019 à mars 2023 (près de 4 ans) : sans en supposer la cause, il est conseillé d'indiquer une ligne explicative (formation, activité indépendante, congé, etc.) pour éviter qu'un recruteur écarte le CV sans lire plus loin.
- Le poste chez Fictif SA (2012-2014) est entièrement vide : ajouter au moins une ou deux tâches représentatives pour que ce poste ne soit pas perçu comme un trou ou une erreur.
- Aucun outil ou logiciel métier n'est mentionné (par exemple outils de planification de réseaux sociaux, plateformes d'emailing, CMS) : les nommer permettrait au CV de passer les filtres automatiques des logiciels de tri.

Conseils suisses : En Suisse romande, les recruteurs attendent souvent un CV d'une à deux pages maximum, sobre et sans fioriture graphique. Le taux d'activité (60 %) est déjà indiqué, ce qui est une bonne pratique locale. Les certificats de travail (Arbeitszeugnisse) sont très importants en Suisse : mentionner qu'ils sont disponibles sur demande est un usage courant et rassurant. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : assistante marketing, chargée de communication, réseaux sociaux, newsletter, communication, événements, médias, Bachelor en communication, français, anglais, allemand

Pré-tri : défauts ✔ Période 06.2019 - 03.2023 sans explication | qualités ✔ Chiffres concrets (4 000 abonnés, 15 événements)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 2019, 2023

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 65 (fourchette indicative 40-70) · ATS 65 · 21 s
- 1re amélioration : Une période sans activité apparente s'étend de juin 2019 à mars 2023 (près de 4 ans) : sans en supposer la cause, il est conseillé d'indiquer une mention neutre (formation, activité indépendante, congé parental, etc.) pour éviter qu'un recruteur écarte le CV sans poser la question.

**Exécution 3** — score 64 (fourchette indicative 40-70) · ATS 64 · 22 s
- 1re amélioration : Le poste 'Assistante de communication, Fictif SA, Lausanne (2012-2014)' ne contient aucune tâche ni réalisation : ajouter au moins deux éléments concrets pour que ce poste ne nuise pas à la crédibilité du CV.

### cv07 — CV très court

**Exécution 1** — score 36 (fourchette indicative 10-45) · ATS 35 · 19 s

Points forts :
- Stabilité professionnelle : un poste de magasinier tenu depuis 2019 rassure un recruteur sur la fiabilité du candidat (« magasinier depuis 2019 chez Exemple SA »)
- Le permis B est un atout concret pour des postes de magasinier impliquant des livraisons ou déplacements (« Permis de conduire B »)
- La maîtrise du français et du portugais peut être utile dans des environnements de travail multilingues (« Langues : français, portugais »)

Améliorations :
- Ajouter un numéro de téléphone et une localité : sans ces éléments, un recruteur ne peut pas facilement contacter le candidat.
- Décrire les tâches concrètes du poste de magasinier chez Exemple SA (réception, stockage, préparation de commandes, utilisation d'outils ou de logiciels, etc.) pour que le recruteur comprenne le périmètre réel du poste.
- Préciser les emplois antérieurs ('divers emplois') avec au moins les intitulés de poste et les périodes, afin d'éviter qu'un recruteur écarte le CV faute d'informations sur le parcours avant 2019.

Conseils suisses : En Suisse, le CV inclut systématiquement une localité (ville ou canton) pour situer le candidat géographiquement. Les certificats de travail (Arbeitszeugnis) sont très importants sur le marché suisse : la mention 'Références et certificats de travail disponibles sur demande' est recommandée en fin de CV. Un CV d'une page est la norme pour un profil avec ce niveau d'expérience. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : magasinier, permis de conduire B, français, portugais

Pré-tri : défauts ✘ CV très incomplet (pas de détails, pas de téléphone, pas de lieu) · ✔ « Divers emplois » sans précision

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv08 — Mal structuré — ordre et rubriques mélangés

**Exécution 1** — score 38 (fourchette indicative 30-60) · ATS 43 · 26 s

Points forts :
- Expérience en facturation médicale avec TARMED, un outil spécifique au secteur de la santé suisse, valorisé dans les cabinets médicaux et cliniques (« facturation TARMED »)
- Poste actuel en hôtellerie incluant la gestion des plaintes, ce qui démontre une capacité au contact client dans des situations difficiles (« gestion des plaintes clients »)

Améliorations :
- L'e-mail 'anna.fictive@example.invalid' ne paraît pas professionnel : utiliser une adresse au format prenom.nom@domaine.ch pour éviter d'être écarté dès la première lecture.
- La rédaction informelle ('je faisais l'accueil et le courrier') doit être remplacée par des formulations nominales professionnelles, par exemple 'Accueil des visiteurs, gestion du courrier entrant et sortant'.
- La structure doit être réorganisée en rubriques distinctes et dans l'ordre antichronologique : Expériences professionnelles (du plus récent au plus ancien), puis Formation, puis Compétences et Langues.
- L'accroche 'J'aime le contact humain et je suis motivée' est trop générique : la remplacer par deux phrases concrètes qui résument le profil, les secteurs couverts et la valeur ajoutée pour le poste visé.

Conseils suisses : En Suisse, un CV tient généralement sur une à deux pages maximum avec des rubriques claires et un ordre antichronologique strict. La maîtrise de l'allemand est souvent attendue dans le canton de Neuchâtel selon les employeurs : si Anna a des notions, il vaut la peine de les mentionner. Les certificats de travail (Arbeitszeugnisse) sont très importants dans le processus de recrutement suisse et peuvent être joints dès la candidature. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : réceptionniste, assistante administrative, secrétaire, accueil, check-in, réservations, gestion des plaintes clients, facturation TARMED, agenda des médecins, Excel, Word, CFC employée de bureau

Pré-tri : défauts ✔ Pas de rubriques claires, chronologie dans le désordre · ✘ « anglais un peu » | qualités ✔ Compétence métier spécifique (facturation TARMED)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv09 — PDF à deux colonnes — texte extrait mélangé

**Exécution 1** — score 68 (fourchette indicative 35-70) · ATS 68 · 24 s

Points forts :
- Certification PMP obtenue, référence reconnue en gestion de projet qui répond directement aux exigences de nombreuses offres (« PMP (2019) »)

Améliorations :
- La mise en page en colonnes produit un texte mélangé (coordonnées et compétences insérées au milieu des expériences) : recréer le CV dans un format à colonne unique pour garantir une lecture correcte par les logiciels de tri ATS.
- Le poste d'analyste métier chez Assurance Démo SA ne contient qu'une tâche sans portée ni résultat (« Recueil des besoins pour 3 applications métier ») : ajouter au moins un résultat ou un indicateur de portée pour chaque expérience.
- La migration du core banking mentionne le budget et l'équipe mais aucun résultat : préciser, par exemple, si le projet a été livré dans les délais ou quel bénéfice il a apporté, afin de transformer la tâche en réalisation.

Conseils suisses : En Suisse romande, les certificats de travail (Arbeitszeugnisse) ont une valeur importante : mentionner qu'ils sont disponibles sur demande est un usage courant. Le secteur bancaire lausannois valorise fortement les profils combinant gestion de projet et connaissance métier financière, ce qui correspond bien à ce parcours. Un profil LinkedIn à jour et cohérent avec le CV est aujourd'hui attendu par la majorité des recruteurs suisses. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Chef de projet IT, Gestion de projet, Prince2, Scrum, PMP, Jira, Confluence, Analyste métier, Core banking, Master HEC, Français C2, Anglais C1, Allemand B2

Pré-tri : défauts ✔ Mise en page en deux colonnes mal lue par les logiciels de tri | qualités ✘ Projet chiffré (8 MCHF, 40 personnes) · ✔ Certification PMP
Mots-clés absents du texte du CV : Français C2, Anglais C1, Allemand B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv10 — Administratif — fautes d'orthographe

**Exécution 1** — score 54 (fourchette indicative 40-70) · ATS 63 · 23 s

Points forts :
- Stabilité et progression dans le secteur tertiaire genevois, rassurante pour un recruteur (« 2019 - aujourd'hui Assistante de direction, Fondation Fictive, Genève »)
- Double formation cohérente avec le poste visé, incluant un diplôme spécialisé en assistanat de direction (« Diplôme d'assistante de direction (ESA fictive) »)
- Maîtrise d'Abacus, logiciel très répandu en Suisse, qui constitue un atout différenciant sur le marché local (« Abacus »)

Améliorations :
- Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : 'PROFESSIONELLE', 'générale', 'Organistion', 'procès-verbals', 'Microsft Ofice', '6 par ans' nuisent directement à la crédibilité du CV.
- Enrichir chaque expérience avec la portée des tâches : préciser par exemple le nombre de personnes dont l'agenda est géré, le type de conseil de fondation ou la nature des courriers juridiques rédigés, afin de dépasser la simple liste de tâches.
- Ajouter une troisième langue ou préciser le niveau en anglais dans le contexte genevois : le marché local valorise souvent une langue supplémentaire (allemand ou espagnol) pour les postes d'assistanat de direction.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) ont un poids important : mentionner leur disponibilité en fin de CV est une pratique courante. À Genève, les fondations et organisations internationales sont nombreuses ; mettre en avant l'expérience en fondation est un vrai atout. Un CV suisse tient généralement en une à deux pages avec un ton factuel et sans accroche trop commerciale. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : assistante de direction, secrétaire, gestion de l'agenda, conseil de fondation, courriers juridiques, gestion des délais, diplôme d'assistante de direction, Word, Excel, PowerPoint, Abacus, anglais B2

Pré-tri : défauts ✔ Fautes d'orthographe (professionelle, organistion, procès-verbals, Microsft Ofice) | qualités ✔ Diplôme d'assistante de direction
Mots-clés absents du texte du CV : anglais B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 52 (fourchette indicative 40-70) · ATS 60 · 24 s
- 1re amélioration : Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : « EXPÉRIENCE PROFESSIONELLE », « générale », « Organistion », « procès-verbals », « par ans », « Microsft Ofice » nuisent à la crédibilité et peuvent entraîner un rejet immédiat.

**Exécution 3** — score 54 (fourchette indicative 40-70) · ATS 63 · 23 s
- 1re amélioration : Corriger toutes les fautes d'orthographe et de frappe avant tout envoi : « Organistion », « procès-verbals », « 6 par ans », « directeur générale » et « Microsft Ofice » sont des erreurs qui peuvent entraîner un rejet immédiat du dossier.

### cv11 — Commercial — résultats chiffrés, aucune langue

**Exécution 1** — score 69 (fourchette indicative 55-85) · ATS 76 · 23 s

Points forts :
- Résultats commerciaux chiffrés qui démontrent une progression concrète du portefeuille (« Chiffre d'affaires du secteur passé de 6,2 à 7,3 MCHF (+18 %) »)
- Expérience sur un périmètre géographique étendu, couvrant deux régions linguistiques suisses (« 45 cliniques et hôpitaux au Tessin et en Suisse alémanique »)
- Capacité à conclure des accords stratégiques avec des acteurs publics (« Signature de 2 contrats cadres cantonaux »)
- Reconnaissance par les pairs en début de carrière, attestant d'une performance commerciale établie (« Meilleur vendeur régional 2018 »)

Améliorations :
- Langues absentes : ajouter une rubrique Langues avec les langues maîtrisées et leur niveau (ex. CECR), car le poste couvre le Tessin et la Suisse alémanique et tout recruteur s'interrogera immédiatement sur la maîtrise de l'italien et de l'allemand.
- Le poste chez Exemple Médical Sàrl (2016–2020) liste des tâches sans résultat chiffré : ajouter au moins un indicateur de portée (volume, taux, évolution) pour équilibrer les deux expériences.
- La liste de compétences (Salesforce, négociation, appels d'offres publics) n'est pas rattachée à une expérience précise : intégrer ces éléments directement dans les descriptions de poste pour les rendre plus crédibles aux yeux des logiciels de tri (ATS) et des recruteurs.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis/certificat de travail) sont des documents clés : mentionner qu'ils sont disponibles sur demande est un usage courant. Le brevet fédéral de spécialiste de vente est un titre protégé reconnu sur tout le territoire suisse, ce qui est un atout à valoriser explicitement dans le profil. Pour les appels d'offres publics en Suisse, la connaissance de SIMAP peut être un mot-clé recherché selon les offres. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Key Account Manager, distribution de matériel médical, Salesforce, négociation, appels d'offres publics, contrats cadres, brevet fédéral de spécialiste de vente, CFC de laborantin, prospection, B2B, Medtech, cliniques et hôpitaux

Pré-tri : défauts ✔ Aucune rubrique langues (alors qu'il travaille au Tessin et en Suisse alémanique) | qualités ✔ Résultats chiffrés (+18 %, 45 clients)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv12 — Vente terrain — coordonnées manquantes

**Exécution 1** — score 56 (fourchette indicative 35-65) · ATS 58 · 19 s

Points forts :
- Responsabilité de formation, qui démontre une capacité d'encadrement valorisée par les recruteurs (« Formation de 2 apprenties »)
- Profil bilingue français-allemand adapté au marché de Bienne, ville officiellement bilingue (« Français (langue maternelle), allemand (B1) »)
- Ancienneté dans le poste actuel, signe de stabilité et de confiance accordée par l'employeur (« 2021 - aujourd'hui Vendeuse, Mode Démo SA »)

Améliorations :
- Ajouter les coordonnées (téléphone, adresse e-mail professionnelle et localité) : sans ces informations, le recruteur ne peut pas contacter la candidate.
- Enrichir les tâches avec leur portée ou leur contexte : par exemple, préciser la taille du magasin, le type de clientèle ou la nature des responsabilités liées à la vitrine, afin de donner du poids aux expériences listées.
- Mentionner les outils ou logiciels utilisés (logiciel de caisse, système de gestion de stock, etc.) s'ils ont été employés, car ces mots-clés sont souvent filtrés par les logiciels de tri automatique.

Conseils suisses : En Suisse, un certificat de travail (Arbeitszeugnis) est attendu pour chaque poste : mentionner leur disponibilité rassure le recruteur. Le niveau B1 en allemand est un atout réel à Bienne, mais il peut être utile de préciser si vous êtes à l'aise à l'oral, à l'écrit ou les deux. L'AFP est un diplôme fédéral reconnu : son intitulé complet peut être épelé pour les recruteurs moins familiers avec cette filière. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : vendeuse, commerce de détail, conseil clientèle, encaissement, vitrine, AFP, assistante du commerce de détail, français, allemand, arabe

Pré-tri : défauts ✔ Ni téléphone, ni e-mail, ni localité | qualités ✔ Forme des apprenties

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv13 — Soins — infirmière frontalière, diplôme français

**Exécution 1** — score 63 (fourchette indicative 45-75) · ATS 68 · 23 s

Points forts :
- Un volume de charge concret en médecine interne, qui donne immédiatement une idée du niveau d'autonomie et de la capacité à gérer plusieurs patients simultanément (« Prise en charge de 12 patients par poste »)
- Une responsabilité d'encadrement mentionnée, ce qui distingue le profil d'une infirmière purement exécutante (« Encadrement des étudiants infirmiers »)

Améliorations :
- Diplôme étranger non reconnu : le Diplôme d'État d'infirmier obtenu en France doit être reconnu par la Croix-Rouge suisse pour exercer en Suisse ; indiquer explicitement cette reconnaissance (ou la démarche en cours) est indispensable pour ne pas être écarté d'emblée.
- Permis de travail absent : la résidence à Annemasse (France) est visible, mais aucune mention du permis de travail suisse n'apparaît ; l'ajouter (par exemple permis G si frontalier) lève immédiatement un frein pour le recruteur.
- Poste en EHPAD entièrement vide : ajouter au moins une ou deux tâches concrètes pour ce poste afin qu'il ne semble pas être un simple trou à remplir.
- Allemand absent : pour la majorité des postes infirmiers en Suisse, l'allemand est attendu ; si un niveau existe, même faible, il doit figurer ; s'il est nul, cela oriente la candidature vers la Suisse romande uniquement.

Conseils suisses : En Suisse, un diplôme infirmier étranger doit être reconnu par la Croix-Rouge suisse avant de pouvoir exercer : mentionnez cette reconnaissance dès l'en-tête du CV. Les employeurs suisses apprécient les certificats de travail (Arbeitszeugnis) : précisez qu'ils sont disponibles sur demande. La région frontalière d'Annemasse ouvre l'accès aux postes en Suisse romande avec un permis G, ce qui vaut la peine d'être explicité. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : infirmière diplômée d'État, médecine interne, EHPAD, encadrement des étudiants infirmiers, Diplôme d'État d'infirmier, français, anglais

Pré-tri : défauts ✔ Reconnaissance du diplôme français (CRS / Croix-Rouge suisse) non mentionnée · ✔ Statut de travail en Suisse (permis G) non indiqué | qualités ✔ Encadrement d'étudiants, 12 patients par poste

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv14 — Multilingue FR/DE/EN — langues bien renseignées

**Exécution 1** — score 96 (fourchette indicative 60-90) · ATS 95 · 20 s

Points forts :
- Un résultat opérationnel chiffré fort qui démontre un impact direct sur la qualité de service (« Taux de résolution au premier appel passé de 68 % à 81 % »)
- La direction d'une équipe bilingue de taille significative renforce la crédibilité managériale du candidat (« Direction d'une équipe de 18 conseillers (FR/DE) »)
- La maîtrise d'outils CRM de référence du secteur est explicitement démontrée (« Salesforce Service Cloud, Zendesk, MS Office »)

Améliorations :
- Ajouter les mois aux dates de toutes les expériences et formations (ex. : janvier 2021 – aujourd'hui) pour répondre aux attentes des recruteurs suisses et des logiciels de tri ATS.
- Préciser le résultat ou la portée de la mise en place du chat client, qui est actuellement mentionnée sans impact mesurable : 'Mise en place d'un chat client en trois langues'.

Conseils suisses : En Suisse, il est d'usage d'ajouter en fin de CV la mention « Références et certificats de travail disponibles sur demande ». Le brevet fédéral est un titre reconnu nationalement : son intitulé complet est un atout à conserver tel quel. Pour Berne, le bilinguisme DE/FR affiché est particulièrement valorisé par les employeurs de la région. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Responsable service clientèle, Conseiller clientèle senior, Salesforce Service Cloud, Zendesk, MS Office, Brevet fédéral, Management de la clientèle, Taux de résolution au premier appel, Chat client, Télécommunications, Réclamations complexes

Pré-tri : défauts ✔ Pas de mention des certificats de travail / références | qualités ✘ Langues avec niveaux CECR · ✔ Résultat chiffré (68 % → 81 %)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 92 (fourchette indicative 60-90) · ATS 94 · 23 s
- 1re amélioration : Le poste de conseiller clientèle senior chez Exemple Services AG (2017-2021) ne contient aucun résultat chiffré ni indicateur de portée : ajouter au moins un élément mesurable (volume de dossiers, taux de satisfaction, etc.) pour que cette expérience ait le même poids que la suivante.

**Exécution 3** — score 96 (fourchette indicative 60-90) · ATS 95 · 21 s
- 1re amélioration : Ajouter les mois aux dates de toutes les expériences et formations (ex. « janvier 2021 – aujourd'hui ») pour répondre aux attentes des recruteurs suisses et des logiciels de tri ATS.

### cv15 — Frontalier avec permis G — allemand absent

**Exécution 1** — score 69 (fourchette indicative 45-75) · ATS 68 · 21 s

Points forts :
- Un résultat chiffré et daté au poste actuel, directement parlant pour un recruteur en industrie (« Réduction des arrêts non planifiés de 22 % en 2023 »)
- Une habilitation électrique spécifique mentionnée, qui répond à une exigence fréquente en maintenance industrielle (« Habilitation électrique BR »)
- Le permis G est indiqué, ce qui lève immédiatement la question du droit de travailler en Suisse pour un candidat domicilié en France (« Mulhouse (France) · Permis G »)

Améliorations :
- Le poste 'Électromécanicien, Usine Fictive, Mulhouse (2014-2019)' est entièrement vide : ajouter au moins deux tâches ou résultats concrets pour que ce poste ne soit pas ignoré par les recruteurs et les logiciels de tri.
- L'allemand est absent du CV alors que le poste actuel est à Bâle, une région germanophone : indiquer le niveau réel en allemand (même débutant) est indispensable pour les offres dans cette région.
- Les mots-clés techniques sont peu nombreux : mentionner les outils, logiciels ou méthodes effectivement utilisés (par exemple GMAO, types d'équipements, normes) pour améliorer la visibilité dans les systèmes de tri automatique.

Conseils suisses : En Suisse, les employeurs attendent généralement un certificat de travail (Arbeitszeugnis) pour chaque poste ; la mention « Références et certificats de travail disponibles sur demande » est un usage courant à ajouter en bas de CV. Le marché bâlois est très ancré dans l'industrie chimique et pharmaceutique : adapter le vocabulaire du CV aux termes de ce secteur peut faire la différence. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : technicien de maintenance, maintenance préventive, électromécanicien, habilitation électrique BR, lignes de production, BTS Maintenance des systèmes, permis G

Pré-tri : défauts ✔ Travaille à Bâle mais aucune mention de l'allemand | qualités ✔ Permis G indiqué · ✔ Résultat chiffré (−22 % d'arrêts)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv16 — Permis B — ingénieure civile, tâches vagues

**Exécution 1** — score 65 (fourchette indicative 45-75) · ATS 78 · 22 s

Points forts :
- Poste actuel en bureau d'ingénieurs suisse avec responsabilité de projets, ce qui rassure immédiatement un recruteur sur l'intégration dans le marché local (« Responsable de projets »)
- Maîtrise des normes SIA, référence incontournable pour tout bureau d'ingénieurs suisse (« SIA Norm »)
- Diplôme de master en génie civil mentionné avec une reconnaissance, ce qui lève une question fréquente pour un diplôme étranger (« reconnu par le Swiss Engineering STV fictif »)
- Combinaison d'outils BIM et de calcul (Revit, Cubus) qui correspond aux attentes actuelles des bureaux d'ingénieurs (« Revit, SIA Norm, Cubus »)

Améliorations :
- Enrichir chaque poste avec la portée concrète des missions : pour « Responsable de projets » et « Suivi de chantiers », préciser par exemple le type d'ouvrage, la phase du projet ou l'équipe impliquée, sans inventer de chiffres absents du CV.
- Développer le poste chez Construções Exemplo Lda (Porto) : « Conception d'ouvrages » et « Coordination » sont trop vagues pour qu'un recruteur évalue la transférabilité de cette expérience.
- Ajouter les mois aux dates de début et de fin de chaque poste afin d'éviter toute ambiguïté sur d'éventuelles interruptions courtes.

Conseils suisses : En Suisse, les bureaux d'ingénieurs civils attendent souvent une mention explicite des types d'ouvrages traités (bâtiments, ouvrages d'art, génie civil souterrain, etc. ). Le permis B est un atout à conserver en tête de CV car il répond directement à une question administrative fréquente. Les certificats de travail (Arbeitszeugnis) sont une pratique très ancrée en Suisse : indiquer « Certificats de travail disponibles sur demande » est un usage courant. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : ingénieure civile, génie civil, responsable de projets, suivi de chantiers, calculs de structures, conception d'ouvrages, AutoCAD, Revit, SIA Norm, Cubus, Master en génie civil, français C1

Pré-tri : défauts ✔ « Responsable de projets » sans taille, budget ni type d'ouvrage | qualités ✘ Permis B indiqué · ✔ Connaissance des normes SIA
Mots-clés absents du texte du CV : français C1

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv17 — Avec photo — profil générique (photo déclarée)

**Exécution 1** — score 76 (fourchette indicative 45-75) · ATS 70 · 24 s

Points forts :
- Des volumes chiffrés dans le poste actuel qui crédibilisent immédiatement l'expérience en recrutement (« Recrutement de 40 à 60 collaborateurs par an »)
- Une réalisation concrète en gestion RH qui montre une capacité à gérer un périmètre significatif (« Gestion administrative des salaires (250 collaborateurs) »)
- Le brevet fédéral de spécialiste RH, diplôme reconnu et valorisé sur le marché suisse (« Brevet fédéral de spécialiste RH »)
- Un profil trilingue avec des niveaux explicites, atout concret pour le marché romand et les entreprises nationales (« Français (langue maternelle), anglais (B2), allemand (B1) »)

Améliorations :
- Le poste 'Assistante RH, Exemple Retail SA, Morges (2016-2020)' est entièrement vide : ajouter au moins deux ou trois tâches ou réalisations concrètes pour que ce poste ne soit pas ignoré par les recruteurs.
- L'accroche 'dynamique, motivée et polyvalente' est générique et n'apporte aucune information différenciante : la remplacer par deux phrases qui précisent le domaine d'expertise, le type de structure visé ou une valeur ajoutée spécifique.
- Aucun outil RH n'est mentionné (logiciel de paie, ATS, SIRH) : ajouter une rubrique ou intégrer dans les descriptions les outils effectivement utilisés, car les recruteurs et les logiciels de tri les recherchent souvent.

Conseils suisses : En Suisse, les certificats de travail (Arbeitszeugnis) ont un poids important : mentionner leur disponibilité en fin de CV est une pratique courante. Le brevet fédéral est un titre protégé reconnu par les employeurs suisses : il peut être mis en avant dès l'en-tête ou le titre du CV. Pour un poste en Romandie avec des responsabilités nationales, le niveau d'allemand B1 peut être un atout à valoriser explicitement. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Spécialiste RH, Assistante RH, Recrutement, Gestion administrative des salaires, Processus d'intégration, Brevet fédéral de spécialiste RH, Bachelor en psychologie, Français, Anglais, Allemand

Pré-tri : défauts ✔ Profil générique (« dynamique, motivée, polyvalente ») | qualités ✔ Chiffres concrets (40-60 recrutements, 250 salaires)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 79 (fourchette indicative 45-75) · ATS 75 · 24 s
- 1re amélioration : Le poste 'Assistante RH, Exemple Retail SA, Morges (2016-2020)' est entièrement vide : ajouter au moins deux ou trois tâches ou réalisations concrètes pour éviter qu'un recruteur ou un logiciel de tri l'ignore.

**Exécution 3** — score 75 (fourchette indicative 45-75) · ATS 70 · 24 s
- 1re amélioration : Le poste 'Assistante RH, Exemple Retail SA, Morges (2016-2020)' est entièrement vide : ajouter au moins deux ou trois tâches ou résultats concrets pour que ce poste ne soit pas ignoré par les recruteurs et les logiciels de tri.

### cv18 — Sans photo — dates sans mois

**Exécution 1** — score 68 (fourchette indicative 50-80) · ATS 70 · 22 s

Points forts :
- Le brevet fédéral de spécialiste en finance et comptabilité est un diplôme reconnu et recherché sur le marché suisse, qui crédibilise directement le profil (« Brevet fédéral de spécialiste en finance et comptabilité »)
- La maîtrise d'Abacus et de SAP FI couvre les deux logiciels comptables les plus demandés en Suisse, ce qui est un atout concret pour les recruteurs (« Abacus, SAP FI, Excel avancé »)
- La gestion de la comptabilité de plusieurs entités simultanément démontre une capacité à gérer une charge de travail complexe (« Tenue de la comptabilité de 3 sociétés du groupe »)

Améliorations :
- Les tâches chez Horlogerie Fictive SA sont listées sans portée ni résultat : préciser, par exemple, les volumes traités ou le périmètre des bouclements pour donner du poids aux missions décrites.

Conseils suisses : En Suisse, un certificat de travail (Arbeitszeugnis) est attendu pour chaque poste ; mentionner leur disponibilité rassure les recruteurs. Le brevet fédéral est un titre protégé en Suisse et peut être écrit en toutes lettres pour être reconnu immédiatement. Pour la région de Neuchâtel, le niveau B2 en allemand est un atout à mettre en avant dès l'accroche ou le titre du CV. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Comptable, Aide-comptable, Brevet fédéral de spécialiste en finance et comptabilité, CFC d'employé de commerce, Abacus, SAP FI, Excel avancé, Bouclements, TVA, Comptabilité, Finance

Pré-tri : défauts ✘ Dates sans mois ; poste terminé en 2025 sans indication de la suite | qualités ✔ Brevet fédéral

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv19 — Senior 58 ans — début de carrière trop détaillé

**Exécution 1** — score 84 (fourchette indicative 50-80) · ATS 85 · 25 s

Points forts :
- Direction multi-sites avec résultat chiffré : piloter 3 sites et 140 collaborateurs avec une hausse de productivité documentée est un argument fort pour un recruteur en agroalimentaire (« Direction de 3 sites, 140 collaborateurs »)
- Certification IFS obtenue et maintenue : cette certification est une exigence courante dans l'industrie agroalimentaire suisse et sa continuité démontre une maîtrise durable (« Certification IFS obtenue en 2014 et maintenue depuis »)
- Diplôme fédéral de maître technologue : titre fédéral reconnu qui atteste d'une expertise métier validée par la Confédération (« Diplôme fédéral de maître technologue »)
- Parcours entièrement ancré dans l'industrie laitière et agroalimentaire depuis le début : la cohérence verticale du parcours rassure immédiatement un recruteur sectoriel (« Apprenti technologue en industrie laitière »)

Améliorations :
- Les postes de 1986 à 1998 (Chef d'équipe et Ouvrier de production) contiennent uniquement des listes de tâches sans portée ni résultat ; il est conseillé de les réduire à une ou deux lignes synthétiques, voire de les regrouper, pour concentrer l'attention du recruteur sur les postes à responsabilité.
- Aucun outil, méthode ou référentiel de gestion de production n'est mentionné (par exemple HACCP, lean, ERP ou autre) ; ajouter ceux effectivement utilisés renforcerait la pertinence du CV pour les systèmes de tri automatisé.
- Le poste actuel ne précise pas la taille ou le secteur d'Agroalimentaire Démo SA ; indiquer le type de produits ou le chiffre d'affaires si disponible permettrait au recruteur de mieux situer le contexte.

Conseils suisses : En Suisse, le diplôme fédéral de maître technologue est un titre reconnu qu'il vaut la peine de mettre en avant explicitement dans l'intitulé ou l'accroche. Les certificats de travail (Arbeitszeugnisse) sont attendus dès le premier entretien : la mention « Références et certificats de travail disponibles sur demande » est l'usage habituel. Pour un poste de direction en Suisse alémanique, le niveau B2 en allemand peut être un atout décisif à valoriser selon la région ciblée. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : Directeur de production, Responsable de production, Technologue en industrie laitière, Diplôme fédéral de maître technologue, Certification IFS, Agroalimentaire, Industrie laitière, Chef d'équipe, Productivité

Pré-tri : défauts ✔ Postes de 1984-1998 trop détaillés par rapport à l'expérience récente | qualités ✔ Résultats (IFS, +15 %, 140 collaborateurs)

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv20 — Étudiant master — adresse e-mail non professionnelle

**Exécution 1** — score 63 (fourchette indicative 40-70) · ATS 65 · 22 s

Points forts :
- Le master en droit des affaires en cours, combiné à une expérience pratique simultanée, est un profil recherché par les études d'avocats et les services juridiques d'entreprise à Genève (« Master en droit des affaires, Université fictive de Genève (en cours) »)
- La participation au moot court en demi-finale démontre des compétences en argumentation juridique et en travail sous pression, valorisées dans les recrutements juniors (« moot court 2025 (demi-finaliste) »)
- Le poste d'assistant juridique actuel dans une étude atteste d'une expérience pratique directement liée au domaine visé (« Assistant juridique (20 %), Étude Exemple & Associés, Genève »)

Améliorations :
- L'adresse e-mail 'lebogossdu74@example.invalid' n'est pas professionnelle : la remplacer par une adresse au format prénom.nom@domaine.ch avant tout envoi, sous peine d'écarter le CV dès la première lecture.
- Le stage à la Banque Démo SA est entièrement vide : ajouter au moins deux tâches concrètes effectuées (domaines traités, types de documents, interlocuteurs) pour que ce poste compte aux yeux d'un recruteur.
- Les tâches de l'assistant juridique manquent de portée : préciser le contexte ou la nature des dossiers traités (par exemple le type de contrats ou les clients concernés) pour dépasser la simple liste de tâches.

Conseils suisses : En Suisse, un certificat de travail (Arbeitszeugnis) est attendu pour chaque poste ; mentionner en bas de CV que certificats et références sont disponibles sur demande est un usage courant. Le taux d'activité (20 %) est bien indiqué, ce qui est apprécié par les recruteurs suisses. Pour Genève, le niveau d'anglais C1 est un atout réel à mettre en avant dans la lettre de motivation. Photo, date de naissance et nationalité : ces informations sont facultatives en Suisse, les indiquer ou non reste votre choix.

Mots-clés : droit des affaires, droit des contrats, assistant juridique, recherches juridiques, master en droit, bachelor en droit, moot court, service juridique, français, anglais, allemand

Pré-tri : défauts ✔ Adresse e-mail non professionnelle | qualités ✔ Parcours universitaire cohérent + emploi à temps partiel

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non
