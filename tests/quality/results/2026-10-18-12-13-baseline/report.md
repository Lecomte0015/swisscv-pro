# Mesure de la qualité de l'analyse — baseline

CV **synthétiques** uniquement (voir `tests/quality/cv-set.mjs`). Le pré-tri ci-dessous est automatique (mots-clés) : la note se fait à la main avec `tests/quality/rubric.md`.

Appels IA : 0 · jetons : 0 · coût estimé : 0.000 USD

## Synthèse automatique (1re exécution de chaque CV)

| Indicateur | Valeur |
|---|---|
| Analyses réussies | 20 / 20 |
| Défauts placés repérés (mots-clés) | 25 / 26 |
| Qualités reconnues (mots-clés) | 25 / 26 |
| CV avec motif d'erreur critique | 1 (cv18) |
| Score hors fourchette indicative | cv04, cv08, cv09, cv20 |
| hasPhoto conforme à la saisie | 20 / 20 |

## Reproductibilité (même CV, plusieurs exécutions)

| CV | Scores | Écart score | Scores ATS | Écart ATS |
|---|---|---|---|---|
| cv03 | 74 · 74 · 74 | 0 | 71 · 71 · 71 | 0 |
| cv06 | 62 · 62 · 62 | 0 | 58 · 58 · 58 | 0 |
| cv10 | 62 · 62 · 62 | 0 | 55 · 55 · 55 | 0 |
| cv14 | 78 · 82 · 82 | 4 | 72 · 78 · 78 | 6 |
| cv17 | 72 · 72 · 72 | 0 | 65 · 65 · 65 | 0 |

Comparer aussi à la main la **première amélioration** de chaque exécution (détail par CV ci-dessous).

## Détail par CV

### cv01 — Premier emploi — employée de commerce CFC

**Exécution 1** — score 58 (fourchette indicative 40-75) · ATS 62 · 23 s

Points forts :
- CFC d'employée de commerce complété en 2026, diplôme reconnu et valorisé sur le marché suisse romand
- Expérience d'apprentissage en fiduciaire cohérente avec la formation, incluant une exposition concrète à la comptabilité
- Multilinguisme mentionné (français, allemand, anglais), atout réel dans le contexte suisse
- Outils bureautiques de base (Word, Excel, Outlook) directement utilisables en entreprise

Améliorations :
- Ajouter une photo professionnelle : sur le marché suisse, une photo sobre et professionnelle est attendue et renforce la crédibilité du dossier
- Préciser les niveaux de langue selon le cadre CECR (ex. : allemand B1, anglais B2) — c'est un standard en Suisse et son absence peut désavantager la candidature face à des profils comparables
- Quantifier et détailler les missions en fiduciaire : remplacer des verbes vagues (« aide à la comptabilité ») par des résultats ou des volumes concrets (ex. : « saisie de 50 à 80 factures/semaine dans [logiciel] ») afin de se démarquer auprès des recruteurs ATS et humains
- Ajouter une phrase de profil ou accroche en tête de CV : en quelques lignes, résumer la valeur ajoutée (CFC obtenu, expérience fiduciaire, langues) aide le recruteur à positionner rapidement la candidate
- Mentionner les logiciels métier utilisés en fiduciaire (ex. : Abacus, Sage, Banana, ou autre) — ces noms sont des mots-clés recherchés dans les offres d'emploi comptabilité/administration en Suisse

Conseils suisses : Pour le marché suisse romand, ce CV présente une base sérieuse avec un CFC fraîchement obtenu et une expérience d'apprentissage en fiduciaire, mais plusieurs ajustements sont nécessaires pour maximiser les chances d'entretien. Photo : en Suisse, contrairement à la France ou au Royaume-Uni, il est d'usage courant d'inclure une photo professionnelle (tenue sobre, fond neutre, sourire naturel) — son absence peut être remarquée négativement. Langues : les niveaux CECR (A1 à C2) sont systématiquement attendus par les RH suisses et les systèmes ATS ; indiquer simplement 'allemand' sans niveau ne permet pas au recruteur d'évaluer l'utilisabilité réelle de la compétence. Informations personnelles : le format suisse standard inclut nom, adresse, téléphone, e-mail et date de naissance (facultative mais fréquente) ; un lien LinkedIn commence à être apprécié même pour les profils juniors. Format et longueur : pour un profil junior avec moins de 5 ans d'expérience, une page est idéale et suffisante — pas besoin de viser deux pages. Références : l'usage suisse est d'indiquer 'Références et certificats de travail disponibles sur demande' (Arbeitszeugnisse en allemand) sans lister les coordonnées directes de personnes tierces sur le CV. Mots-clés ATS : intégrer des termes du secteur visé (comptabilité, administration, facturation, logiciels comptables utilisés) améliore nettement la visibilité dans les portails de recrutement. Enfin, adapter la lettre de motivation (Bewerbungsschreiben) au poste visé reste essentiel en Suisse, où elle est encore très attendue même pour des profils juniors.

Mots-clés : CFC employée de commerce, apprentissage, fiduciaire, comptabilité, saisie de factures, accueil téléphonique, classement, Word, Excel, Outlook, français, allemand, anglais, administration, Lausanne

Pré-tri : défauts ✔ Langues sans niveau (CECR) · ✔ Tâches listées sans volume ni résultat | qualités ✔ CFC obtenu / apprentissage complet
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 50, 80, 5
Mots-clés absents du texte du CV : CFC employée de commerce, apprentissage, administration

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv02 — Junior IT — développeur 2 ans

**Exécution 1** — score 52 (fourchette indicative 45-75) · ATS 68 · 27 s

Points forts :
- Stack technique moderne et cohérente avec le marché : React, Node.js, TypeScript, Docker, AWS/GCP/Azure — couvre bien les attentes du marché romand pour un profil junior.
- Progression logique et rapide : stage de 7 mois suivi d'un premier poste en CDI dès septembre 2024, ce qui rassure les recruteurs sur l'employabilité du candidat.
- Présence d'un profil GitHub mentionné, signal positif pour un développeur — les recruteurs tech suisses apprécient pouvoir consulter du code.
- Formation HES reconnue en Suisse romande, bien perçue par les employeurs locaux pour les profils orientés pratique.

Améliorations :
- Les descriptions de poste sont trop vagues ('développement de fonctionnalités', 'correction de bugs') : reformuler avec des réalisations concrètes et si possible chiffrées (ex. 'refonte du module de paiement en React, réduction du temps de chargement de 40%'). C'est le principal levier pour décrocher un entretien.
- La liste de compétences est surdimensionnée pour un profil junior de 2 ans d'expérience : des technologies comme Kubernetes, Redis, GCP ou GraphQL nécessitent une justification dans les expériences. Supprimer ou regrouper les compétences non démontrées, au risque de perdre en crédibilité lors d'un entretien technique.
- Le niveau d'anglais est mentionné en B2 mais sans certification ni contexte d'utilisation : préciser si l'anglais a été utilisé en contexte professionnel ou académique. En Suisse, de nombreux postes tech exigent un anglais opérationnel — un niveau B2 actif bien argumenté est un atout.
- Ajouter une photo professionnelle : bien que non obligatoire, c'est fortement l'usage en Suisse et son absence peut être remarquée négativement par certains recruteurs suisses traditionnels.

Conseils suisses : Pour le marché suisse romand, ce CV présente une base correcte mais manque de substance dans les expériences. Voici les points clés à travailler : 

1. FORMAT ET LONGUEUR : une page est adaptée à ce niveau d'expérience (2 ans). Conserver ce format.

2. PHOTO : en Suisse, la photo professionnelle est une convention forte, notamment dans les secteurs traditionnels et les PME. Même dans la tech, elle est bien accueillie. Préférer un fond neutre, tenue soignée, expression naturelle.

3. INFORMATIONS PERSONNELLES : le CV suisse inclut traditionnellement la date de naissance et la nationalité/permis de travail — information importante pour l'employeur, notamment pour évaluer les démarches administratives éventuelles. Ces éléments sont absents ici.

4. LANGUES : le niveau CECR (B2) est bien indiqué pour l'anglais, c'est la norme suisse. S'assurer que le français est bien marqué comme langue maternelle (C2/langue maternelle). Dans certains secteurs genevois (banque, organisations internationales, tech multinationale), un anglais C1 est attendu — si le candidat approche ce niveau, c'est le moment de le mentionner ou de le travailler.

5. RÉFÉRENCES : ne pas lister de contacts directs sur le CV. La mention 'Références disponibles sur demande' est suffisante et conforme aux usages suisses. Les certificats de travail (attestations d'employeur) sont très importants en Suisse — s'assurer de les avoir obtenus pour chaque emploi et stage.

6. EXPÉRIENCES : c'est le point faible principal. Les recruteurs suisses s'attendent à des descriptions qui illustrent la valeur ajoutée concrète. Reformuler chaque poste avec la méthode STAR ou au minimum avec des verbes d'action et des résultats mesurables.

7. GITHUB : mentionner le lien GitHub est un bon réflexe — s'assurer que le profil est actif et que des projets sont visibles et documentés (README soignés), car certains recruteurs tech genevois le consultent réellement.

Mots-clés : JavaScript, TypeScript, React, Node.js, Python, Django, SQL, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Azure, GCP, Git, CI/CD, Jest, GraphQL, Redis, Linux, Agile, Scrum, développeur web, front-end, bachelor informatique de gestion, HES, Genève

Pré-tri : défauts ✔ Liste de 22 technologies sans contexte ni niveau · ✔ Tâches vagues (« développement de fonctionnalités ») | qualités ✔ Bachelor HES · ✔ Lien GitHub
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 7, 40, 4, 5, 6
Mots-clés absents du texte du CV : bachelor informatique de gestion

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv03 — Expérimenté logistique — dates qui se chevauchent

**Exécution 1** — score 74 (fourchette indicative 45-75) · ATS 71 · 27 s

Points forts :
- Résultat chiffré et concret : réduction des erreurs de préparation de 4 % à 1,5 % en 18 mois, ce qui démontre un impact mesurable sur la qualité opérationnelle.
- Encadrement d'une équipe de 12 personnes bien mis en avant, ce qui positionne clairement Marco comme chef d'équipe expérimenté et non simplement exécutant.
- Certifications pertinentes pour le marché suisse : Permis C et Permis cariste R489 cat. 3 et 5, directement valorisables dans les annonces logistique.
- Progression de carrière cohérente et lisible : aide-magasinier → magasinier → magasinier principal → chef d'équipe, ce qui rassure les recruteurs sur la montée en compétence.
- Niveaux de langues indiqués selon le cadre CECR (B1, A2), conformément aux attentes du marché suisse.

Améliorations :
- Chevauchement de postes 2017-2021 et 2015-2019 : Marco apparaît simultanément magasinier principal chez Transports Exemple Sàrl (2017-2021) et magasinier chez Distribution Démo SA (2015-2019). Ce chevauchement de deux ans (2017-2019) doit être clarifié — s'il s'agit d'un cumul d'emplois, il faut l'indiquer explicitement ; sinon, il convient de corriger les dates. Un ATS ou un recruteur attentif le remarquera immédiatement.
- L'expérience actuelle (2021-aujourd'hui) manque de contexte structurel : taille de l'entrepôt, volume traité, secteur d'activité. Ajouter une ligne contextuelle permettrait aux recruteurs de mieux évaluer la comparabilité avec leur propre environnement.
- Ajouter une photo professionnelle : bien que facultative, une photo de qualité est encore courante sur les CV suisses, en particulier pour des postes avec contact d'équipe. Elle humanise le dossier et peut faire la différence à dossier égal.

Conseils suisses : Ce CV est globalement bien structuré pour le marché suisse romand. Voici les points d'attention spécifiques : 

**Format et longueur** : Le CV tient sur une page, ce qui est acceptable pour un profil avec 16 ans d'expérience, mais une deuxième page structurée permettrait d'étoffer les missions et d'ajouter des éléments différenciants (outils, certifications complémentaires, formations continues). Deux pages sont tout à fait standard en Suisse à ce niveau d'expérience.

**Informations personnelles** : Les données de contact sont correctes. En Suisse, il est courant d'indiquer la nationalité ou le statut de séjour — le Permis C est mentionné parmi les permis cariste, mais il serait préférable de le distinguer clairement dans une section dédiée ou dans l'en-tête (ex. : « Nationalité : [pays] — Permis de séjour C »), car c'est une information que les RH suisses cherchent activement.

**Langues** : Le cadre CECR est correctement utilisé (B1 allemand, A2 italien). Pour un poste en Valais avec des interactions potentielles en allemand (Haut-Valais), le niveau B1 est honnête mais pourrait être un frein pour certains employeurs. Il est conseillé de mentionner si Marco suit une formation ou s'il a une expérience pratique de l'allemand en contexte professionnel.

**Photo** : L'absence de photo est un choix valide, mais en Suisse — notamment dans les secteurs opérationnels et logistiques — une photo professionnelle sobre est encore répandue et généralement appréciée. Si Marco choisit d'en ajouter une, elle doit être récente, sur fond neutre, en tenue professionnelle.

**Références** : Aucune mention de références. La pratique suisse recommande d'indiquer « Références et certificats de travail disponibles sur demande » (Arbeitszeugnisse). Les certificats de travail (obligatoires en Suisse) sont un élément central du dossier de candidature et doivent être préparés pour chaque poste.

**Chevauchement de dates** : Le point le plus urgent à corriger avant tout envoi (voir improvements).

Mots-clés : chef d'équipe logistique, encadrement d'équipe, entrepôt, magasinier, préparation de commandes, gestion des stocks, SAP, scan systématique, réception marchandises, contrôle qualité, permis cariste, R489, catégorie 3, catégorie 5, permis C, CFC logisticien, français, allemand B1, italien A2, Valais, Sion, logistique

Pré-tri : défauts ✔ Postes 2015-2019 et 2017-2021 se chevauchent sans explication | qualités ✔ Résultat chiffré (erreurs 4 % → 1,5 %) · ✔ Encadrement de 12 personnes
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 16
Mots-clés absents du texte du CV : encadrement d'équipe, réception marchandises, contrôle qualité, catégorie 3, catégorie 5, CFC logisticien, allemand B1, italien A2, Valais

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 74 (fourchette indicative 45-75) · ATS 71 · 27 s
- 1re amélioration : Chevauchement temporel à corriger : le poste de magasinier principal chez Transports Exemple (2017–2021) et celui de magasinier chez Distribution Démo SA (2015–2019) se superposent sur 2017–2019. Ce type d'incohérence chronologique est un signal d'alarme pour les recruteurs et les ATS — vérifiez et corrigez les dates.

**Exécution 3** — score 74 (fourchette indicative 45-75) · ATS 71 · 24 s
- 1re amélioration : Chevauchement de postes (2017–2021 chez Transports Exemple Sàrl et 2015–2019 chez Distribution Démo SA) : deux emplois simultanés sur 2017–2019 sans explication peuvent troubler un recruteur. Si c'était un cumul réel, le préciser brièvement ; sinon, vérifier et corriger les dates.

### cv04 — Cadre finance — CV très dense de 3 pages (photo déclarée)

**Exécution 1** — score 88 (fourchette indicative 50-80) · ATS 79 · 28 s

Points forts :
- Parcours CFO extrêmement solide et cohérent sur plus de 20 ans, avec une progression logique et lisible depuis l'audit jusqu'à la direction financière d'un groupe de 450 MCHF — profil senior de premier plan pour le marché suisse.
- Réalisations quantifiées et concrètes : refinancement de 120 MCHF, intégration de deux acquisitions en Allemagne et Pologne, réduction du délai de clôture de 12 à 6 jours — exactement ce qu'attendent les recruteurs et les conseils d'administration suisses.
- Double compétence normes suisses (Swiss GAAP RPC) et internationales (IFRS), combinée au diplôme fédéral d'expert-comptable — certification très valorisée en Suisse et quasi incontournable à ce niveau de responsabilité.
- Trilinguisme français / allemand C1 / anglais C1 parfaitement adapté au marché suisse alémanique et aux groupes internationaux basés à Zurich.
- Couverture fonctionnelle complète de la fonction CFO (trésorerie, fiscalité, M&A, contrôle de gestion, ERP, consolidation, relation banques et auditeurs) sans lacune apparente.

Améliorations :
- Les descriptions de poste, en particulier celle du poste actuel chez Groupe Industriel Fictif AG, sont rédigées en blocs de texte continus très denses et difficiles à parcourir rapidement. Restructurer chaque poste en liste à puces courtes (3 à 6 points) pour améliorer la lisibilité humaine et la lisibilité ATS, en isolant clairement chaque réalisation.
- Le profil d'introduction est un seul paragraphe de plus de 80 mots sans ponctuation forte ni structure — il doit être raccourci à 4 à 6 lignes maximum et orienté valeur ajoutée immédiate, en supprimant les formulations génériques ('en veillant constamment', 'tout en garantissant') au profit de 2 ou 3 différenciateurs concrets.
- Les compétences listées en vrac ('IFRS, SAP S/4HANA, Power BI…') gagneraient à être organisées en sous-catégories (Normes et reporting / Outils et systèmes / Compétences managériales et stratégiques) pour faciliter la lecture par un DRH ou un chasseur de tête, et améliorer le score ATS par une meilleure correspondance sémantique aux offres.

Conseils suisses : Ce CV est d'un excellent niveau pour le marché suisse dans la tranche CFO / directeur financier senior. Quelques points d'attention spécifiques au contexte helvétique : (1) Informations personnelles — la date de naissance (1975) et la nationalité suisse sont indiquées, ce qui est courant et bien accepté en Suisse, notamment à ce niveau de responsabilité où les conseils d'administration apprécient ces éléments dès le premier document. (2) Langues — les niveaux CECR (C1 pour l'allemand et l'anglais) sont correctement indiqués, ce qui est la norme attendue sur le marché suisse ; veillez à préciser si votre allemand est opérationnel en contexte de conseil d'administration (Verwaltungsrat), car c'est un critère différenciant pour un CFO basé à Zurich. (3) Format et longueur — le CV tient sur deux pages, ce qui est le standard suisse pour un profil senior ; ne pas chercher à le compresser en une seule page, ce serait contre-productif à ce niveau. (4) Certificats de travail — le marché suisse accorde une importance particulière aux Arbeitszeugnisse ; mentionner en bas de CV 'Certificats de travail disponibles sur demande' renforce la crédibilité du dossier, surtout pour un profil ayant changé plusieurs fois d'employeur. (5) Références — la formule 'Références disponibles sur demande' est l'usage correct en Suisse ; ne pas inscrire de coordonnées directes sur le CV. (6) Le diplôme fédéral d'expert-comptable est un signal fort et bien reconnu ; s'assurer qu'il figure en tête de la section Formation, éventuellement avec la mention 'brevet fédéral / diplôme fédéral' pour les lecteurs non francophones dans un contexte alémanique.

Mots-clés : CFO, Directrice financière, IFRS, Swiss GAAP RPC, consolidation, contrôle de gestion, trésorerie, fiscalité, M&A, fusions-acquisitions, SAP S/4HANA, ERP, Power BI, Excel, reporting consolidé, due diligence, refinancement, gestion des risques, conduite du changement, expert-comptable diplômée, diplôme fédéral, budget, prévisions, audit, intégration post-acquisition, management d'équipe, multilinguisme, français, allemand, anglais

Pré-tri : défauts ✔ Paragraphes très longs, CV trop dense | qualités ✔ Résultats chiffrés (clôture 12 → 6 jours, refinancement 120 MCHF) · ✔ Expert-comptable diplômée
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 80, 5
Mots-clés absents du texte du CV : intégration post-acquisition, management d'équipe, multilinguisme

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv05 — Reconversion — boulanger devenu développeur web

**Exécution 1** — score 52 (fourchette indicative 40-70) · ATS 58 · 21 s

Points forts :
- Reconversion professionnelle bien structurée et cohérente : le lien entre l'expérience en boulangerie (gestion d'équipe, commandes) et les compétences en développement web (site de réservation pour boulangerie) est logique et valorisant.
- Présence de projets concrets et réels, dont un en ligne depuis mars 2025, ce qui compense le manque d'expérience professionnelle formelle en développement.
- Expérience de management (équipe de 4 personnes) et de gestion opérationnelle transférable, appréciée des employeurs suisses.
- Stack technique moderne et pertinente pour le marché (React, Node.js, Python) mentionnée directement dans les projets.

Améliorations :
- Ajouter une accroche professionnelle (3-4 lignes) en tête de CV explicitant la reconversion, le niveau actuel en développement web et la valeur ajoutée apportée : sans cela, un recruteur ATS ou humain risque de ne pas comprendre immédiatement le profil.
- Étoffer la section Projets avec des détails mesurables : nombre d'utilisateurs, lien URL du site en ligne, fonctionnalités clés, contexte (projet solo ou collaboratif) — c'est la section la plus décisive pour un junior sans expérience pro en dev.
- Indiquer les niveaux de langue selon le cadre européen CECR (ex. : allemand B1) — c'est une attente standard sur le marché suisse, notamment pour les postes bilingues en région fribourgeoise.
- Ajouter une photo professionnelle : en Suisse, la photo sur le CV est encore très courante et son absence peut être remarquée défavorablement, surtout pour un profil en reconversion cherchant à inspirer confiance.

Conseils suisses : Pour le marché suisse, plusieurs éléments méritent attention. D'abord, la photo professionnelle : bien qu'elle ne soit pas obligatoire légalement, elle reste très attendue en Suisse romande et alémanique, particulièrement pour un profil en reconversion qui a intérêt à humaniser sa candidature dès le premier coup d'œil. Une photo sobre en tenue professionnelle est recommandée. Ensuite, les informations personnelles : le CV actuel contient l'adresse, l'email et le téléphone, ce qui est correct. La date de naissance n'est pas obligatoire mais reste fréquemment incluse en Suisse — à votre discrétion. Pour les langues, le marché suisse — et plus encore le canton de Fribourg, officiellement bilingue — est très attentif aux niveaux CECR explicites (A1 à C2) : indiquez clairement votre niveau d'allemand (probablement B1 ou B2 d'après 'bonnes connaissances'). Si vous maîtrisez d'autres langues même partiellement, mentionnez-les. Concernant le format, deux pages sont tout à fait acceptables en Suisse pour un profil avec plus de 10 ans d'expérience totale, mais une seule page bien remplie est préférable pour un junior en reconversion — l'essentiel est la clarté et la hiérarchisation. La section Expérience boulangerie peut être condensée pour laisser plus de place aux projets tech. Enfin, pour les références, la pratique suisse standard est d'indiquer 'Références et certificats de travail disponibles sur demande' (Arbeitszeugnis) — ne listez jamais les coordonnées directes d'anciens employeurs sur un CV diffusé largement.

Mots-clés : développeur web, full-stack, React, Node.js, Python, SQLite, bootcamp, reconversion professionnelle, gestion d'équipe, chef boulanger, site de réservation, gestion de stock, Fribourg, français, allemand

Pré-tri : défauts ✔ Aucune accroche expliquant la reconversion · ✘ Compétences transférables non mises en valeur | qualités ✔ Projets concrets en ligne
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 10
Mots-clés absents du texte du CV : reconversion professionnelle, gestion d'équipe

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv06 — Interruption de carrière de 4 ans non expliquée

**Exécution 1** — score 62 (fourchette indicative 40-70) · ATS 58 · 21 s

Points forts :
- Expérience actuelle quantifiée avec des données concrètes : 3 clients en gestion de réseaux sociaux et newsletter à 4 000 abonnés, ce qui donne une mesure claire de l'impact.
- Parcours cohérent dans le domaine de la communication et du marketing sur plus de 10 ans, avec une progression logique des responsabilités.
- Niveaux de langues indiqués selon le cadre CECR (C2, B2, B1), conformément aux attentes du marché suisse.
- Ancrage géographique clair (Vevey/Montreux/Lausanne) pertinent pour le marché romand.

Améliorations :
- GAP non expliqué de juillet 2019 à février 2023 (3,5 ans) : cette interruption significative sera systématiquement remarquée par les recruteurs suisses. Il est fortement recommandé de l'expliquer brièvement sur le CV (congé parental, formation, indépendant, raison personnelle, etc.) ou dans la lettre de motivation, pour éviter qu'elle ne génère des doutes à la première lecture.
- Le poste de 2012 à 2014 (Fictif SA) est vide de tout contenu : aucune mission, aucun résultat. Même deux lignes de description permettraient de valoriser cette expérience et d'améliorer la lisibilité ATS.
- Absence de photo professionnelle : en Suisse, notamment en Romandie et pour un profil orienté communication/marketing, la photo est largement attendue et son absence peut surprendre. Ajouter une photo sobre et professionnelle est recommandé.
- Aucune mention de certificats de travail (équivalents de l'Arbeitszeugnis en Suisse) ni de la formule 'Références disponibles sur demande', deux éléments valorisés sur le marché suisse.

Conseils suisses : Pour le marché suisse romand, ce CV présente une base solide mais nécessite quelques ajustements importants. En premier lieu, le gap de 3,5 ans (2019–2023) est le point le plus sensible : les recruteurs suisses sont attentifs à la continuité du parcours et une interruption de cette durée sans explication risque de bloquer la candidature dès la présélection. Une ligne d'explication sur le CV ou un paragraphe dans la lettre de motivation suffira à lever toute ambiguïté. Sur la forme, le CV tient vraisemblablement sur une page, ce qui est approprié ; deux pages sont acceptées en Suisse pour des profils avec plus de 10 ans d'expérience. La mention des niveaux de langue selon le CECR est correcte et conforme aux standards suisses. L'absence de photo est notable : en Romandie comme dans la majorité des cantons suisses, une photo professionnelle est attendue sur un CV, tout particulièrement dans les métiers de la communication. Il est conseillé d'en ajouter une. Concernant les références, la pratique suisse recommande d'indiquer 'Références et certificats de travail disponibles sur demande' plutôt que de lister des coordonnées de tiers. Le taux d'activité (60 %) est bien mentionné, ce qui est une bonne pratique en Suisse. Enfin, pour améliorer la compatibilité ATS, il serait utile d'enrichir les mots-clés métier : marketing digital, stratégie de contenu, SEO, outils de gestion de réseaux sociaux (ex. Hootsuite, Meta Business Suite), emailing, etc.

Mots-clés : assistante marketing, communication, réseaux sociaux, newsletter, rédaction, événementiel, relations médias, Bachelor communication, HES, français C2, anglais B2, allemand B1, Vevey, Montreux, Lausanne, Romandie

Pré-tri : défauts ✔ Période 06.2019 - 03.2023 sans explication | qualités ✔ Chiffres concrets (4 000 abonnés, 15 événements)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 10, 2019, 2023, 3.5
Mots-clés absents du texte du CV : événementiel, relations médias, Bachelor communication, français C2, anglais B2, allemand B1, Romandie

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 62 (fourchette indicative 40-70) · ATS 58 · 20 s
- 1re amélioration : Ajouter une photo professionnelle : sur le marché suisse, une photo soignée est fortement attendue et son absence peut nuire à la candidature.

**Exécution 3** — score 62 (fourchette indicative 40-70) · ATS 58 · 18 s
- 1re amélioration : Lacune non expliquée de 2019 à 2023 : une interruption de 4 ans est significative et mérite une brève mention (formation, raisons personnelles, freelance, etc.) — les recruteurs suisses la remarqueront et se poseront la question

### cv07 — CV très court

**Exécution 1** — score 32 (fourchette indicative 10-45) · ATS 28 · 26 s

Points forts :
- Stabilité professionnelle notable : poste de magasinier tenu depuis 2019 chez le même employeur, soit plus de 7 ans, ce qui témoigne de fiabilité et de loyauté.
- Bilinguisme français-portugais : un atout concret dans un marché suisse multiculturel, notamment dans la logistique et les entrepôts.
- Permis de conduire B : compétence pratique directement valorisable dans les métiers de la logistique, livraison ou gestion de stocks.
- Expérience terrain solide dans la chaîne logistique, domaine en demande constante en Suisse.

Améliorations :
- Détailler les missions et responsabilités chez Exemple SA : gestion des stocks, réception/expédition de marchandises, utilisation de chariots élévateurs, logiciels de gestion (WMS/ERP), volumes traités. Sans ces précisions, le CV ne se distingue pas face à la concurrence.
- Préciser les 'divers emplois' antérieurs à 2019 : indiquer au minimum les secteurs, types de postes et durées approximatives. Un historique flou inquiète les recruteurs suisses habitués aux parcours traçables.
- Ajouter les niveaux de langue selon le cadre européen CECR (ex. : français C2/langue maternelle, portugais C1) et mentionner toute autre langue même partielle (allemand de base, anglais), très valorisée sur le marché suisse.
- Ajouter une photo professionnelle : bien que non obligatoire, elle est fortement attendue sur les CV suisses et son absence peut nuire à l'impression générale.
- Enrichir le CV avec des compétences techniques concrètes : CACES/permis cariste, logiciels utilisés, manutention de charges, normes de sécurité entrepôt, etc.

Conseils suisses : Pour le marché suisse, ce CV nécessite une refonte significative avant d'être envoyé. Voici les points clés :

**Format et structure** : Le CV suisse standard fait 1 à 2 pages maximum, avec une mise en page claire et professionnelle. Les informations personnelles attendues incluent : nom complet, adresse postale complète (rue, NPA, localité), numéro de téléphone, adresse e-mail professionnelle (l'adresse actuelle 'example.invalid' doit être remplacée), et date de naissance (usage courant en Suisse, bien que non obligatoire). Une photo professionnelle (format identité, fond neutre, tenue soignée) est fortement recommandée : la grande majorité des CV suisses en comportent une et son absence peut être remarquée négativement.

**Langues** : Les recruteurs suisses s'attendent à voir les langues avec un niveau CECR précis (A1 à C2). Avec des postes dans des cantons francophones, le français C2 est acquis, mais toute notion d'allemand ou d'anglais — même basique — doit être mentionnée car elle constitue un avantage compétitif réel.

**Expérience professionnelle** : Le poste actuel de magasinier dure depuis plus de 7 ans, ce qui est positif, mais sans description des tâches, cette durée ne convainc pas. Les recruteurs suisses s'attendent à des détails concrets : types de marchandises, volume de stock, outils utilisés, responsabilités spécifiques. Les emplois antérieurs vagues ('divers emplois') sont un signal d'alerte — il faut les nommer, même brièvement.

**Formation** : L'école obligatoire seule est un point faible sur le marché suisse. Il est conseillé de mentionner tout cours, formation continue, certificat ou attestation obtenus depuis, y compris des formations internes chez l'employeur actuel. Si une formation de type CFC (Certificat Fédéral de Capacité) a été suivie, elle doit absolument apparaître.

**Références** : Ne jamais inscrire les coordonnées directes d'anciens responsables sur un CV. L'usage correct en Suisse est d'indiquer 'Références disponibles sur demande' et de préciser la disponibilité de certificats de travail (Arbeitszeugnisse), documents très importants dans le processus de recrutement suisse.

**Candidature** : En Suisse, il est attendu de joindre les copies de certificats de travail et de diplômes dès l'envoi de candidature, contrairement à d'autres pays où ces documents sont remis plus tard.

Mots-clés : magasinier, logistique, gestion des stocks, permis B, français, portugais, entrepôt, manutention

Pré-tri : défauts ✔ CV très incomplet (pas de détails, pas de téléphone, pas de lieu) · ✔ « Divers emplois » sans précision
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 7
Mots-clés absents du texte du CV : logistique, gestion des stocks, permis B, entrepôt, manutention

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv08 — Mal structuré — ordre et rubriques mélangés

**Exécution 1** — score 62 (fourchette indicative 30-60) · ATS 38 · 24 s

Points forts :
- Parcours cohérent et progressif dans l'administration et l'accueil sur plus de 10 ans, montrant une vraie spécialisation
- Expérience actuelle en hôtellerie (check-in, réservations, gestion des plaintes) directement valorisable sur le marché suisse romand
- Compétence spécifique en facturation TARMED, rare et appréciée dans le secteur médical et parahospitalier
- Stabilité professionnelle rassurante : aucune interruption significative entre les postes

Améliorations :
- Restructurer le CV avec un ordre chronologique clair et des sections bien délimitées (Expériences professionnelles, Formation, Compétences) : en l'état, les postes sont présentés dans le désordre, ce qui nuit fortement à la lisibilité et à la compatibilité ATS
- Quantifier et enrichir les descriptions de poste : remplacer les listes vagues ('accueil et courrier', 'check-in, réservations') par des réalisations concrètes avec chiffres si possible (ex. : 'gestion de l'accueil pour un hôtel de 80 chambres', 'agenda de 5 médecins', 'traitement de X factures TARMED par mois')
- Préciser le niveau des langues selon le cadre européen CECR (A1 à C2) : 'anglais un peu' n'est pas utilisable par un recruteur suisse — indiquer B1, A2, etc. ; ajouter toute autre langue même partielle (allemand, italien) car elles ont une très forte valeur en Suisse
- Ajouter une photo professionnelle : en Suisse, la photo est attendue et son absence peut être perçue négativement, surtout pour des postes d'accueil et de contact clientèle
- Remplacer la phrase d'accroche générique ('j'aime le contact humain et je suis motivée') par un bref profil professionnel factuel de 2-3 lignes résumant l'expérience, la spécialité et la valeur ajoutée pour l'employeur

Conseils suisses : Pour le marché suisse romand, ce CV nécessite une mise en forme professionnelle avant tout envoi. Voici les points clés : (1) Format et structure : le CV doit impérativement être réorganisé avec des sections claires et une chronologie inversée (poste le plus récent en premier). En Suisse, 1 à 2 pages sont la norme selon l'expérience ; avec 10 ans de parcours, 2 pages bien structurées sont tout à fait acceptables. (2) Informations personnelles : inclure ville et canton suffit pour la localisation — l'adresse complète n'est pas indispensable. La nationalité et le permis de travail (si pertinent) peuvent être mentionnés. (3) Photo professionnelle : fortement recommandée en Suisse, particulièrement pour des postes d'accueil et de réception où la présentation est un critère explicite. Une photo sobre, professionnelle, sur fond neutre est attendue. (4) Langues : le niveau CECR est indispensable. 'Anglais un peu' doit être remplacé par un niveau précis (ex. A2 ou B1). Toute compétence en allemand ou en italien doit absolument être mentionnée, même passive, car la Suisse est un pays multilingue et cela constitue un avantage décisif. (5) Références : la mention 'références sur demande' est correcte et conforme à l'usage suisse. Il est également utile de préciser que des certificats de travail (attestations ou certificats employeurs) sont disponibles — ce document est très important dans la culture RH suisse et les recruteurs peuvent en faire la demande. (6) Compétences informatiques : mentionner uniquement 'Excel Word' est insuffisant — préciser le niveau (intermédiaire, avancé) et ajouter tout logiciel métier utilisé (logiciel de gestion hôtelière, logiciel de cabinet médical, Outlook, etc.).

Mots-clés : réceptionniste, secrétaire, assistante administrative, accueil, check-in, réservations, gestion des plaintes, facturation TARMED, agenda médecins, courrier, Excel, Word, CFC employée de bureau, hôtellerie, cabinet médical, immobilier, contact humain, français, anglais

Pré-tri : défauts ✔ Pas de rubriques claires, chronologie dans le désordre · ✔ « anglais un peu » | qualités ✔ Compétence métier spécifique (facturation TARMED)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 10, 80, 5, 4, 6
Mots-clés absents du texte du CV : agenda médecins, hôtellerie

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv09 — PDF à deux colonnes — texte extrait mélangé

**Exécution 1** — score 74 (fourchette indicative 35-70) · ATS 68 · 23 s

Points forts :
- Expérience solide en gestion de projet IT dans le secteur bancaire suisse, avec un projet de migration core banking à fort impact (8 MCHF, 40 personnes) — chiffres concrets très appréciés des recruteurs
- Double certification reconnue : PMP (2019) et Scrum mentionné dans les compétences, combinaison valorisée sur le marché suisse IT
- Profil trilingue (FR C2 / EN C1 / DE B2) avec niveaux CECR explicités, ce qui est exactement ce qu'attendent les recruteurs suisses
- Progression logique et lisible : analyste métier → chef de projet, sur une durée cohérente avec une montée en responsabilités crédible
- Ancrage géographique clair (Lausanne) et expérience dans deux secteurs clés de l'économie romande (banque et assurance)

Améliorations :
- Ajouter une photo professionnelle : bien que non obligatoire légalement, une photo est encore très largement attendue sur les CV suisses, en particulier en Romandie — son absence peut surprendre certains recruteurs traditionnels du secteur bancaire
- Étoffer les réalisations du poste d'analyste métier (2015–2020) avec au moins un résultat mesurable : délais tenus, économies générées, satisfaction utilisateur, etc. — le poste actuel montre l'exemple avec ses chiffres, mais le poste précédent reste trop vague pour convaincre
- Préciser si la certification PMP est toujours active (le PMI exige un renouvellement tous les 3 ans via PDUs) — pour un recruteur attentif, une certification de 2019 non mentionnée comme renouvelée peut soulever une question en 2026

Conseils suisses : Ce CV est globalement bien positionné pour le marché suisse romand. Voici les points d'attention spécifiques au contexte helvétique : (1) Photo : bien que la loi suisse ne l'impose pas, la très grande majorité des CV envoyés en Suisse incluent une photo professionnelle de qualité — son absence peut être perçue comme une lacune dans les secteurs bancaire et assurantiel, particulièrement conservateurs. Une photo sobre, en tenue professionnelle, sur fond neutre est recommandée. (2) Informations personnelles : le CV contient l'essentiel (nom, ville, téléphone, email), ce qui est suffisant. Il n'est pas nécessaire d'ajouter date de naissance, nationalité ou état civil — ces informations sont facultatives et de moins en moins attendues. (3) Langues avec niveaux CECR : c'est fait correctement, c'est un point fort. (4) Format et longueur : une page est acceptable pour un profil de cette ancienneté, mais deux pages seraient tout à fait admises et permettraient de développer les réalisations — en Suisse, deux pages bien remplies sont souvent mieux perçues qu'une page trop dense ou trop épurée. (5) Références : ne pas mentionner de noms, téléphones ou emails d'anciens supérieurs directement sur le CV — c'est contraire aux usages suisses et pose un problème de consentement. La formule correcte est 'Références et certificats de travail disponibles sur demande'. Les certificats de travail (équivalents des 'Arbeitszeugnisse') sont très importants en Suisse : mentionner qu'ils sont disponibles est un signal positif. (6) Secteur : le profil bancaire lausannois est très recherché, notamment autour de l'arc lémanique. Mettre davantage en avant la dimension réglementaire ou de conformité si elle a été touchée lors de la migration core banking renforcerait encore l'attractivité du profil.

Mots-clés : Chef de projet IT, Gestion de projet, Migration core banking, Prince2, Scrum, PMP, Jira, Confluence, Analyste métier, Secteur bancaire, Assurance, Budget projet, Lausanne, Master HEC, Français C2, Anglais C1, Allemand B2

Pré-tri : défauts ✔ Mise en page en deux colonnes mal lue par les logiciels de tri | qualités ✔ Projet chiffré (8 MCHF, 40 personnes) · ✔ Certification PMP
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 2026, 4, 5, 6
Mots-clés absents du texte du CV : Migration core banking, Secteur bancaire, Budget projet, Français C2, Anglais C1, Allemand B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv10 — Administratif — fautes d'orthographe

**Exécution 1** — score 62 (fourchette indicative 40-70) · ATS 55 · 25 s

Points forts :
- Expérience solide et continue de plus de 7 ans comme assistante de direction dans le secteur associatif genevois, ce qui est valorisé sur le marché suisse romand
- Connaissance d'Abacus, logiciel de comptabilité très répandu en Suisse, constitue un atout différenciateur réel
- Parcours cohérent avec une progression logique de secrétaire à assistante de direction
- Double formation reconnue (CFC + diplôme ESA) correspondant aux attentes du marché suisse pour ce type de poste
- Expérience concrète de la gouvernance associative (procès-verbaux du conseil de fondation) appréciée dans le tissu institutionnel genevois

Améliorations :
- Corriger les fautes d'orthographe et de frappe qui nuisent à la crédibilité : 'PROFESSIONELLE' (→ PROFESSIONNELLE), 'Microsft Ofice' (→ Microsoft Office), 'directeur générale' (→ directeur général), 'Organistion' (→ Organisation), 'procès-verbals' (→ procès-verbaux), '6 par ans' (→ 6 par an). Pour un poste où la rédaction est au cœur des missions, ces erreurs sont particulièrement pénalisantes.
- Quantifier et enrichir les descriptions de poste : le CV ne donne aucune idée de l'envergure du rôle (taille de l'organisation, volume de courriers, nombre de collaborateurs supportés, budget géré). Ajouter des chiffres concrets augmente significativement l'impact auprès des recruteurs.
- Préciser le niveau d'anglais avec le format CECR standard (B2) déjà indiqué, mais envisager de mentionner si une certification Cambridge ou autre valide ce niveau — en l'absence de certification, les recruteurs suisses restent parfois sceptiques sur l'auto-évaluation. Ajouter également toute autre langue même partielle (allemand, espagnol) car le multilinguisme est très valorisé à Genève.
- Ajouter une photo professionnelle : bien que non obligatoire, la photo reste la norme sur les CV suisses romands, en particulier pour les postes de face-à-face avec direction et partenaires. Une photo soignée renforce la première impression.

Conseils suisses : Pour le marché suisse romand, ce CV nécessite plusieurs ajustements avant envoi. En priorité absolue : les fautes d'orthographe (notamment dans le titre de section et dans les outils informatiques) doivent être corrigées — pour une assistante de direction dont la rédaction est le cœur de métier, elles peuvent conduire à un rejet immédiat du dossier. Concernant les informations personnelles, le CV inclut bien l'adresse, le téléphone et l'e-mail, ce qui est conforme aux usages suisses ; l'ajout de la nationalité et du permis de séjour (si non-ressortissante suisse/UE) peut être utile mais reste optionnel. La date de naissance n'est plus systématiquement attendue. Sur le format, le CV tient sur une page, ce qui est acceptable pour ce niveau d'expérience, mais une mise en page plus structurée avec des rubriques visuellement distinctes améliorerait la lisibilité et la compatibilité ATS. Concernant les langues, les recruteurs genevois apprécient que les niveaux CECR soient indiqués (déjà fait pour l'anglais), et toute compétence en allemand ou en italien, même basique, devrait absolument figurer — Genève est multilingue et même un niveau A2 en allemand mérite d'être mentionné. Sur la photo : elle n'est pas juridiquement obligatoire mais reste très courante sur les CV suisses ; pour un poste d'assistante de direction impliquant une forte représentation, une photo professionnelle est recommandée. Concernant les références, ne jamais indiquer les coordonnées directes d'anciens supérieurs sur le CV ; la formule 'Références et certificats de travail disponibles sur demande' est l'usage correct en Suisse — les certificats de travail (Arbeitszeugnis) sont particulièrement importants et doivent être prêts à être fournis.

Mots-clés : assistante de direction, secrétaire, gestion d'agenda, conseil de fondation, procès-verbaux, courriers juridiques, gestion des délais, Microsoft Office, Word, Excel, PowerPoint, Abacus, CFC employée de commerce, diplôme assistante de direction, ESA, français, anglais B2, Genève, fondation, étude d'avocats

Pré-tri : défauts ✔ Fautes d'orthographe (professionelle, organistion, procès-verbals, Microsft Ofice) | qualités ✔ Diplôme d'assistante de direction
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 7
Mots-clés absents du texte du CV : gestion d'agenda, procès-verbaux, Microsoft Office, CFC employée de commerce, diplôme assistante de direction, anglais B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 62 (fourchette indicative 40-70) · ATS 55 · 23 s
- 1re amélioration : Corriger les fautes d'orthographe et coquilles présentes dans le CV ('directeur générale' → 'directeur général', 'Organistion' → 'Organisation', 'procès-verbals' → 'procès-verbaux', '6 par ans' → '6 par an', 'Microsft Ofice' → 'Microsoft Office') : ces erreurs sont particulièrement dommageables pour un poste où la qualité rédactionnelle est une compétence clé.

**Exécution 3** — score 62 (fourchette indicative 40-70) · ATS 55 · 24 s
- 1re amélioration : Corriger les fautes d'orthographe et de typographie qui nuisent à la crédibilité : 'directeur générale' → 'directeur général', 'Organistion' → 'Organisation', 'procès-verbals' → 'procès-verbaux', 'Microsft Ofice' → 'Microsoft Office', '6 par ans' → '6 par an'. Pour un poste exigeant rigueur rédactionnelle, ces erreurs peuvent éliminer la candidature dès la première lecture.

### cv11 — Commercial — résultats chiffrés, aucune langue

**Exécution 1** — score 74 (fourchette indicative 55-85) · ATS 68 · 24 s

Points forts :
- Résultats chiffrés concrets et percutants : croissance du CA de 6,2 à 7,3 MCHF (+18 %) en 3 ans, directement quantifiable par un recruteur ou un ATS
- Brevet fédéral de spécialiste de vente : titre reconnu et valorisé sur le marché suisse, cohérent avec le niveau Key Account Manager
- Expérience sectorielle ciblée et pertinente : 9 ans dans la distribution de matériel médical, portefeuille de 45 cliniques/hôpitaux et signature de contrats cadres cantonaux, ce qui est très spécifique et différenciant
- Ancrage géographique bilingue (Tessin + Suisse alémanique) : atout fort pour les employeurs romands ou tessinois cherchant une couverture nationale
- Distinction concrète : Meilleur vendeur régional 2018, preuve de performance individuelle reconnue

Améliorations :
- Ajouter les niveaux de langues au format CECR (ex. : Italien C2 langue maternelle, Français C1, Allemand B2, Anglais B1) : indispensable pour le marché suisse, surtout pour un profil couvrant le Tessin et la Suisse alémanique — l'absence totale de section langues est un signal négatif fort pour les recruteurs suisses
- Ajouter une photo professionnelle : en Suisse, une photo est attendue sur le CV, son absence peut surprendre les recruteurs locaux — choisir un portrait sobre sur fond neutre en tenue professionnelle
- Enrichir la section Compétences pour améliorer la lisibilité ATS : ajouter des mots-clés sectoriels précis comme 'dispositifs médicaux', 'MedTech', 'gestion de comptes stratégiques', 'appels d'offres publics (LMP/AIMP)', 'CRM Salesforce' — le CV actuel est pauvre en termes indexables par les systèmes ATS

Conseils suisses : Ce CV présente une base solide pour le marché suisse, notamment grâce à ses résultats quantifiés et à son titre fédéral. Voici les points d'attention spécifiques au marché helvétique : (1) Langues CECR : la Suisse attend systématiquement les niveaux de langue selon le cadre européen commun de référence (A1 à C2). Un profil couvrant le Tessin et la Suisse alémanique sans mentionner ses niveaux en italien, allemand et français est perçu comme incomplet — c'est le premier ajustement à faire. (2) Photo : contrairement à la France ou aux pays anglophones, la photo professionnelle reste la norme en Suisse. Son absence n'est pas rédhibitoire mais peut surprendre. Un portrait sobre et professionnel est recommandé. (3) Informations personnelles : le CV suisse inclut généralement la date de naissance et la nationalité, parfois le permis de travail si applicable — ces éléments rassurent les RH sur l'éligibilité administrative du candidat. (4) Format et longueur : pour un profil de 9 ans d'expérience, une à deux pages sont acceptables. Le CV actuel est concis, ce qui est bien, mais la section compétences mériterait d'être étoffée. (5) Références : ne pas inscrire de noms et coordonnées de contacts sur le CV (problème de consentement et usage non standard en Suisse). Préférer la mention 'Références disponibles sur demande' et préciser que des certificats de travail (Arbeitszeugnis) sont disponibles — ce document est central dans le processus de recrutement suisse et doit être mentionné. (6) Positionnement sectoriel : le secteur medtech en Suisse est très concurrentiel et réglementé (MDR, Swissmedic). Mentionner toute connaissance des réglementations en vigueur ou des processus d'appels d'offres publics cantonaux (AIMP/LMP) renforcerait significativement la crédibilité du profil.

Mots-clés : Key Account Manager, B2B, matériel médical, MedTech, distribution médicale, cliniques, hôpitaux, Salesforce, négociation, appels d'offres publics, contrats cadres, brevet fédéral, spécialiste de vente, Tessin, Suisse alémanique, CFC laborantin, prospection, portefeuille clients, chiffre d'affaires

Pré-tri : défauts ✔ Aucune rubrique langues (alors qu'il travaille au Tessin et en Suisse alémanique) | qualités ✔ Résultats chiffrés (+18 %, 45 clients)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 4, 5, 6
Mots-clés absents du texte du CV : distribution médicale, CFC laborantin, portefeuille clients

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv12 — Vente terrain — coordonnées manquantes

**Exécution 1** — score 62 (fourchette indicative 35-65) · ATS 55 · 20 s

Points forts :
- Expérience continue et progressive dans le commerce de détail avec prise de responsabilités croissantes (vitrine, formation d'apprenties)
- Bilinguisme français/arabe et niveau allemand B1 — atout concret sur le marché bilingue de Bienne
- Formation officielle AFP en lien direct avec le poste occupé
- Expérience de formation de 2 apprenties : signe de maturité professionnelle et de confiance accordée par l'employeur
- Stabilité professionnelle chez Mode Démo SA depuis 2021 (plus de 5 ans), appréciée des recruteurs suisses

Améliorations :
- Ajouter les coordonnées personnelles (téléphone, email, ville/NPA) — leur absence rend le CV inutilisable en pratique et bloque tout recruteur
- Quantifier les réalisations : nombre de clients traités par jour, taille de l'équipe, résultats sur la vitrine ou les ventes — les chiffres rendent le profil concret et différenciant
- Préciser le niveau d'allemand B1 avec une certification si elle existe (Goethe, telc…) et mentionner si l'allemand est utilisé activement au travail à Bienne, ce qui serait un vrai point fort
- Ajouter une photo professionnelle : en Suisse, une photo soignée est encore la norme sur un CV et son absence peut être remarquée négativement selon le secteur et l'employeur

Conseils suisses : Pour le marché suisse, plusieurs ajustements sont recommandés. D'abord, les informations personnelles sont indispensables : prénom, nom, adresse (NPA + localité), numéro de téléphone et adresse e-mail doivent figurer clairement en tête de CV — leur absence actuelle est le point bloquant le plus urgent à corriger. Concernant la photo, bien qu'elle ne soit pas obligatoire légalement, elle reste très courante en Suisse dans le commerce de détail et son ajout (photo professionnelle, fond neutre, tenue soignée) est conseillé. Les niveaux de langue devraient suivre le référentiel CECR (A1 à C2) : l'allemand B1 est déjà mentionné, ce qui est bien — si une certification existe, l'indiquer renforce la crédibilité. Le français et l'arabe peuvent être mentionnés comme 'langue maternelle (C2)' pour plus de clarté. Sur la forme, le CV actuel tient sur une page, ce qui est acceptable pour ce niveau d'expérience. Deux pages sont tolérées en Suisse uniquement si le contenu le justifie réellement — ici, une page bien structurée et enrichie suffit. Concernant les références, la mention 'Références disponibles sur demande' en fin de CV est l'usage suisse correct ; il est également pertinent de préciser que des certificats de travail (attestations d'employeurs) sont disponibles, car les recruteurs suisses y attachent beaucoup d'importance. Enfin, la section 'Qualités' avec des adjectifs génériques (souriante, ponctuelle) apporte peu de valeur — il vaut mieux intégrer ces qualités dans les descriptions de poste via des exemples concrets ou les supprimer.

Mots-clés : vendeuse, commerce de détail, conseil clientèle, encaissement, vitrine, formation d'apprenties, AFP, assistante du commerce de détail, Bienne, français, allemand B1, arabe, sens du service, mode, chaussures

Pré-tri : défauts ✔ Ni téléphone, ni e-mail, ni localité | qualités ✔ Forme des apprenties
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 5
Mots-clés absents du texte du CV : formation d'apprenties, allemand B1

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv13 — Soins — infirmière frontalière, diplôme français

**Exécution 1** — score 62 (fourchette indicative 45-75) · ATS 58 · 26 s

Points forts :
- Expérience clinique solide et progressive : passage de l'EHPAD à la médecine interne aiguë, démontrant une montée en compétences réelle
- Poste actuel depuis 2020 avec charge de 12 patients par poste, chiffre concret qui donne de la crédibilité au CV
- Rôle d'encadrement des étudiants infirmiers mentionné, valorisé dans les établissements suisses qui cherchent des praticiens formateurs
- Diplôme d'État d'infirmier français reconnu en Suisse via la procédure de reconnaissance des titres étrangers (Croix-Rouge suisse)

Améliorations :
- Ajouter une photo professionnelle : en Suisse, la photo est quasi systématiquement attendue sur un CV et son absence peut surprendre les recruteurs helvétiques
- Développer les missions et compétences techniques : le poste en EHPAD (2017-2020) n'a aucune description — soins palliatifs, nursing, gestion de la douleur, pathologies gériatriques ? Ces détails font la différence pour un recruteur suisse
- Renforcer le niveau d'anglais et mentionner toute autre langue : le marché suisse est multilingue et un niveau A2 en anglais est insuffisant pour la plupart des postes hospitaliers — si une formation ou un effort est en cours, l'indiquer ; l'ajout d'un niveau en allemand ou en suisse-allemand serait un atout majeur pour la région lémanique
- Mentionner explicitement la démarche de reconnaissance du titre : indiquer si la procédure auprès de la Croix-Rouge suisse est en cours ou complétée rassure immédiatement le recruteur suisse sur l'employabilité réelle du candidat

Conseils suisses : Pour le marché suisse, ce CV nécessite plusieurs adaptations importantes. D'abord, le format : en Suisse, le CV comprend classiquement une photo professionnelle en haut à droite — son absence est remarquée et peut créer une impression d'inachevé. Prévoyez une photo sobre, professionnelle, sur fond neutre. Concernant les informations personnelles, les recruteurs suisses apprécient de voir la date de naissance (l'usage est encore courant), la nationalité et éventuellement le permis de travail ou le statut frontalier — Claire résidant à Annemasse, elle est probablement frontalière, ce qui doit être mentionné clairement car cela simplifie la démarche pour l'employeur. Sur les langues, indiquez toujours le niveau CECR officiel (A1 à C2) : le français langue maternelle est un atout dans le canton de Genève, Vaud ou Valais romand, mais les établissements suisses apprécient aussi la compréhension du suisse-allemand pour les échanges inter-cantonaux. Un niveau A2 en anglais est faible pour un environnement hospitalier suisse moderne — toute formation en cours mérite d'être signalée. Concernant la reconnaissance du titre : le Diplôme d'État d'infirmier français n'est pas automatiquement reconnu en Suisse — la procédure passe par la Croix-Rouge suisse (section Reconnaissances) et peut prendre plusieurs mois. Il est fortement conseillé d'entamer ou de compléter cette démarche avant de postuler, et d'en indiquer le statut sur le CV. Pour les références, l'usage suisse correct est d'écrire 'Références et certificats de travail disponibles sur demande' (Arbeitszeugnisse en allemand) — les certificats de travail suisses, ou leur équivalent français, sont très importants dans la culture RH helvétique. Le CV peut tenir sur 2 pages pour un profil avec 9 ans d'expérience, à condition que le contenu soit dense et pertinent — ce qui n'est pas encore le cas ici. Enfin, pour postuler dans les hôpitaux de la région (HUG, CHUV, Hôpital du Valais, hôpitaux vaudois), une lettre de motivation personnalisée et soignée reste indispensable et doit mentionner explicitement la motivation pour le marché suisse.

Mots-clés : infirmière diplômée d'État, médecine interne, EHPAD, soins infirmiers, prise en charge patients, encadrement étudiants, Diplôme d'État infirmier, soins gériatriques, hôpital, frontalière, Annemasse, Annecy, Thonon

Pré-tri : défauts ✔ Reconnaissance du diplôme français (CRS / Croix-Rouge suisse) non mentionnée · ✔ Statut de travail en Suisse (permis G) non indiqué | qualités ✔ Encadrement d'étudiants, 12 patients par poste
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 9
Mots-clés absents du texte du CV : soins infirmiers, prise en charge patients, encadrement étudiants, Diplôme d'État infirmier, soins gériatriques, hôpital, frontalière

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv14 — Multilingue FR/DE/EN — langues bien renseignées

**Exécution 1** — score 78 (fourchette indicative 60-90) · ATS 72 · 21 s

Points forts :
- Profil trilingue (DE/FR/C1, EN/B2) avec niveaux CECR explicites — atout décisif pour le marché suisse et notamment pour la région bilingue Berne-Fribourg
- Résultat chiffré et concret : taux de résolution au premier appel amélioré de 68 % à 81 %, ce qui démontre un impact mesurable sur la performance de l'équipe
- Progression de carrière cohérente et lisible : évolution naturelle de conseiller senior vers responsable d'équipe dans le même secteur sur 8 ans
- Brevet fédéral (titre fédéral reconnu) mentionné avec l'intitulé précis, ce qui est valorisant et crédible pour les RH suisses
- Maîtrise d'outils CRM de référence (Salesforce Service Cloud, Zendesk) directement parlants pour les recruteurs du secteur

Améliorations :
- Ajouter une photo professionnelle en haut à droite du CV : c'est l'usage standard en Suisse et son absence peut surprendre certains recruteurs helvétiques
- Enrichir l'expérience chez Telecom Demo AG avec au moins un indicateur supplémentaire (taille du budget géré, NPS, taux de satisfaction client, réduction du temps de traitement) — un seul chiffre fort est déjà bien, mais deux donnent davantage de relief au poste de responsable
- Ajouter une mention explicite des certificats de travail disponibles (Arbeitszeugnisse) ou la formule 'Références disponibles sur demande' en pied de CV — c'est une pratique attendue en Suisse et rassurante pour les recruteurs

Conseils suisses : Ce CV est globalement bien construit pour le marché suisse. Quelques points de cadrage utiles : (1) Photo — en Suisse, la photo professionnelle reste la norme dans la très grande majorité des candidatures, contrairement à la France ou aux pays anglo-saxons. Son absence n'est pas rédhibitoire mais peut être perçue comme un oubli ; une photo sobre et professionnelle en haut à droite est recommandée. (2) Informations personnelles — le CV contient les éléments attendus (nom, ville, téléphone, email). En Suisse, la date de naissance n'est plus obligatoire mais reste fréquente ; la nationalité et le permis de travail sont utiles si le candidat n'est pas ressortissant suisse ou UE/AELE. (3) Langues — les niveaux CECR sont correctement indiqués, ce qui est apprécié. La distinction langue maternelle / C1 / B2 est claire et crédible. (4) Format et longueur — une page est acceptable pour ce profil, mais deux pages sont tout à fait admises en Suisse dès lors que le contenu le justifie. Si des formations continues, projets ou contextes d'équipe méritent d'être développés, passer à deux pages est opportun. (5) Références et certificats de travail — en Suisse, les Arbeitszeugnisse (certificats de travail) ont une valeur probante importante et sont souvent demandés dès la première candidature. Il est conseillé de les mentionner comme disponibles, et de les joindre ou de les tenir prêts. La formule 'Références disponibles sur demande' est appropriée en pied de CV.

Mots-clés : responsable service clientèle, management d'équipe, télécommunications, Salesforce Service Cloud, Zendesk, MS Office, trilingue, allemand, français, anglais, brevet fédéral, CFC employé de commerce, taux de résolution, chat client, formation collaborateurs, réclamations, conseiller clientèle, Berne, Fribourg

Pré-tri : défauts ✔ Pas de mention des certificats de travail / références | qualités ✔ Langues avec niveaux CECR · ✔ Résultat chiffré (68 % → 81 %)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 4, 5
Mots-clés absents du texte du CV : management d'équipe, CFC employé de commerce, formation collaborateurs

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 82 (fourchette indicative 60-90) · ATS 78 · 23 s
- 1re amélioration : Ajouter une photo professionnelle : bien que non obligatoire, la photo reste la norme en Suisse pour les postes en management. Une photo sobre et professionnelle renforce la mémorisation du dossier par le recruteur.

**Exécution 3** — score 82 (fourchette indicative 60-90) · ATS 78 · 20 s
- 1re amélioration : Ajouter une photo professionnelle : bien que non obligatoire, la photo est encore très courante sur les CV suisses et son absence peut surprendre certains recruteurs traditionnels, en particulier dans des secteurs orientés client.

### cv15 — Frontalier avec permis G — allemand absent

**Exécution 1** — score 72 (fourchette indicative 45-75) · ATS 68 · 22 s

Points forts :
- Expérience directe en Suisse (Chimie Démo AG, Bâle) depuis 2019 : le candidat est déjà intégré dans le marché du travail suisse, ce qui est un atout majeur pour les recruteurs helvétiques.
- Résultat chiffré concret : réduction des arrêts non planifiés de 22 % en 2023, ce qui démontre un impact mesurable et valorise le profil de manière crédible.
- Habilitation électrique BR mentionnée explicitement, certification technique pertinente pour les postes de maintenance industrielle.
- Permis G (frontalier) clairement indiqué, ce qui lève immédiatement la question du statut de travail pour les employeurs bâlois.
- Parcours cohérent et progressif : évolution logique d'électromécanicien à technicien de maintenance sur des secteurs industriels complémentaires.

Améliorations :
- Ajouter l'allemand au profil linguistique : travailler à Bâle sans mentionner de compétences en allemand est un signal négatif fort. Même un niveau A2/B1 doit être indiqué avec le niveau CECR exact. Si le niveau est insuffisant, envisager une formation courte et le signaler.
- Étoffer les missions de 2014-2019 chez Usine Fictive : cette période de 5 ans est décrite de manière totalement vide, ce qui fragilise la crédibilité du CV. Ajouter 2 à 3 réalisations concrètes ou types d'équipements maintenus.
- Ajouter une photo professionnelle : en Suisse, la photo sur le CV est une norme très répandue, particulièrement dans l'industrie. Son absence peut surprendre certains recruteurs helvétiques. Une photo sobre et professionnelle est recommandée.
- Mentionner les certificats de travail disponibles : en Suisse, l'Arbeitszeugnis est un document central du recrutement. Indiquer en bas de CV « Certificats de travail disponibles sur demande » rassure immédiatement le recruteur.

Conseils suisses : Ce profil est bien positionné pour le marché suisse alémanique grâce à l'expérience active à Bâle et au permis G. Cependant, plusieurs points méritent attention. L'absence totale de l'allemand dans les langues est le point le plus critique : à Bâle, même un niveau fonctionnel (A2-B1) doit être mentionné avec le niveau CECR précis. Les recruteurs suisses alémaniques interprètent l'absence d'allemand comme un obstacle à la communication en équipe, même si l'anglais est parfois langue de travail dans la chimie. Concernant le format : le CV suisse standard fait 1 à 2 pages ; ce CV semble concis, ce qui est bien, mais la page doit être valorisée davantage pour les postes dans la chimie bâloise (industrie très exigeante). Les informations personnelles (lieu de résidence, permis G) sont correctement indiquées. Il n'est pas nécessaire d'ajouter la nationalité, la date de naissance ou la situation familiale, bien que certains candidats les incluent encore. La mention 'références disponibles sur demande' est l'usage correct en Suisse — ne jamais lister les coordonnées directes d'anciens supérieurs. Les certificats de travail (Arbeitszeugnis) sont incontournables dans le processus de recrutement suisse : préparez-les pour chaque employeur et signalez leur disponibilité. Enfin, une photo professionnelle est fortement conseillée pour le marché suisse, particulièrement dans l'industrie et les PME, où elle est encore la norme dominante.

Mots-clés : maintenance préventive, maintenance industrielle, électromécanicien, habilitation électrique BR, lignes de production, chimie, BTS Maintenance des systèmes, permis G, frontalier, Bâle, réduction des arrêts, technicien de maintenance

Pré-tri : défauts ✔ Travaille à Bâle mais aucune mention de l'allemand | qualités ✔ Permis G indiqué · ✔ Résultat chiffré (−22 % d'arrêts)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 5
Mots-clés absents du texte du CV : frontalier

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv16 — Permis B — ingénieure civile, tâches vagues

**Exécution 1** — score 72 (fourchette indicative 45-75) · ATS 68 · 23 s

Points forts :
- Expérience en cours en Suisse depuis 2022 dans un bureau d'ingénieurs local, ce qui démontre une intégration réussie sur le marché suisse
- Diplôme de Master en génie civil avec mention d'une reconnaissance suisse (Swiss Engineering STV), point rassurant pour les recruteurs helvétiques
- Maîtrise de logiciels métier pertinents pour le marché suisse, notamment les normes SIA et Cubus, très spécifiques au secteur suisse de la construction
- Niveaux de langues indiqués selon le CECR (C1, B2, A2), format attendu par les recruteurs suisses
- Parcours cohérent et progressif dans le génie civil, sans rupture significative entre les expériences

Améliorations :
- Ajouter une photo professionnelle : bien que non obligatoire légalement, la photo est encore très courante et attendue sur les CV en Suisse romande et alémanique — son absence peut surprendre certains recruteurs traditionnels dans le secteur du BTP
- Quantifier les réalisations : les descriptions de postes sont trop génériques (ex. 'Responsable de projets', 'Suivi de chantiers'). Préciser le type d'ouvrages, les budgets gérés, la taille des équipes ou des projets augmenterait fortement l'impact auprès des recruteurs et des systèmes ATS
- Renforcer le niveau d'allemand ou le mettre en valeur différemment : en Suisse, surtout pour des postes avec contacts intercantonaux, un A2 en allemand est un point faible visible — mentionner une formation en cours ou un objectif d'amélioration serait un signal positif
- Ajouter une mention des certificats de travail disponibles (Arbeitszeugnis), ou indiquer 'Références disponibles sur demande' — c'est l'usage suisse standard et cela rassure les employeurs sur la traçabilité du parcours

Conseils suisses : Ce CV présente une base solide pour le marché suisse, mais plusieurs ajustements peuvent significativement améliorer son impact. Sur la forme : le format actuel semble court et peu détaillé ; en Suisse, un CV de 2 pages est tout à fait accepté et même recommandé pour un profil avec 8 ans d'expérience — profitez-en pour étoffer les descriptions de postes. Une photo professionnelle (tenue soignée, fond neutre) est fortement recommandée dans le secteur du BTP en Suisse, même si elle n'est pas légalement exigée. Sur les informations personnelles : le permis de séjour B est bien mentionné, ce qui est important pour les employeurs suisses — continuez à l'inclure. La date de naissance n'est pas nécessaire sur un CV suisse moderne. Sur les langues : les niveaux CECR sont corrects et appréciés ; l'allemand A2 est un point à surveiller — le marché suisse valorise fortement la progression vers B1/B2, en particulier pour des échanges avec des bureaux alémaniques ou des autorités cantonales. Envisager une formation continue en allemand et le mentionner ('en cours') serait un atout. Sur les références : ne jamais lister les coordonnées directes d'anciens supérieurs sur le CV — indiquer simplement 'Références et certificats de travail disponibles sur demande' est l'usage correct en Suisse. Les Arbeitszeugnisse (certificats de travail) sont très importants dans la culture suisse ; assurez-vous de les avoir prêts à fournir. Sur les logiciels : la mention des normes SIA est un vrai point fort — envisagez de préciser les versions ou modules maîtrisés si pertinent.

Mots-clés : ingénieure civile, génie civil, bureau d'ingénieurs, projets, chantiers, calculs de structures, conception d'ouvrages, coordination, AutoCAD, Revit, SIA Norm, Cubus, Master génie civil, permis B, Sion, Valais, français C1, anglais B2, portugais, Swiss Engineering

Pré-tri : défauts ✔ « Responsable de projets » sans taille, budget ni type d'ouvrage | qualités ✘ Permis B indiqué · ✔ Connaissance des normes SIA
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 8
Mots-clés absents du texte du CV : Master génie civil, Valais, français C1, anglais B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv17 — Avec photo — profil générique (photo déclarée)

**Exécution 1** — score 72 (fourchette indicative 45-75) · ATS 65 · 22 s

Points forts :
- Brevet fédéral de spécialiste RH : certification reconnue et valorisée sur le marché suisse, cohérente avec le poste occupé
- Chiffres concrets et parlants : recrutement de 40 à 60 collaborateurs par an et gestion de la paie pour 250 collaborateurs donnent une idée précise du périmètre de responsabilités
- Progression de carrière logique et lisible : évolution d'assistante RH à spécialiste RH, avec une continuité sectorielle cohérente
- Trilinguisme français/anglais/allemand avec niveaux CECR indiqués : atout réel en Suisse romande, notamment pour collaborer avec des entités alémaniques

Améliorations :
- Le profil est trop générique ('dynamique, motivée, polyvalente') : le remplacer par 3 à 4 lignes ciblées mentionnant les domaines RH maîtrisés (recrutement, administration salariale, intégration), le type d'environnement et la valeur ajoutée concrète apportée à l'employeur
- Le poste d'Assistante RH chez Exemple Retail SA (2016-2020) est mentionné sans aucun détail : ajouter 2 ou 3 bullet points décrivant les responsabilités et réalisations permet aux recruteurs et aux ATS de mieux évaluer la progression et les compétences acquises
- Les outils et logiciels RH utilisés (SIRH, logiciels de paie comme Abacus ou SAP, ATS éventuels) ne sont pas mentionnés : leur ajout renforcerait significativement la compatibilité ATS et la crédibilité technique du profil
- Aucune mention de références ou de certificats de travail : indiquer 'Références et certificats de travail disponibles sur demande' est l'usage standard en Suisse et rassure les recruteurs

Conseils suisses : Ce CV est globalement bien structuré et pertinent pour le marché suisse romand. Quelques points spécifiques au contexte helvétique méritent attention. Sur les informations personnelles : le CV ne mentionne pas la nationalité ni le permis de travail, informations fréquemment attendues en Suisse, surtout si la candidate n'est pas ressortissante UE/AELE — il est conseillé de les ajouter. La date de naissance est absente, ce qui est désormais admis et même recommandé pour éviter les biais, donc ce point n'est pas problématique. Sur les langues : les niveaux CECR sont correctement indiqués, c'est conforme aux attentes suisses. Un niveau B1 en allemand est un atout en Suisse romande mais peut limiter les opportunités dans des environnements bilingues ou alémaniques — si le niveau a progressé depuis l'inscription au CV, il convient de le mettre à jour. Sur le format : le CV tient sur une page, ce qui est acceptable pour ce niveau d'expérience (environ 10 ans), mais une mise en page sur deux pages permettrait d'étoffer les expériences et de mieux valoriser les réalisations sans paraître surchargé. Sur les certificats de travail : en Suisse, l'Arbeitszeugnis (certificat de travail qualifié) est un document clé du processus de recrutement — il est fortement recommandé de préciser que ces documents sont disponibles sur demande. Sur la compatibilité ATS : l'absence d'outils RH nommés et le manque de détail sur le premier poste réduisent la visibilité du profil dans les systèmes de tri automatisé — enrichir le vocabulaire métier (noms de logiciels, processus RH spécifiques) améliorera ce point.

Mots-clés : Spécialiste RH, Recrutement, Gestion des salaires, Administration du personnel, Intégration, Brevet fédéral, RH, Psychologie, Lausanne, Français, Anglais, Allemand, B2, B1, Onboarding, Gestion administrative

Pré-tri : défauts ✔ Profil générique (« dynamique, motivée, polyvalente ») | qualités ✔ Chiffres concrets (40-60 recrutements, 250 salaires)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 4, 10
Mots-clés absents du texte du CV : Gestion des salaires, Administration du personnel, Onboarding

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

**Exécution 2** — score 72 (fourchette indicative 45-75) · ATS 65 · 20 s
- 1re amélioration : Le profil est trop générique ('dynamique, motivée, polyvalente') : reformuler avec 2-3 phrases spécifiques mentionnant l'expertise RH, la taille d'entreprise, et la valeur ajoutée concrète apportée — c'est souvent la première chose lue par un recruteur

**Exécution 3** — score 72 (fourchette indicative 45-75) · ATS 65 · 22 s
- 1re amélioration : Le profil est trop générique ('dynamique, motivée, polyvalente') : le remplacer par 3 à 4 lignes ciblées décrivant le domaine RH de prédilection, la taille des structures maîtrisées et une valeur ajoutée différenciante (ex. gestion RH pour structures de 200+ collaborateurs, expertise en recrutement opérationnel et onboarding).

### cv18 — Sans photo — dates sans mois

**Exécution 1** — score 74 (fourchette indicative 50-80) · ATS 78 · 20 s

Points forts :
- Brevet fédéral de spécialiste en finance et comptabilité : titre reconnu et valorisé en Suisse, clairement mentionné avec l'année d'obtention
- Maîtrise d'Abacus, logiciel dominant dans les PME suisses, combinée à SAP FI pour les grandes structures : profil logiciels directement opérationnel
- Expérience concrète et quantifiée : gestion de la comptabilité de 3 sociétés simultanément, bouclements et TVA, ce qui couvre les attentes standard d'un poste de comptable en Suisse romande
- Niveau d'allemand B2 : atout tangible dans un marché suisse où le bilinguisme FR/DE est apprécié, surtout pour Neuchâtel en bordure de zone germanophone
- Parcours chronologique clair, sans interruption significative, avec une progression logique d'aide-comptable à comptable autonome

Améliorations :
- Ajouter une photo professionnelle : en Suisse, la photo sur CV est une norme largement répandue et son absence peut surprendre certains recruteurs, même si elle n'est pas obligatoire
- Quantifier davantage les réalisations : préciser le volume de transactions traitées, le chiffre d'affaires des sociétés gérées ou les délais de bouclement respectés donnerait plus de poids aux expériences et faciliterait la lecture ATS
- Ajouter une ligne 'Références / Certificats de travail' en bas de CV avec la mention 'disponibles sur demande', pratique attendue en Suisse pour signaler la disponibilité des Arbeitszeugnisse

Conseils suisses : Ce CV est globalement bien structuré pour le marché suisse romand. Quelques points méritent attention. 1) Photo : bien que non obligatoire légalement, la photo professionnelle reste une convention forte en Suisse ; son ajout est recommandé pour maximiser vos chances auprès des recruteurs traditionnels. 2) Informations personnelles : le format actuel (ville, email, téléphone) est correct ; il n'est pas nécessaire d'indiquer la nationalité ni le statut de permis de travail si vous êtes ressortissant suisse ou UE/AELE, mais si ce n'est pas le cas, précisez votre type de permis car c'est une information décisive pour les recruteurs suisses. 3) Langues CECR : les niveaux B2 (allemand) et B1 (anglais) sont correctement indiqués selon le Cadre européen commun de référence — c'est exactement ce qu'attendent les recruteurs suisses, ne les supprimez pas. 4) Format et longueur : une page est acceptable pour ce profil, mais si vous souhaitez développer vos réalisations avec des chiffres concrets, deux pages restent tout à fait acceptées en Suisse pour un profil avec plus de 10 ans d'expérience. 5) Références et certificats de travail : en Suisse, il est d'usage de mentionner que des certificats de travail (Arbeitszeugnisse) et des références sont disponibles sur demande. N'inscrivez pas les coordonnées directes d'anciens supérieurs sur votre CV — cela pose un problème de confidentialité et n'est pas l'usage local.

Mots-clés : comptabilité, bouclement mensuel, bouclement annuel, déclaration TVA, Abacus, SAP FI, Excel avancé, brevet fédéral, spécialiste en finance et comptabilité, CFC employé de commerce, fiduciaire, horlogerie, comptabilité de groupe, français, allemand B2, anglais B1, Neuchâtel, La Chaux-de-Fonds

Pré-tri : défauts ✔ Dates sans mois ; poste terminé en 2025 sans indication de la suite | qualités ✔ Brevet fédéral
⚠️ Motifs interdits trouvés : [CRITIQUE] Présente la photo comme obligatoire — à confirmer à la lecture
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 4, 10, 5
Mots-clés absents du texte du CV : bouclement mensuel, bouclement annuel, déclaration TVA, CFC employé de commerce, comptabilité de groupe, allemand B2, anglais B1

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv19 — Senior 58 ans — début de carrière trop détaillé

**Exécution 1** — score 78 (fourchette indicative 50-80) · ATS 72 · 29 s

Points forts :
- Parcours de carrière cohérent et progressif sur 40 ans dans l'industrie agroalimentaire et laitière, avec une évolution logique jusqu'au niveau direction multi-sites.
- Poste actuel de Directeur de production depuis 16 ans avec responsabilité concrète : 3 sites, 140 collaborateurs — des chiffres précis qui rassurent les recruteurs suisses.
- Certification IFS obtenue et maintenue depuis 2014 : signal fort de rigueur qualité, très valorisé dans l'agroalimentaire suisse.
- Double formation professionnelle suisse (CFC + Diplôme fédéral), parfaitement alignée avec le secteur et reconnue par le marché helvétique.
- Résultat quantifié pertinent : +15 % de productivité entre 2018 et 2023, donnée vérifiable et impactante.

Améliorations :
- Les postes anciens (1986-1998) sont trop détaillés pour un profil de direction : des tâches comme 'Chargement des camions' ou 'Nettoyage des installations' alourdissent le CV sans apporter de valeur à ce stade de carrière. Réduire ces entrées à une ou deux lignes synthétiques libérerait de l'espace pour renforcer les réalisations du poste actuel.
- Le poste actuel (2010 à aujourd'hui) mériterait davantage de résultats chiffrés ou de réalisations concrètes : budget géré, réduction des coûts, projets d'investissement, audits réussis, initiatives RSE ou développement d'équipe — le recruteur doit voir l'étendue réelle de l'impact sur 16 ans.
- Ajouter une photo professionnelle : en Suisse romande comme en Suisse alémanique, la photo reste une pratique courante et son absence peut être perçue comme un oubli sur un CV senior. Un portrait sobre et professionnel est recommandé.
- Le niveau d'allemand B2 est un atout réel pour le marché suisse — envisager de préciser si ce niveau est certifié (ex. : Goethe-Zertifikat) ou auto-évalué, ce qui renforce la crédibilité auprès de recruteurs romands et alémaniques.

Conseils suisses : Ce CV présente un profil solide et crédible pour le marché suisse, avec une trajectoire professionnelle lisible et des formations reconnues. Quelques ajustements permettront de maximiser son impact.

Photo : bien que non obligatoire légalement, la photo professionnelle reste très répandue sur les CV suisses (secteurs industrie et agroalimentaire inclus). Son absence n'est pas rédhibitoire mais peut surprendre. Un portrait sobre en costume ou tenue professionnelle est conseillé.

Informations personnelles : la date de naissance (12.03.1968) est indiquée, ce qui est encore courant en Suisse mais tend à disparaître sur les CV modernes pour éviter les biais liés à l'âge. À 58 ans au moment de la candidature, Bernard peut choisir de la conserver (transparence) ou de la supprimer (pratique de plus en plus acceptée). La nationalité ou le permis de travail peuvent être utiles à mentionner si pertinent.

Langues : le français (langue maternelle) et l'allemand (B2) sont bien indiqués. Il est recommandé de préciser si le niveau CECR est auto-évalué ou certifié. Pour un poste de direction multi-sites en Suisse, un B2 actif à l'oral est un vrai différenciateur — le mentionner explicitement ('B2 oral et écrit') renforce la crédibilité.

Format et longueur : le CV peut tenir sur 2 pages en condensant les postes antérieurs à 1998. Les recruteurs suisses acceptent 2 pages pour un profil senior, mais au-delà, cela nuit à la lisibilité. Utiliser un format PDF soigné avec une police lisible (Calibri, Arial, Helvetica) et une hiérarchie visuelle claire améliore la compatibilité ATS.

Références : ne pas inscrire de coordonnées directes d'anciens supérieurs sur le CV. La mention 'Références disponibles sur demande' est l'usage correct en Suisse. Les certificats de travail (Arbeitszeugnis / certificats de travail) sont très importants dans le contexte suisse : il est utile de préciser qu'ils sont disponibles, notamment pour les postes récents.

Positionnement : pour un poste de Directeur de production dans l'agroalimentaire suisse (secteur très présent en Suisse romande — Nestlé, Emmi, Cremo, coopératives laitières), ce profil est compétitif. Une accroche professionnelle en tête de CV (3-4 lignes résumant l'expertise) aiderait les recruteurs ATS et humains à qualifier rapidement le dossier.

Mots-clés : Directeur de production, Agroalimentaire, Industrie laitière, IFS, Certification qualité, Multi-sites, Management d'équipe, Productivité, CFC technologue, Diplôme fédéral, Maître technologue, Payerne, Suisse romande, Contrôle qualité, Supervision, Allemand B2, Fromagerie, Laiterie, Chef d'équipe, Responsable de production

Pré-tri : défauts ✔ Postes de 1984-1998 trop détaillés par rapport à l'expérience récente | qualités ✔ Résultats (IFS, +15 %, 140 collaborateurs)
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 40, 16, 58, 4
Mots-clés absents du texte du CV : Certification qualité, Multi-sites, Management d'équipe, CFC technologue, Suisse romande, Contrôle qualité, Allemand B2

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non

### cv20 — Étudiant master — adresse e-mail non professionnelle

**Exécution 1** — score 72 (fourchette indicative 40-70) · ATS 68 · 23 s

Points forts :
- Parcours académique cohérent et en cours (master en droit des affaires à Genève), directement pertinent pour les postes juridiques visés en Suisse romande.
- Expérience professionnelle continue en tant qu'assistant juridique à 20 % durant le master, démontrant une capacité à concilier études et pratique — très appréciée des recruteurs suisses.
- Deux stages dans le secteur bancaire (Banque Démo SA, étés 2022 et 2023), domaine porteur sur la place financière genevoise.
- Niveau d'anglais C1 avec niveau CECR explicitement indiqué — bonne pratique pour le marché suisse.
- Participation à un moot court avec résultat concret (demi-finaliste 2025) : illustre des compétences en argumentation et procédure, différenciantes pour un profil junior.

Améliorations :
- Ajouter une photo professionnelle : bien que non obligatoire légalement, elle reste très courante sur les CV suisses et son absence peut surprendre certains recruteurs traditionnels, notamment dans les études d'avocats et le secteur bancaire genevois.
- Quantifier ou préciser les missions de l'assistant juridique et des stages : par exemple, indiquer le type de contrats traités, le volume de notes rédigées, ou les domaines couverts lors des stages bancaires. Le marché suisse valorise les descriptions concrètes plutôt que les listes génériques.
- Préciser le niveau d'allemand B1 avec un certificat ou une autoévaluation CECR confirmée : en Suisse, l'allemand est scruté avec attention même pour un poste genevois, et un B1 peut être perçu comme limitant. Mentionner si des cours sont en cours pour le renforcer serait un plus.
- Ajouter la mention 'Références disponibles sur demande' et indiquer si des certificats de travail (attestations employeur) sont disponibles — pratique standard attendue sur le marché suisse.

Conseils suisses : Ce CV présente un profil junior solide et cohérent pour le marché juridique suisse romand. Quelques points d'attention spécifiques au contexte helvétique : (1) Photo : le CV suisse inclut traditionnellement une photo professionnelle, particulièrement dans les milieux juridiques et financiers genevois. Son ajout est fortement recommandé. (2) Informations personnelles : le CV ne mentionne pas la nationalité ni le permis de travail, informations souvent attendues en Suisse (notamment pour distinguer ressortissants UE/AELE des autres). Si Yann est ressortissant suisse ou UE, l'indiquer simplement lève d'emblée une question pratique pour le recruteur. (3) Langues : la notation CECR est bien utilisée pour l'anglais (C1) et l'allemand (B1), ce qui est la bonne pratique en Suisse. Compte tenu du trilinguisme helvétique, tout effort pour renforcer l'allemand au-delà du B1 serait un atout concurrentiel significatif, même pour un poste genevois. (4) Format et longueur : une page est appropriée à ce stade du parcours. En Suisse, on passe généralement à deux pages à partir d'une expérience professionnelle plus étoffée (5 ans et plus). Le format actuel est donc correct. (5) Références : la pratique suisse veut que les coordonnées des anciens employeurs ne figurent pas directement sur le CV — préférer la mention 'Références disponibles sur demande' et tenir prêts les certificats de travail (Arbeitszeugnis), documents très importants dans le processus de recrutement suisse. (6) Adresse email : l'adresse 'lebogossdu74' est informelle et peu professionnelle — la remplacer par une adresse au format prénom.nom est impératif pour les candidatures dans le monde juridique et financier.

Mots-clés : droit des affaires, droit des contrats, assistant juridique, recherches juridiques, rédaction juridique, droit bancaire, moot court, Genève, master en droit, bachelor en droit, étude d'avocats, banque, anglais C1, allemand B1, français langue maternelle

Pré-tri : défauts ✔ Adresse e-mail non professionnelle | qualités ✔ Parcours universitaire cohérent + emploi à temps partiel
Chiffres absents du CV (vérifier qu'ils ne sont pas inventés) : 4, 5, 6
Mots-clés absents du texte du CV : rédaction juridique, droit bancaire, étude d'avocats, anglais C1, allemand B1, français langue maternelle

Note humaine (0-3) : diagnostic _ · pertinence _ · spécificité _ · applicabilité _ · faits _ · rédaction _ · cohérence _ · score _ · utilité _ · extraction _ · erreur critique : oui / non
