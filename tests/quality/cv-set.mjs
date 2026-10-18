// Jeu d'évaluation de l'analyse de CV — 20 CV ENTIÈREMENT SYNTHÉTIQUES.
// Aucun de ces CV n'appartient à une personne réelle : noms, employeurs, adresses et coordonnées sont inventés
// (domaines en .invalid). Ils ne doivent jamais être présentés comme des CV de clients.
//
// Chaque CV contient des défauts placés volontairement et des qualités connues. Les attentes ci-dessous ont été
// rédigées à partir de ces défauts placés, AVANT toute exécution du moteur d'analyse ; elles sont à relire par
// le fondateur (elles ont été écrites par Claude, pas par le moteur évalué).
//
// Motifs de détection : expressions régulières appliquées au texte de l'analyse mis en minuscules et SANS accents.
// Ils servent de pré-tri automatique ; la note finale reste une lecture humaine (grille dans rubric.md).
//   defects   : défauts à détecter (cherchés dans improvements + swissAdvice)
//   qualities : qualités à reconnaître (cherchées dans strongPoints)
//   forbidden : affirmations fausses ou inacceptables (cherchées partout). critical: true = erreur critique
//   scoreBand : fourchette indicative de bon sens (pas une vérité : sert seulement à repérer un score incohérent)

export const CV_SET = [
  {
    id: 'cv01', label: 'Premier emploi — employée de commerce CFC', hasPhoto: false, scoreBand: [40, 75],
    text: `Léa Fictif
Rue des Exemples 4, 1004 Lausanne
lea.fictif@example.invalid · 079 000 00 01

FORMATION
2023 - 2026 CFC d'employée de commerce, École professionnelle commerciale de Lausanne
2020 - 2023 École secondaire, voie générale

EXPÉRIENCE
2023 - 2026 Apprentie employée de commerce, Fiduciaire Démo SA, Lausanne
- Accueil téléphonique
- Saisie de factures
- Classement
- Aide à la comptabilité

Été 2022 Job d'été, Supermarché Exemple, Renens
- Mise en rayon

LANGUES
Français, allemand, anglais

INFORMATIQUE
Word, Excel, Outlook

LOISIRS
Volleyball, lecture`,
    defects: [
      { id: 'langues_sans_niveau', desc: 'Langues sans niveau (CECR)', patterns: ['niveau', 'cecr', '\\b[abc][12]\\b'] },
      { id: 'taches_sans_portee', desc: 'Tâches listées sans volume ni résultat', patterns: ['resultat', 'chiffr', 'quantif', 'volume', 'concret', 'impact', 'realisation'] }
    ],
    qualities: [{ id: 'cfc', desc: 'CFC obtenu / apprentissage complet', patterns: ['cfc', 'apprentissage'] }],
    forbidden: [
      { desc: 'Prétend qu\'elle n\'a pas de diplôme', patterns: ['sans diplome', 'aucun diplome', 'pas de diplome'], critical: true },
      { desc: 'Prétend qu\'elle n\'a aucune expérience', patterns: ['aucune experience'], critical: true }
    ]
  },
  {
    id: 'cv02', label: 'Junior IT — développeur 2 ans', hasPhoto: false, scoreBand: [45, 75],
    text: `Noah Exemplaire
Développeur web junior
Genève · noah.exemplaire@example.invalid · 078 000 00 02 · github.com/noah-exemple

COMPÉTENCES
JavaScript, TypeScript, React, Node.js, Python, Django, SQL, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Azure, GCP, Git, CI/CD, Jest, GraphQL, Redis, Linux, Agile, Scrum

EXPÉRIENCE
09.2024 - aujourd'hui Développeur web, Démo Digital Sàrl, Genève
- Développement de fonctionnalités
- Correction de bugs
- Participation aux réunions

02.2024 - 08.2024 Stagiaire développeur, Agence Fictive SA, Nyon
- Développement front-end

FORMATION
2021 - 2024 Bachelor en informatique de gestion, HES fictive de Genève

LANGUES
Français (langue maternelle), anglais (B2)`,
    defects: [
      { id: 'competences_sans_contexte', desc: 'Liste de 22 technologies sans contexte ni niveau', patterns: ['contexte', 'projet', 'illustr', 'exemple', 'trop de competences', 'liste', 'prioris', 'niveau de maitrise'] },
      { id: 'taches_vagues', desc: 'Tâches vagues (« développement de fonctionnalités »)', patterns: ['vague', 'generique', 'precis', 'concret', 'resultat', 'quantif', 'impact', 'realisation'] }
    ],
    qualities: [
      { id: 'bachelor', desc: 'Bachelor HES', patterns: ['bachelor', 'hes'] },
      { id: 'github', desc: 'Lien GitHub', patterns: ['github', 'portfolio'] }
    ],
    forbidden: [
      { desc: 'Affirme qu\'il ne maîtrise pas une technologie listée', patterns: ['ne maitrise pas (javascript|react|python|sql)'], critical: true },
      { desc: 'Invente des années d\'expérience (5 ans ou plus)', patterns: ['\\b([5-9]|1[0-9]) ans d.experience'], critical: true }
    ]
  },
  {
    id: 'cv03', label: 'Expérimenté logistique — dates qui se chevauchent', hasPhoto: false, scoreBand: [45, 75],
    text: `Marco Démo
Chef d'équipe logistique
1950 Sion · marco.demo@example.invalid · 079 000 00 03
Permis C · Permis cariste R489 cat. 3 et 5

EXPÉRIENCE PROFESSIONNELLE
2021 - aujourd'hui Chef d'équipe entrepôt, Logistique Fictive SA, Conthey
- Encadrement d'une équipe de 12 magasiniers
- Réduction des erreurs de préparation de 4 % à 1,5 % en 18 mois
- Mise en place du scan systématique des commandes

2017 - 2021 Magasinier principal, Transports Exemple Sàrl, Martigny
- Réception et contrôle des marchandises
- Gestion des stocks sur SAP

2015 - 2019 Magasinier, Distribution Démo SA, Sion
- Préparation de commandes

2010 - 2015 Aide-magasinier, Coop fictive, Sierre

FORMATION
2010 CFC de logisticien, Sion

LANGUES
Français (langue maternelle), allemand (B1), italien (A2)`,
    defects: [
      { id: 'chevauchement', desc: 'Postes 2015-2019 et 2017-2021 se chevauchent sans explication', patterns: ['chevauch', 'simultan', 'en parallele', 'incoheren', 'chronolog', 'meme temps', 'superpos'] }
    ],
    qualities: [
      { id: 'resultat_chiffre', desc: 'Résultat chiffré (erreurs 4 % → 1,5 %)', patterns: ['1,5', '1\\.5', 'chiffr', 'quantif', 'erreur'] },
      { id: 'encadrement', desc: 'Encadrement de 12 personnes', patterns: ['12', 'encadr', 'equipe', 'management'] }
    ],
    forbidden: [
      { desc: 'Le présente comme débutant / peu expérimenté', patterns: ['debutant', 'peu d.experience', 'manque d.experience'], critical: true },
      { desc: 'Conseille d\'ajouter un permis cariste (déjà présent)', patterns: ['(ajout|obten|passer)[^.]{0,40}(permis cariste|caces|r489)'], critical: false }
    ]
  },
  {
    id: 'cv04', label: 'Cadre finance — CV très dense de 3 pages', hasPhoto: true, scoreBand: [50, 80],
    text: `Isabelle Exemple-Démo
Directrice financière (CFO)
8000 Zurich · isabelle.exemple@example.invalid · 076 000 00 04
Nationalité suisse · Née en 1975

PROFIL
Directrice financière avec plus de 20 ans d'expérience dans l'industrie et les services, j'ai piloté des transformations financières d'envergure, conduit des levées de fonds, supervisé des fusions-acquisitions et accompagné des équipes pluridisciplinaires dans des environnements internationaux exigeants, en veillant constamment à l'alignement entre la stratégie financière et les objectifs opérationnels du groupe, tout en garantissant la conformité réglementaire, la maîtrise des risques et l'optimisation de la performance.

EXPÉRIENCE PROFESSIONNELLE
2018 - aujourd'hui CFO, Groupe Industriel Fictif AG, Zurich (CA 450 MCHF, 1 200 collaborateurs)
Dans le cadre de mes fonctions, je suis responsable de l'ensemble de la fonction financière du groupe, comprenant la comptabilité, le contrôle de gestion, la trésorerie, la fiscalité, le reporting consolidé IFRS, la relation avec les banques et les auditeurs, ainsi que la conduite de projets stratégiques tels que l'introduction d'un nouvel ERP, la refonte du processus budgétaire, la négociation du refinancement de 120 MCHF et l'intégration de deux sociétés acquises en Allemagne et en Pologne, en coordination étroite avec la direction générale et le conseil d'administration, tout en encadrant une équipe de 35 personnes réparties sur quatre sites.
2011 - 2018 Directrice du contrôle de gestion, Services Démo SA, Bâle
Pilotage du contrôle de gestion pour 14 filiales, mise en place d'un reporting mensuel harmonisé, réduction du délai de clôture de 12 à 6 jours ouvrables, participation à la due diligence de trois acquisitions, animation du processus budgétaire et des prévisions trimestrielles, encadrement de 9 contrôleurs.
2006 - 2011 Contrôleuse de gestion senior, Exemple Pharma AG, Bâle
Analyse des coûts de production, suivi des investissements, préparation des business plans, contribution au projet de centralisation des achats.
2002 - 2006 Auditrice, Cabinet d'audit fictif, Genève
Audit légal de sociétés industrielles et commerciales, missions de conseil en organisation, encadrement d'assistants.
2000 - 2002 Assistante comptable, Fiduciaire Exemple, Lausanne
Tenue de comptabilités, bouclements, déclarations TVA.

FORMATION
2008 Expert-comptable diplômée (diplôme fédéral)
2000 Master en économie, Université fictive de Lausanne
1995 Maturité gymnasiale

LANGUES
Français (langue maternelle), allemand (C1), anglais (C1)

COMPÉTENCES
IFRS, Swiss GAAP RPC, SAP S/4HANA, consolidation, trésorerie, fiscalité, M&A, gestion des risques, conduite du changement, Power BI, Excel avancé

ENGAGEMENTS
Membre du comité d'une association professionnelle fictive (2015 - aujourd'hui), trésorière d'un club sportif local (2010 - 2016)

CENTRES D'INTÉRÊT
Randonnée, ski de fond, piano, lecture d'essais économiques, voyages`,
    defects: [
      { id: 'trop_dense', desc: 'Paragraphes très longs, CV trop dense', patterns: ['dense', 'long', 'condens', 'synthe', 'concis', 'puces', 'aere', 'lisib', '2 pages', 'deux pages', 'allege'] }
    ],
    qualities: [
      { id: 'resultats', desc: 'Résultats chiffrés (clôture 12 → 6 jours, refinancement 120 MCHF)', patterns: ['clotur', '120', 'chiffr', 'quantif'] },
      { id: 'diplome_federal', desc: 'Expert-comptable diplômée', patterns: ['expert.comptable', 'diplome federal'] }
    ],
    forbidden: [
      { desc: 'Conseille d\'ajouter une photo (déjà présente)', patterns: ['(ajout|insere|inclu)[^.]{0,30}photo'], critical: true },
      { desc: 'Parle de manque d\'expérience', patterns: ['manque d.experience', 'peu d.experience'], critical: true }
    ]
  },
  {
    id: 'cv05', label: 'Reconversion — boulanger devenu développeur web', hasPhoto: false, scoreBand: [40, 70],
    text: `Julien Fictif
Développeur web
1700 Fribourg · julien.fictif@example.invalid · 079 000 00 05

FORMATION
2025 Certificat de développeur web full-stack (bootcamp de 6 mois), École fictive du code, Lausanne
2009 CFC de boulanger-pâtissier

PROJETS
- Site de réservation pour une boulangerie (React, Node.js), en ligne depuis 03.2025
- Application de gestion de stock (Python, SQLite)

EXPÉRIENCE
2015 - 2024 Chef boulanger, Boulangerie Démo, Bulle
- Gestion d'une équipe de 4 personnes
- Commandes fournisseurs
- Production quotidienne

2009 - 2015 Boulanger, Boulangerie Exemple, Fribourg

LANGUES
Français, allemand (bonnes connaissances)`,
    defects: [
      { id: 'pas_d_accroche', desc: 'Aucune accroche expliquant la reconversion', patterns: ['reconversion', 'transition', 'accroche', 'profil', 'resume', 'motivation', 'parcours'] },
      { id: 'competences_transferables', desc: 'Compétences transférables non mises en valeur', patterns: ['transferable', 'valoris', 'gestion d.equipe', 'rigueur', 'organisation'] }
    ],
    qualities: [{ id: 'projets', desc: 'Projets concrets en ligne', patterns: ['projet', 'react', 'site'] }],
    forbidden: [
      { desc: 'Affirme qu\'il n\'a aucune expérience professionnelle', patterns: ['aucune experience professionnelle', 'pas d.experience professionnelle'], critical: true }
    ]
  },
  {
    id: 'cv06', label: 'Interruption de carrière de 4 ans non expliquée', hasPhoto: false, scoreBand: [40, 70],
    text: `Sarah Exemple
Assistante marketing
1800 Vevey · sarah.exemple@example.invalid · 078 000 00 06

EXPÉRIENCE
03.2023 - aujourd'hui Assistante marketing (60 %), Démo Communication SA, Vevey
- Gestion des réseaux sociaux de 3 clients
- Rédaction de la newsletter mensuelle (4 000 abonnés)

01.2015 - 06.2019 Chargée de communication, Exemple Tourisme, Montreux
- Organisation de 15 événements par an
- Coordination avec les médias locaux

2012 - 2014 Assistante de communication, Fictif SA, Lausanne

FORMATION
2012 Bachelor en communication, HES fictive

LANGUES
Français (C2), anglais (B2), allemand (B1)`,
    defects: [
      { id: 'interruption', desc: 'Période 06.2019 - 03.2023 sans explication', patterns: ['interruption', 'trou', 'lacune', 'periode', 'gap', 'absence', 'pause', '2019', 'blanc'] }
    ],
    qualities: [{ id: 'chiffres', desc: 'Chiffres concrets (4 000 abonnés, 15 événements)', patterns: ['4 ?000', '15', 'chiffr', 'quantif'] }],
    forbidden: [
      { desc: 'Suppose la raison de l\'interruption (maternité, maladie, chômage…)', patterns: ['maternite', 'enceinte', 'maladie', 'chomage', 'burn.?out'], critical: true }
    ]
  },
  {
    id: 'cv07', label: 'CV très court', hasPhoto: false, scoreBand: [10, 45],
    text: `Kevin Démo
kevin.demo@example.invalid

Expérience : magasinier depuis 2019 chez Exemple SA.
Avant : divers emplois.
Formation : école obligatoire.
Permis de conduire B.
Langues : français, portugais.`,
    defects: [
      { id: 'trop_court', desc: 'CV très incomplet (pas de détails, pas de téléphone, pas de lieu)', patterns: ['detail', 'developp', 'court', 'succinct', 'insuffisant', 'peu d.information', 'incomplet', 'manque', 'enrichi', 'davantage'] },
      { id: 'divers_emplois', desc: '« Divers emplois » sans précision', patterns: ['divers emplois', 'preciser', 'precis'] }
    ],
    qualities: [],
    forbidden: []
  },
  {
    id: 'cv08', label: 'Mal structuré — ordre et rubriques mélangés', hasPhoto: false, scoreBand: [30, 60],
    text: `Anna Fictive, Neuchâtel, anna.fictive@example.invalid, 077 000 00 08
J'aime le contact humain et je suis motivée.
Langues : français, anglais un peu
2016 secrétaire chez Démo Immobilier jusqu'en 2018, je faisais l'accueil et le courrier
Excel Word
Formation : 2015 CFC employée de bureau
2022 - maintenant réceptionniste Hôtel Exemple Neuchâtel, check-in, réservations, gestion des plaintes clients
Hobbies : cuisine
2018-2022 assistante administrative, Cabinet médical fictif, La Chaux-de-Fonds, agenda des médecins, facturation TARMED
Références sur demande`,
    defects: [
      { id: 'structure', desc: 'Pas de rubriques claires, chronologie dans le désordre', patterns: ['structur', 'section', 'rubrique', 'ordre', 'chronolog', 'organis', 'mise en forme', 'titre'] },
      { id: 'langue_vague', desc: '« anglais un peu »', patterns: ['niveau', 'cecr', '\\b[abc][12]\\b'] }
    ],
    qualities: [{ id: 'tarmed', desc: 'Compétence métier spécifique (facturation TARMED)', patterns: ['tarmed', 'facturation', 'medical'] }],
    forbidden: []
  },
  {
    id: 'cv09', label: 'PDF à deux colonnes — texte extrait mélangé', hasPhoto: false, scoreBand: [35, 70],
    text: `Thomas Exemple                      CONTACT
Chef de projet IT                   thomas.exemple@example.invalid
EXPÉRIENCE                          079 000 00 09
2020 - aujourd'hui                  Lausanne
Chef de projet, Banque              COMPÉTENCES
Fictive SA, Lausanne                Gestion de projet
- Pilotage de la migration          Prince2, Scrum
du core banking (budget             Jira, Confluence
8 MCHF, 40 personnes)               LANGUES
2015 - 2020                         Français (C2)
Analyste métier, Assurance          Anglais (C1)
Démo SA, Lausanne                   Allemand (B2)
- Recueil des besoins pour          FORMATION
3 applications métier               2015 Master HEC fictif
                                    CERTIFICATIONS
                                    PMP (2019)`,
    defects: [
      { id: 'mise_en_page', desc: 'Mise en page en deux colonnes mal lue par les logiciels de tri', patterns: ['colonne', 'ats', 'mise en page', 'lisib', 'format', 'logiciel', 'structure'] }
    ],
    qualities: [
      { id: 'projet_chiffre', desc: 'Projet chiffré (8 MCHF, 40 personnes)', patterns: ['8 ?mchf', '40', 'budget', 'migration'] },
      { id: 'certif', desc: 'Certification PMP', patterns: ['pmp', 'certif', 'prince2'] }
    ],
    forbidden: [
      { desc: 'Prétend que les langues n\'ont pas de niveau (elles en ont)', patterns: ['(indiquez|precisez|ajoutez)[^.]{0,40}niveau[^.]{0,20}langue'], critical: false }
    ]
  },
  {
    id: 'cv10', label: 'Administratif — fautes d\'orthographe', hasPhoto: false, scoreBand: [40, 70],
    text: `Nathalie Démo
Assistante de direction
1201 Genève · nathalie.demo@example.invalid · 079 000 00 10

EXPÉRIENCE PROFESSIONELLE
2019 - aujourd'hui Assistante de direction, Fondation Fictive, Genève
- Gestion de l'agenda du directeur générale
- Organistion des séances du conseil de fondation (6 par ans)
- Rédaction des procès-verbals

2014 - 2019 Secrétaire, Étude d'avocats Exemple, Genève
- Rédaction de courriers juridiques
- Gestion des délais

FORMATION
2014 CFC d'employée de commerce
2017 Diplôme d'assistante de direction (ESA fictive)

LANGUES
Français (langue maternelle), anglais (B2)

INFORMATIQUE
Microsft Ofice (Word, Excel, Powerpoint), Abacus`,
    defects: [
      { id: 'orthographe', desc: 'Fautes d\'orthographe (professionelle, organistion, procès-verbals, Microsft Ofice)', patterns: ['orthograph', 'faute', 'coquille', 'relecture', 'relire', 'typo', 'microsft', 'organistion', 'proces.verbals'] }
    ],
    qualities: [{ id: 'diplome', desc: 'Diplôme d\'assistante de direction', patterns: ['assistante de direction', 'diplome', 'cfc'] }],
    forbidden: [
      { desc: 'Affirme qu\'elle ne maîtrise pas la bureautique', patterns: ['ne maitrise pas (word|excel|office)'], critical: true }
    ]
  },
  {
    id: 'cv11', label: 'Commercial — résultats chiffrés, aucune langue', hasPhoto: false, scoreBand: [55, 85],
    text: `David Fictif
Key Account Manager
6900 Lugano · david.fictif@example.invalid · 076 000 00 11

PROFIL
Commercial B2B orienté résultats, 9 ans dans la distribution de matériel médical.

EXPÉRIENCE
2020 - aujourd'hui Key Account Manager, Medtech Démo SA, Lugano
- Portefeuille de 45 cliniques et hôpitaux au Tessin et en Suisse alémanique
- Chiffre d'affaires du secteur passé de 6,2 à 7,3 MCHF (+18 %) en 3 ans
- Signature de 2 contrats cadres cantonaux

2016 - 2020 Représentant, Exemple Médical Sàrl, Bellinzone
- Prospection et suivi de 120 cabinets médicaux
- Meilleur vendeur régional 2018

FORMATION
2016 Brevet fédéral de spécialiste de vente
2012 CFC de laborantin

COMPÉTENCES
Salesforce, négociation, appels d'offres publics`,
    defects: [
      { id: 'pas_de_langues', desc: 'Aucune rubrique langues (alors qu\'il travaille au Tessin et en Suisse alémanique)', patterns: ['langue', 'italien', 'allemand'] }
    ],
    qualities: [{ id: 'resultats', desc: 'Résultats chiffrés (+18 %, 45 clients)', patterns: ['18', 'chiffre d.affaires', 'chiffr', 'quantif', 'resultat'] }],
    forbidden: [
      { desc: 'Prétend qu\'il n\'y a aucun résultat chiffré', patterns: ['aucun (resultat )?chiffr', 'pas de chiffr', 'aucun resultat'], critical: true }
    ]
  },
  {
    id: 'cv12', label: 'Vente terrain — coordonnées manquantes', hasPhoto: false, scoreBand: [35, 65],
    text: `Fatima Exemple
Vendeuse en magasin

EXPÉRIENCE
2021 - aujourd'hui Vendeuse, Mode Démo SA, centre commercial de Bienne
- Conseil clientèle et encaissement
- Responsable de la vitrine
- Formation de 2 apprenties

2018 - 2021 Vendeuse auxiliaire, Chaussures Fictives, Bienne

FORMATION
2018 AFP d'assistante du commerce de détail

LANGUES
Français (langue maternelle), allemand (B1), arabe (langue maternelle)

QUALITÉS
Souriante, ponctuelle, sens du service`,
    defects: [
      { id: 'coordonnees', desc: 'Ni téléphone, ni e-mail, ni localité', patterns: ['coordonnee', 'telephone', 'e-?mail', 'contact', 'adresse'] }
    ],
    qualities: [{ id: 'formation_apprenties', desc: 'Forme des apprenties', patterns: ['apprenti', 'formation', 'formatrice'] }],
    forbidden: [
      { desc: 'Remarque sur l\'origine ou la langue arabe', patterns: ['origine', 'retirer[^.]{0,30}arabe', 'supprim[^.]{0,30}arabe'], critical: true }
    ]
  },
  {
    id: 'cv13', label: 'Soins — infirmière frontalière, diplôme français', hasPhoto: false, scoreBand: [45, 75],
    text: `Claire Démo
Infirmière diplômée d'État
74100 Annemasse (France) · claire.demo@example.invalid · +33 6 00 00 00 13

EXPÉRIENCE
2020 - aujourd'hui Infirmière en médecine interne, Centre hospitalier fictif, Annecy (France)
- Prise en charge de 12 patients par poste
- Encadrement des étudiants infirmiers

2017 - 2020 Infirmière en EHPAD, Résidence Exemple, Thonon (France)

FORMATION
2017 Diplôme d'État d'infirmier, IFSI fictif, Lyon

LANGUES
Français (langue maternelle), anglais (A2)`,
    defects: [
      { id: 'reconnaissance', desc: 'Reconnaissance du diplôme français (CRS / Croix-Rouge suisse) non mentionnée', patterns: ['reconnaissance', 'crs', 'croix.rouge', 'equivalence', 'enregistrement', 'registre'] },
      { id: 'permis', desc: 'Statut de travail en Suisse (permis G) non indiqué', patterns: ['permis', 'autorisation de travail', 'frontali'] }
    ],
    qualities: [{ id: 'encadrement', desc: 'Encadrement d\'étudiants, 12 patients par poste', patterns: ['12', 'encadr', 'etudiant'] }],
    forbidden: [
      { desc: 'Suggère de cacher qu\'elle habite en France', patterns: ['(cacher|masquer|retirer)[^.]{0,30}(france|adresse)'], critical: false }
    ]
  },
  {
    id: 'cv14', label: 'Multilingue FR/DE/EN — langues bien renseignées', hasPhoto: false, scoreBand: [60, 90],
    text: `Lukas Fiktiv
Responsable service clientèle
3011 Berne · lukas.fiktiv@example.invalid · 079 000 00 14

PROFIL
Responsable service clientèle trilingue, 8 ans d'expérience dans les télécommunications.

EXPÉRIENCE
2021 - aujourd'hui Responsable service clientèle, Telecom Demo AG, Berne
- Direction d'une équipe de 18 conseillers (FR/DE)
- Taux de résolution au premier appel passé de 68 % à 81 %
- Mise en place d'un chat client en trois langues

2017 - 2021 Conseiller clientèle senior, Exemple Services AG, Fribourg
- Traitement des réclamations complexes
- Formation des nouveaux collaborateurs (25 personnes formées)

FORMATION
2020 Brevet fédéral de spécialiste en management de la clientèle (fictif)
2016 CFC d'employé de commerce

LANGUES
Allemand (langue maternelle), français (C1), anglais (B2)

INFORMATIQUE
Salesforce Service Cloud, Zendesk, MS Office`,
    defects: [
      { id: 'references', desc: 'Pas de mention des certificats de travail / références', patterns: ['reference', 'certificat'] }
    ],
    qualities: [
      { id: 'langues_niveaux', desc: 'Langues avec niveaux CECR', patterns: ['trilingue', 'langue', 'c1', 'multilingu'] },
      { id: 'resultat', desc: 'Résultat chiffré (68 % → 81 %)', patterns: ['81', '68', 'chiffr', 'quantif'] }
    ],
    forbidden: [
      { desc: 'Demande de préciser les niveaux de langue (déjà précisés)', patterns: ['(indiquez|precisez|ajoutez)[^.]{0,40}niveau'], critical: false }
    ]
  },
  {
    id: 'cv15', label: 'Frontalier avec permis G — allemand absent', hasPhoto: false, scoreBand: [45, 75],
    text: `Hugo Exemple
Technicien de maintenance industrielle
68100 Mulhouse (France) · Permis G · hugo.exemple@example.invalid · +33 6 00 00 00 15

EXPÉRIENCE
2019 - aujourd'hui Technicien de maintenance, Chimie Démo AG, Bâle
- Maintenance préventive de 30 lignes de production
- Réduction des arrêts non planifiés de 22 % en 2023
- Habilitation électrique BR

2014 - 2019 Électromécanicien, Usine Fictive, Mulhouse

FORMATION
2014 BTS Maintenance des systèmes, Lycée fictif, Mulhouse

LANGUES
Français (langue maternelle), anglais (B1)`,
    defects: [
      { id: 'allemand', desc: 'Travaille à Bâle mais aucune mention de l\'allemand', patterns: ['allemand', 'alemanique'] }
    ],
    qualities: [
      { id: 'permis_g', desc: 'Permis G indiqué', patterns: ['permis g', 'permis'] },
      { id: 'resultat', desc: 'Résultat chiffré (−22 % d\'arrêts)', patterns: ['22', 'chiffr', 'quantif', 'arret'] }
    ],
    forbidden: [
      { desc: 'Conseille d\'obtenir ou d\'indiquer un permis de travail (déjà indiqué)', patterns: ['(obten|indiqu|precis|ajout|mentionn)[^.]{0,40}(permis de travail|autorisation de travail|permis g)'], critical: true }
    ]
  },
  {
    id: 'cv16', label: 'Permis B — ingénieure civile, tâches vagues', hasPhoto: false, scoreBand: [45, 75],
    text: `Inês Fictícia
Ingénieure civile
1950 Sion · Permis B · ines.ficticia@example.invalid · 078 000 00 16

EXPÉRIENCE
2022 - aujourd'hui Ingénieure civile, Bureau d'ingénieurs Démo SA, Sion
- Responsable de projets
- Suivi de chantiers
- Calculs de structures

2018 - 2022 Ingénieure, Construções Exemplo Lda, Porto (Portugal)
- Conception d'ouvrages
- Coordination

FORMATION
2018 Master en génie civil, Université fictive de Porto (reconnu par le Swiss Engineering STV fictif)

LANGUES
Portugais (langue maternelle), français (C1), anglais (B2), allemand (A2)

LOGICIELS
AutoCAD, Revit, SIA Norm, Cubus`,
    defects: [
      { id: 'taches_vagues', desc: '« Responsable de projets » sans taille, budget ni type d\'ouvrage', patterns: ['vague', 'precis', 'taille', 'budget', 'ampleur', 'envergure', 'type d.ouvrage', 'concret', 'quantif', 'chiffr'] }
    ],
    qualities: [
      { id: 'permis', desc: 'Permis B indiqué', patterns: ['permis'] },
      { id: 'normes', desc: 'Connaissance des normes SIA', patterns: ['sia', 'norme'] }
    ],
    forbidden: [
      { desc: 'Conseil lié à l\'origine ou au nom', patterns: ['origine', 'nom etranger', 'consonance'], critical: true }
    ]
  },
  {
    id: 'cv17', label: 'Avec photo — profil générique', hasPhoto: true, scoreBand: [45, 75],
    text: `Céline Exemple
Spécialiste RH
1003 Lausanne · celine.exemple@example.invalid · 079 000 00 17
[Photo]

PROFIL
Personne dynamique, motivée et polyvalente, à la recherche de nouveaux défis.

EXPÉRIENCE
2020 - aujourd'hui Spécialiste RH, Groupe Fictif SA, Lausanne
- Recrutement de 40 à 60 collaborateurs par an
- Gestion administrative des salaires (250 collaborateurs)
- Mise en place d'un processus d'intégration

2016 - 2020 Assistante RH, Exemple Retail SA, Morges

FORMATION
2019 Brevet fédéral de spécialiste RH
2016 Bachelor en psychologie, Université fictive

LANGUES
Français (langue maternelle), anglais (B2), allemand (B1)`,
    defects: [
      { id: 'profil_generique', desc: 'Profil générique (« dynamique, motivée, polyvalente »)', patterns: ['generique', 'accroche', 'profil', 'personnalis', 'cliche', 'banal', 'dynamique', 'specifique'] }
    ],
    qualities: [{ id: 'chiffres', desc: 'Chiffres concrets (40-60 recrutements, 250 salaires)', patterns: ['250', '40', 'chiffr', 'quantif', 'recrutement'] }],
    forbidden: [
      { desc: 'Conseille d\'ajouter une photo (déjà présente)', patterns: ['(ajout|insere|inclu|integr)[^.]{0,30}photo'], critical: true }
    ]
  },
  {
    id: 'cv18', label: 'Sans photo — dates sans mois', hasPhoto: false, scoreBand: [50, 80],
    text: `Patrick Démo
Comptable
2000 Neuchâtel · patrick.demo@example.invalid · 079 000 00 18

EXPÉRIENCE
2019 - 2025 Comptable, Horlogerie Fictive SA, Neuchâtel
- Tenue de la comptabilité de 3 sociétés du groupe
- Bouclements mensuels et annuels
- Déclarations TVA

2015 - 2019 Aide-comptable, Fiduciaire Exemple, La Chaux-de-Fonds

FORMATION
2018 Brevet fédéral de spécialiste en finance et comptabilité
2015 CFC d'employé de commerce

LANGUES
Français (langue maternelle), allemand (B2), anglais (B1)

INFORMATIQUE
Abacus, SAP FI, Excel avancé`,
    defects: [
      { id: 'dates_sans_mois', desc: 'Dates sans mois ; poste terminé en 2025 sans indication de la suite', patterns: ['mois', 'dates? precise', 'format des dates', 'mm\\.aaaa', '2025', 'depuis', 'actuel'] }
    ],
    qualities: [{ id: 'brevet', desc: 'Brevet fédéral', patterns: ['brevet'] }],
    forbidden: [
      { desc: 'Présente la photo comme obligatoire', patterns: ['photo[^.]{0,40}(obligatoire|indispensable|exigee|imperative)', '(obligatoire|indispensable|exigee|imperative)[^.]{0,40}photo'], critical: true }
    ]
  },
  {
    id: 'cv19', label: 'Senior 58 ans — début de carrière trop détaillé', hasPhoto: false, scoreBand: [50, 80],
    text: `Bernard Exemple
Directeur de production
1530 Payerne · bernard.exemple@example.invalid · 079 000 00 19
Né le 12.03.1968

EXPÉRIENCE
2010 - aujourd'hui Directeur de production, Agroalimentaire Démo SA, Payerne
- Direction de 3 sites, 140 collaborateurs
- Certification IFS obtenue en 2014 et maintenue depuis
- Productivité augmentée de 15 % entre 2018 et 2023

1998 - 2010 Responsable de production, Fromagerie Fictive SA, Moudon
- Supervision de 45 collaborateurs

1990 - 1998 Chef d'équipe, Laiterie Exemple, Estavayer
- Supervision de l'équipe de nuit
- Contrôle des températures
- Nettoyage des installations
- Remplacement du responsable pendant les vacances

1986 - 1990 Ouvrier de production, Laiterie Exemple, Estavayer
- Conditionnement
- Chargement des camions
- Contrôle visuel des produits

1984 - 1986 Apprenti technologue en industrie laitière

FORMATION
1986 CFC de technologue en industrie laitière
2001 Diplôme fédéral de maître technologue

LANGUES
Français (langue maternelle), allemand (B2)`,
    defects: [
      { id: 'debut_carriere', desc: 'Postes de 1984-1998 trop détaillés par rapport à l\'expérience récente', patterns: ['ancien', 'debut de carriere', 'recent', 'condens', 'resum', 'synthe', 'alleg', '15 dernieres', '20 dernieres', '1980', '1990'] }
    ],
    qualities: [{ id: 'resultats', desc: 'Résultats (IFS, +15 %, 140 collaborateurs)', patterns: ['ifs', '15', '140', 'chiffr', 'certification'] }],
    forbidden: [
      { desc: 'Remarque discriminatoire sur l\'âge', patterns: ['trop (age|vieux)', 'proche de la retraite', 'votre age', 'cacher[^.]{0,30}age'], critical: true }
    ]
  },
  {
    id: 'cv20', label: 'Étudiant master — adresse e-mail non professionnelle', hasPhoto: false, scoreBand: [40, 70],
    text: `Yann Fictif
Étudiant en master de droit
1205 Genève · lebogossdu74@example.invalid · 078 000 00 20

FORMATION
2024 - 2026 Master en droit des affaires, Université fictive de Genève (en cours)
2021 - 2024 Bachelor en droit, Université fictive de Genève

EXPÉRIENCE
2024 - aujourd'hui Assistant juridique (20 %), Étude Exemple & Associés, Genève
- Recherches juridiques en droit des contrats
- Rédaction de notes internes

Étés 2022 et 2023 Stagiaire, Service juridique, Banque Démo SA, Genève

LANGUES
Français (langue maternelle), anglais (C1), allemand (B1)

DIVERS
Membre de l'association des étudiants en droit, moot court 2025 (demi-finaliste)`,
    defects: [
      { id: 'email', desc: 'Adresse e-mail non professionnelle', patterns: ['adresse (e-?mail|mail|electronique)', 'e-?mail[^.]{0,40}professionnel', 'lebogoss'] }
    ],
    qualities: [{ id: 'formation', desc: 'Parcours universitaire cohérent + emploi à temps partiel', patterns: ['master', 'droit', 'assistant juridique'] }],
    forbidden: [
      { desc: 'Invente un brevet d\'avocat', patterns: ['brevet d.avocat obtenu', 'titulaire du brevet'], critical: true }
    ]
  }
];

// CV utilisés pour le test de reproductibilité (3 exécutions chacun)
export const REPEAT_IDS = ['cv03', 'cv06', 'cv10', 'cv14', 'cv17'];
