# Audit stratégique SwissCV Pro — Étapes A (audit) et B (propositions)

*18 octobre 2026. Aucune modification du site, du code ni de la base pendant cet audit : uniquement des lectures du code, du site en ligne et de la base (requêtes en lecture seule).*

**Légende** — `[OBS]` observé (code, site, base) · `[MES]` mesuré sur données réelles · `[HYP]` hypothèse · `[REC]` recommandation.
**Statuts** — PASS · FAIL · NON TESTÉ · BLOQUÉ.

---

## 0. Résumé

1. **Problème critique — fausses analyses.** Quand la réponse de l'IA est mal formée, le serveur renvoie un résultat inventé (score 70, points forts génériques), l'enregistre comme une vraie analyse et débite le crédit. `[MES]` **8 analyses sur 204 (3,9 %)** sont concernées.
2. **Problème critique — preuves sociales non authentiques.** 3 des 4 avis de l'accueil ont été insérés par le script d'installation de la base ; 3 avis avec résultats chiffrés sont écrits en dur sur la page Tarifs ; « 228 professionnels suisses » compte tous les comptes, y compris internes et supprimés.
3. **Promesses commerciales inexactes** sur la page Tarifs (« analyses illimitées » alors que chaque analyse coûte un crédit, limites inexistantes, « satisfait ou remboursé » absent des CGU…).
4. **Le moteur d'analyse n'a pas de grille de notation** : le score est une note « 0-100 » libre, sans critères ni pondération, avec la variabilité maximale du modèle (température par défaut). Le score ATS est calculé mais **jamais affiché** (bug).
5. **La valeur gratuite est presque invisible** : un utilisateur gratuit voit 1 point fort et 1 amélioration ; le reste est masqué. `[MES]` 224 comptes réels → 98 ont analysé un CV (44 %) → **1 abonné payant**.

**Recommandation centrale :** corriger d'abord l'honnêteté du produit (lot 1, rapide), puis rendre le diagnostic fiable et actionnable (lot 2), et seulement ensuite refaire la page d'accueil autour de ce diagnostic (lot 3). Une nouvelle page qui promet une analyse précise, alors que 4 % des analyses sont inventées, aggraverait le problème.

---

# ÉTAPE A — AUDIT

## A1. Problèmes critiques (à traiter avant toute action marketing)

| # | Constat | Preuve | Risque |
|---|---|---|---|
| C1 | **Analyse de secours inventée.** Si le JSON de l'IA ne se lit pas, le code renvoie `score: 70`, des points forts fixes (« Expérience professionnelle présente »…) et des améliorations génériques (dont « Ajouter une photo » même si l'utilisateur a indiqué en avoir une). Le résultat est enregistré et facturé. | `[OBS]` `index.js`, `handleAnalyzeCVText` (bloc `catch (parseError)` et défauts `improvements`/`swissAdvice`). `[MES]` 8/204 analyses en base avec ces textes. | Tromperie de l'utilisateur, crédit payé pour rien, perte de confiance. |
| C2 | **Avis non authentiques.** Accueil : Marie L., Thomas B., Sophie M. viennent de `migrations/001_create_testimonials.sql` (dates espacées de 10 jours exactement, même seconde). Seul l'avis de Christelle D. a été soumis par une personne. Tarifs : 3 avis codés en dur (« score ATS de 42 % à 81 % », « 3 entretiens », « poste en 3 semaines »). | `[OBS]` table `testimonials`, `pricing.html` l. 1346-1372. | Avis trompeurs (loi contre la concurrence déloyale, LCD) ; risque de réputation majeur si découvert. |
| C3 | **Chiffres de confiance gonflés.** « 228 professionnels suisses » = `COUNT(*) FROM users` (comptes internes, système, supprimés inclus ; nationalité inconnue). « Plus de 120 professionnels suisses nous font confiance » : texte fixe. | `[OBS]` route `/public/stats` ; `pricing.html` l. 1489. `[MES]` 224 comptes réels. | Affirmations non vérifiables. |
| C4 | **Promesses tarifaires inexactes.** Voir A4. | `[OBS]` `pricing.html`. | Litiges, remboursements, perte de confiance. |
| C5 | **Une vraie critique a été refusée** (3 étoiles, « j'ai obtenu deux entretiens grâce à l'analyse ») pendant que des avis d'exemple à 5 étoiles restaient publiés. | `[OBS]` table `testimonials`, id 11. | Sélection biaisée des avis. |

## A2. Page d'accueil (https://swisscv-pro.ch)

Structure actuelle `[OBS]` : haut de page (titre, sous-titre, 2 boutons, téléphone animé) → bandeau de confiance (4 items) → « Comment ça marche » (3 étapes + vidéo) → 6 cartes de fonctionnalités → 4 avis → appel final → pied de page.

| Élément | Ce qui fonctionne | Ce qui est confus / manque | Recommandation | Impact attendu | Confiance |
|---|---|---|---|---|---|
| **Titre** « Décrochez plus d'entretiens en Suisse avec un CV optimisé » | Bénéfice clair, ancré en Suisse. | Promesse de résultat (entretiens) que le produit ne peut pas démontrer ; « optimisé » est vague. | Promettre ce que le produit livre vraiment : voir ce qui freine le CV et comment le corriger. | Moyen | Moyenne `[HYP]` |
| **Sous-titre** « Analysez votre CV, trouvez des offres… générez vos candidatures… » | Vouvoiement cohérent. | 3 promesses à la fois : le visiteur ne sait pas ce qu'il obtiendra en premier. | Une seule promesse, puis le résultat concret (« liste des corrections prioritaires »). | Moyen | Moyenne `[HYP]` |
| **Boutons** « Analyser mon CV gratuitement » / « Se connecter » | Libellé principal clair. | « Gratuitement » sans préciser la contrepartie (inscription, 5 crédits, résultat partiel). | « Analyser mon CV — gratuit, sans carte » + mention de ce qu'on reçoit. | Moyen | Moyenne |
| **Visuel** (téléphone animé) | Montre le parcours, moderne. | Montre un score, pas ce que l'utilisateur va **corriger**. Le score 62 n'est pas expliqué. | La démonstration principale doit montrer un **constat → correction** (voir B5). | Élevé | Moyenne `[HYP]` |
| **Bandeau de confiance** | Rassurant. | « CV analysés avec IA » et « Compatible ATS » sont des affirmations, pas des preuves. | Remplacer par des faits vérifiables : « Données protégées (LPD) », « Sans carte bancaire », « Suppression de vos données à tout moment ». | Faible à moyen | Élevée |
| **« Comment ça marche »** | Vidéo réelle, 3 étapes, synchronisées. | Étape 2 promet la « compatibilité ATS », qui n'est jamais affichée (bug, A5). | Garder, corriger le texte et le bug. | Faible | Élevée |
| **6 fonctionnalités** | Couvre l'offre. | Trop de choses au même niveau ; badges « Premium » faux (lettre et candidature 1 clic sont accessibles à tous avec des crédits) ; « évaluation de chaque section » n'existe pas. | Une fonction principale (diagnostic), les autres regroupées plus bas. | Moyen | Moyenne `[HYP]` |
| **Avis** | — | 3 sur 4 non authentiques (C2). | Retirer immédiatement ; demander de vrais avis aux 98 utilisateurs actifs. | Confiance : élevé | Élevée |
| **Offre gratuite** | « 5 crédits offerts » visible. | Le visiteur ne sait pas qu'il ne verra qu'1 amélioration sur 3-6. | Être explicite sur le contenu gratuit (et revoir ce contenu, A4). | Élevé | Élevée |
| **Tarifs / prix** | Absents de l'accueil (bien : page légère). | — | Garder sur la page Tarifs. | — | — |
| **Longueur** | Raisonnable. | Pas de FAQ, pas de réponse aux objections (confidentialité, différence avec ChatGPT). | Ajouter une FAQ courte (5 questions). | Moyen | Moyenne `[HYP]` |
| **Mobile** | `[OBS]` Accueil sans débordement à 375 px (vérifié le 17.10). | **Tarifs** déborde (577 px de large sur un écran de 375 px). | Corriger Tarifs. | Moyen sur mobile | Élevée |
| **Accessibilité, vitesse** | Vidéos légères (344 Ko, 522 Ko), animations désactivées si l'utilisateur le demande. | Navigation au clavier, contrastes et score de performance : **NON TESTÉS**. | Mesurer (Lighthouse) avant refonte. | — | — |

**Les 7 questions du visiteur** (`[OBS]` page actuelle) :

| Question | Réponse actuelle | Statut |
|---|---|---|
| À qui s'adresse le service ? | Chercheurs d'emploi en Suisse (implicite) | Partiel |
| Quel problème résout-il ? | « CV optimisé » (vague) | FAIL |
| Quel résultat reçoit-on ? | Un score (non expliqué) | FAIL |
| Pourquoi pas ChatGPT ? | Non traité | FAIL |
| Pourquoi faire confiance ? | Avis non authentiques | FAIL |
| Que peut-on essayer gratuitement ? | « 5 crédits » (contenu réel du gratuit non dit) | Partiel |
| Que faire maintenant ? | Bouton clair | PASS |

## A3. Comparaison avec MeilleursJobs (https://meilleursjobs.com, consulté le 18.10.2026)

`[OBS]` Promesse « Trouve le meilleur job. Sans stress. » ; trois problèmes présentés par étape (CV filtré, candidature qui n'atteint pas le décideur, entretien improvisé) ; un produit par problème avec « ça débloque / tu fais / tu obtiens » ; démonstration avant/après d'un CV ; lettre du fondateur ; nombreux avis ; essai payant à 2,95 €.

**Principes intéressants à adapter (sans copier) :**
- **Partir du problème vécu**, pas des fonctionnalités : « votre CV ne reçoit pas de réponse » parle plus que « analyse IA ».
- **Associer chaque fonction à un résultat concret** (« ce que vous faites / ce que vous obtenez »).
- **Une démonstration visuelle avant/après** comme preuve principale.
- **Un visage et une histoire** (le fondateur) : très pertinent pour un service suisse de petite taille, si c'est authentique.
- **« Commencez là où vous bloquez »** : aide à choisir sans tout lire.

**À ne pas reprendre :**
- Leur exemple « après » **ajoute des chiffres** absents de « l'avant » (« 2 M€ », « −15 % des délais », « +38 % de leads ») : exactement ce que SwissCV Pro doit s'interdire.
- Des statistiques non sourcées (« 80 % des postes ne sont jamais publiés », « 300 mails → 60 réponses → 6 entretiens ») et un score ATS « 38 % → 96 % » présenté comme une mesure.
- **Aucune conclusion sur leur taux de conversion** : une page convaincante n'est pas une preuve.

## A4. Offre, crédits et promesses (page Tarifs)

`[OBS]` Incohérences entre la page et le comportement réel :

| Affirmation | Réalité | Statut |
|---|---|---|
| Premium : « Analyses CV illimitées », « Lettres illimitées » | Chaque analyse coûte 1 crédit, chaque lettre 2 (100 crédits/mois) | FAIL |
| Gratuit : « Tous les outils IA accessibles » | Le générateur de CV est réservé à Premium/Pro/Pack ; résultat d'analyse partiellement masqué | FAIL |
| Gratuit : « Job tracker illimité » / tableau : Gratuit **non**, Premium **15**, Pro illimité | Aucune limite de 15 dans le serveur ; les trois indications se contredisent | FAIL |
| Tableau : « Accès job search » non pour Gratuit ; carte Gratuit : « Recherche d'emploi illimitée » | Contradiction (CLAUDE.md : recherche gratuite et illimitée) | FAIL |
| « Satisfait ou remboursé 7j » | Absent des CGU, aucune procédure | FAIL |
| Case photo : « absence = −25 points » | Aucune pénalité de ce type dans le code | FAIL |
| Accueil : « évaluation de chaque section (expérience, formation, compétences) » | L'analyse ne produit pas de notes par section | FAIL |
| Accueil : badges « Premium » sur lettre et candidature 1 clic | Accessibles à tous avec des crédits | FAIL |
| « 5 crédits offerts chaque mois » | Vrai (renouvellement vérifié le 13.10) | PASS |

**Contenu réellement gratuit** `[OBS]` `app.html` `displayResults` : score global, **1 point fort**, **1 amélioration** (les autres masquées avec un lien vers Tarifs), conseils suisses masqués, analyse ATS masquée. `[HYP]` Le visiteur paie 1 crédit et n'obtient pas de quoi améliorer son CV, ce qui peut expliquer qu'il ne revienne pas.

`[MES]` Entonnoir réel (comptes non internes) : 224 comptes → 98 avec au moins une analyse (44 %) → 39 avec au moins deux (17 %) → **1 abonnement payant**, 0 Pack. Inscriptions : 17 sur 30 jours, 47 sur 90 jours. Registre des paiements (depuis le 11.10) : 0.

## A5. Moteur d'analyse de CV

### Parcours technique `[OBS]`

1. **Sélection du fichier** (`app.html`) : accepte `.pdf`, `.doc`, `.docx`, `.txt`. **Les `.doc` (ancien Word) sont acceptés par le sélecteur mais refusés à l'extraction.**
2. **Extraction dans le navigateur** : PDF via pdf.js (regroupement par ligne, recollage des lettres espacées), DOCX via JSZip, TXT direct. **PDF scannés : pas de reconnaissance de texte** → message « texte trop court ». Tableaux et colonnes : lus ligne par ligne, l'ordre peut se mélanger (non testé).
3. **Troncature silencieuse à 8 000 caractères** : un CV long est analysé partiellement, sans que l'utilisateur ni l'IA ne le sachent. Risque : « section manquante » alors qu'elle a été coupée.
4. **Case « mon CV contient une photo » cochée par défaut** : si l'utilisateur ne la décoche pas, l'IA reçoit « ce CV contient une photo » même si c'est faux.
5. **Serveur** (`handleAnalyzeCVText`) : **aucune validation** du texte reçu (vide, très long, non-texte). Le texte du CV est inséré tel quel dans la consigne, **sans délimitation** (un CV peut contenir des instructions que l'IA suivrait).
6. **Un seul appel IA** : `claude-sonnet-4-6`, `max_tokens 3000`, **aucune température définie** (valeur par défaut = variabilité maximale). Pas de nouvelle tentative.
7. **Lecture de la réponse** : extraction du JSON par expression régulière ; en cas d'échec → résultat inventé (C1). Pas de validation des types ni des longueurs.
8. **Score** : « score: note globale 0-100 » et « atsScore: compatibilité ATS 0-100 », **sans critères, sans pondération, sans définition**.
9. **Enregistrement** (`cv_analyses`) puis affichage. **Le score ATS n'est jamais affiché** : le serveur renvoie `atsScore`, la page lit `ats_score`.
10. Pas de reformulation dans l'analyse ; les reformulations existent dans la candidature 1 clic et le générateur.

### Causes probables des résultats variables

| Cause | Preuve | Effet |
|---|---|---|
| Score sans grille de critères | `[OBS]` consigne | Deux analyses du même CV peuvent différer ; le chiffre n'est pas explicable. |
| Température par défaut | `[OBS]` aucun paramètre `temperature` dans le code | Variabilité maximale du modèle. |
| Faux résultat de secours | `[MES]` 8/204 | Résultats sans lien avec le CV. |
| Troncature à 8 000 caractères | `[OBS]` | Constats erronés sur les CV longs. |
| Case photo cochée par défaut | `[OBS]` | Conseils sur la photo faux dans un sens ou dans l'autre. |
| Consigne qui ne distingue pas « non documenté » et « absent » | `[OBS]` aucune règle | Risque d'affirmer qu'une compétence manque au lieu de dire qu'elle n'est pas mentionnée. |
| Conseils suisses par défaut qui poussent date de naissance, nationalité, photo | `[OBS]` textes de secours et consigne | Généralisation abusive ; informations sensibles ; risque de discrimination. |
| Pas de délimitation du texte du CV | `[OBS]` | Comportement imprévisible si le CV contient des consignes. |
| Pas de format structuré des recommandations | `[OBS]` simples phrases | Recommandations parfois génériques, difficiles à appliquer. |

`[MES]` **Variabilité observée** : sur 22 cas où un même utilisateur a analysé plusieurs fois un fichier de même nom, l'écart moyen est de **3,3 points**, l'écart maximal de **20 points** (score global comme ATS). *Limite : le CV a pu être modifié entre deux analyses ; ce n'est pas une mesure de reproductibilité pure.* Le test contrôlé (même CV, plusieurs exécutions) est **NON TESTÉ** : il consomme des appels IA payants, prévu à l'étape C avec ton accord.

### Candidature en 1 clic (réécriture du CV) `[OBS]`

- **Bon** : consigne explicite « n'invente AUCUNE information » ; champs laissés vides si absents.
- **Risques** :
  - « approxime au mois si seule l'année est connue » **fabrique des dates** ;
  - « mots-clés ATS de l'offre intégrés » dans les expériences : **risque d'exagération** ;
  - niveaux de langue convertis en catégories maison (« courant », « bilingue »…), pas en CECR ;
  - **aucune vérification automatique** du CV produit par rapport au CV d'origine (entreprises, diplômes, dates, langues).

### Coût `[MES]`

Analyse : **0,028 $ en moyenne** (104 appels mesurés). Une deuxième passe de vérification resterait inférieure à 0,06 $ par analyse, soit moins d'un tiers du prix d'un crédit à l'unité (0,27-0,40 CHF).

## A6. Mesure de la conversion

`[OBS]` Déjà en place : consentement, Google Analytics après accord, événements serveur `signup`, `first_analysis`, `job_search_used`, `checkout_started`, événements navigateur `pricing_viewed`, `premium_cta_clicked`, `signup_page_viewed`, registre des paiements alimenté par Stripe.

`[MES]` Depuis le 11.10 : `signup_page_viewed` 23 (4 personnes), `pricing_viewed` 12 (2), `signup` 2, `first_analysis` 2, `job_search_used` 1.

**Manque** : visite de l'accueil et clic sur le bouton principal (hors Google Analytics), début d'import du CV, analyse terminée côté navigateur, résultat consulté, clic sur un élément masqué (intérêt pour le payant), correction ou téléchargement, retour sur la plateforme.

**Volume** `[MES]` : ~17 inscriptions par mois. **Un test A/B de la page d'accueil ne pourra pas conclure avant plusieurs mois** à ce volume. `[REC]` Mesurer d'abord l'entonnoir complet, procéder par versions successives, et réserver l'A/B à plus de trafic (après la campagne Facebook).

## A7. Technique et sécurité

| Point | Statut |
|---|---|
| Aucun secret dans le frontend ni dans `index.js` (clés en secrets Cloudflare) | PASS |
| Suite de tests automatiques (156 tests : facturation, équipes, dossiers, compte) | PASS |
| Débit des crédits atomique, remboursement en cas d'échec de l'IA | PASS — **sauf** analyse de secours (C1), qui facture un faux résultat |
| Validation serveur de l'entrée de l'analyse | FAIL |
| Validation du format de la réponse IA | FAIL |
| Page Tarifs sur mobile (débordement horizontal) | FAIL |
| Accessibilité clavier, contrastes, performance | NON TESTÉ |
| Parcours réel en navigateur avec un compte de test sur la production | NON TESTÉ (ta capture du 17.10 sert de preuve partielle : score affiché, pas de section ATS) |
| Wrangler 3 (version 4 disponible), DNS mixte Infomaniak/Cloudflare | À traiter, non urgent |

## A8. Inconnues

- Données Google Analytics (visites de l'accueil, sources) : non consultées (accès non disponible ici).
- Qualité réelle des analyses sur un jeu de référence : à mesurer (étape C).
- Vrai comportement des PDF à colonnes et tableaux : non testé.
- Pourquoi l'avis id 11 a été refusé : à confirmer avec toi.

---

# ÉTAPE B — PROPOSITIONS

## B1. Positionnement

| Option | Avantages | Limites | Crédibilité | Clarté |
|---|---|---|---|---|
| A. Améliorer le CV pour la Suisse | Différenciant (Suisse romande), large | « Améliorer » reste vague | Bonne | Moyenne |
| **B. Trouver les faiblesses et les corriger** | Concret, démontrable avant inscription, colle au produit | Suppose un diagnostic fiable (lot 2) | **Élevée si lot 2** | **Élevée** |
| C. Adapter le CV à une offre | Très concret, forte intention d'achat | Exige une offre en main ; risque d'invention plus élevé | Moyenne (aujourd'hui) | Élevée |
| D. Candidature complète | Large valeur | Trop ambitieux, flou, concurrence directe des outils génériques | Faible | Faible |
| E. Combinaison | — | Risque de retomber dans « on fait tout » | — | — |

**Recommandation : B comme promesse principale, A comme cadre (« pour le marché suisse »), C comme deuxième étape** (« puis adaptez-le à une offre »). C'est la promesse la plus démontrable sur la page (B5) et la plus défendable face à un outil générique : le diagnostic est structuré, nuancé pour la Suisse, et ne réécrit pas votre parcours.

## B2. Trois variantes de haut de page

**Variante 1 — « Diagnostic » (recommandée)**
- Titre : **Découvrez ce qui freine votre CV, et comment le corriger.**
- Sous-titre : Une analyse de votre CV pour le marché suisse : les points à corriger en priorité, expliqués, avec une proposition de correction pour chacun.
- Soutien : Rien n'est inventé : quand une information manque, on vous pose la question.
- Bouton principal : **Analyser mon CV gratuitement** · Bouton secondaire : Voir un exemple d'analyse
- Bénéfices : 1) vos 3 corrections prioritaires, expliquées ; 2) les usages suisses vérifiés (langues CECR, permis, longueur) sans règle arbitraire ; 3) une version corrigée que vous validez.
- Visuel : une ligne du CV d'exemple → constat → correction proposée → question à confirmer.
- Cible : la personne qui envoie des candidatures sans réponse et ne sait pas pourquoi.
- Avantages : concret, vérifiable, distinct de ChatGPT. Risques : exige le lot 2 ; ne pas sur-promettre l'effet sur les entretiens.

**Variante 2 — « Standards suisses »**
- Titre : **Un CV aux usages suisses, sans deviner ce qu'attendent les recruteurs.**
- Sous-titre : Photo, langues, permis, certificats de travail, longueur : vérifiez votre CV point par point et corrigez ce qui compte.
- Soutien : Pensé pour la Suisse romande. Les usages varient selon les employeurs : nous vous expliquons quand c'est un conseil et quand c'est un choix.
- Bouton principal : **Vérifier mon CV** · Bouton secondaire : Les usages du CV suisse
- Bénéfices : 1) une liste de contrôle suisse personnalisée ; 2) des explications courtes ; 3) un modèle suisse prêt à remplir.
- Visuel : liste de contrôle cochée sur un CV d'exemple.
- Cible : nouveaux arrivants en Suisse, frontaliers, personnes en reconversion.
- Avantages : différenciation forte, référencement naturel (les guides existent déjà). Risques : niche plus étroite ; peut paraître administratif.

**Variante 3 — « Une offre précise »**
- Titre : **Adaptez votre CV à l'offre qui vous intéresse, sans rien inventer.**
- Sous-titre : Collez une offre d'emploi : voyez ce qui correspond déjà, ce qui manque dans votre CV, et une version ajustée à valider.
- Soutien : Les écarts sont signalés comme « non mentionnés dans votre CV », jamais comme des compétences que vous n'auriez pas.
- Bouton principal : **Comparer mon CV à une offre** · Bouton secondaire : Analyser mon CV sans offre
- Bénéfices : 1) correspondance expliquée ; 2) mots-clés de l'offre à ajouter seulement s'ils sont vrais ; 3) lettre de motivation en option.
- Visuel : offre à gauche, CV à droite, éléments surlignés.
- Cible : la personne qui a déjà une offre ciblée.
- Avantages : forte intention, lien naturel avec le payant. Risques : nécessite une offre ; demande plus de travail au visiteur ; risque d'invention plus élevé (à corriger d'abord).

## B3. Structure recommandée (variante 1)

| # | Section | Rôle | Statut |
|---|---|---|---|
| 1 | Haut de page : promesse + bouton + « gratuit, sans carte » | Comprendre et agir en 5 secondes | Refaire |
| 2 | **Exemple d'analyse** (CV fictif, étiqueté) : 3 constats → corrections | Preuve principale de la valeur, avant inscription | Nouveau |
| 3 | Ce que l'analyse vérifie (5-6 points, dont les usages suisses nuancés) | Répondre à « que vais-je obtenir ? » | Nouveau, court |
| 4 | Comment ça marche (vidéo actuelle) | Réduire l'effort perçu | Garder, corriger |
| 5 | Ensuite : adapter à une offre, lettre, suivi | Montrer la suite sans noyer | Regrouper les 6 cartes en 3 |
| 6 | Confiance : données (LPD, suppression, rien n'est inventé), qui est derrière | Lever la crainte de téléverser son CV | Nouveau |
| 7 | Gratuit / payant, en une phrase + lien Tarifs | Rendre le passage naturel | Nouveau, court |
| 8 | FAQ (5 questions) | Objections | Nouveau |
| 9 | Appel final | — | Garder |

**Écartées pour l'instant** : avis clients (jusqu'à en avoir de vrais), statistiques d'utilisation (trop faibles et non vérifiables comme formulées), section « marché caché » (pas notre produit).

## B4. Texte proposé (variante 1)

> **Découvrez ce qui freine votre CV, et comment le corriger.**
> Une analyse de votre CV pour le marché suisse : les points à corriger en priorité, expliqués, avec une proposition de correction pour chacun.
> [Analyser mon CV gratuitement] · Voir un exemple d'analyse
> *Gratuit, sans carte bancaire · Rien n'est inventé : quand une information manque, on vous la demande.*

> **Exemple d'analyse** *(CV fictif, créé pour illustrer)*
> Constat · Vos expériences décrivent des tâches, pas leur portée.
> Pourquoi · Le recruteur comprend ce que vous faisiez, pas l'ampleur de votre rôle.
> Proposition · « Gestion des commandes fournisseurs (achats courants, suivi des livraisons) »
> À confirmer · Combien de fournisseurs ou de commandes par mois ? *Si vous ne savez pas, la formulation reste correcte sans chiffre.*

> **Ce que l'analyse vérifie** — La clarté de vos expériences · la structure et la longueur · les langues et leur niveau (CECR) · les informations utiles en Suisse (permis, disponibilité), présentées comme des options · la cohérence des dates · la lisibilité par les logiciels de tri (estimation, pas une garantie).

> **Vos données** — Protégées selon la loi suisse (LPD). Votre CV sert uniquement à votre analyse. Vous pouvez supprimer votre compte et vos données à tout moment.

> **FAQ** — Est-ce gratuit ? · Qu'est-ce qui change par rapport à ChatGPT ? · Le score ATS est-il fiable ? · Que devient mon CV ? · Faut-il une photo sur un CV suisse ?

## B5. Démonstration honnête de l'analyse

Contenu de l'exemple (CV **fictif**, étiqueté comme tel) :
1. **Constat** tiré d'une ligne précise du CV.
2. **Pourquoi** (une phrase).
3. **Proposition de correction** fondée uniquement sur ce qui est écrit.
4. **Version corrigée** de la ligne.
5. **Ce que le candidat doit confirmer** (chiffres, périmètre).
6. **Limites** : « Cette analyse estime la clarté et la structure de votre CV. Elle ne prédit pas la décision d'un employeur ».

Jamais de chiffre ajouté dans la version corrigée s'il n'est pas dans l'original.

## B6. Modifications techniques prioritaires (moteur)

**P0 — honnêteté (petit effort, gros impact sur la confiance)**
1. Supprimer le résultat inventé : en cas de réponse illisible, **une nouvelle tentative**, puis message d'erreur et **crédit rendu** (le mécanisme de remboursement existe déjà).
2. Valider côté serveur le texte reçu (longueur minimale et maximale) et **signaler la troncature** au lieu de couper en silence (augmenter la limite, indiquer « seules les N premières pages ont été lues »).
3. Fixer une **température basse** pour l'analyse.
4. **Délimiter** le texte du CV dans la consigne et préciser qu'il s'agit de données, pas d'instructions.
5. Corriger l'affichage du **score ATS** (et le présenter comme une estimation).
6. Case photo : **non cochée par défaut**, avec une option « je ne sais pas » ; retirer « −25 points ».
7. Retirer des textes par défaut les injonctions (photo, date de naissance, nationalité) : ce sont des options selon le contexte.

**P1 — fiabilité et actionnabilité**
1. **Grille de notation explicite** : l'IA note des critères fixes (par exemple clarté des expériences, structure, langues, informations suisses utiles, cohérence chronologique, lisibilité ATS) sur une échelle définie ; **le score global est calculé par le code** avec une pondération documentée. Le score devient explicable et plus stable.
2. **Recommandations structurées** : élément concerné, constat, pourquoi, action, proposition, à confirmer, priorité.
3. Règle « **non documenté ≠ absent** » dans la consigne et dans les libellés.
4. **Validation de la réponse** (schéma : types, longueurs, cohérence score/constats).
5. Candidature 1 clic : ne plus approximer les dates ; n'ajouter un mot-clé que s'il est appuyé par le CV ; niveaux de langue CECR ; **vérificateur automatique** comparant le CV produit au CV d'origine (entreprises, diplômes, dates, langues) avec signalement des écarts à l'utilisateur.

**P2 — seulement si l'évaluation montre un gain**
- Analyse en deux passes (extraction structurée, puis diagnostic).
- Reconnaissance de texte pour les PDF scannés.
- Re-vérification après correction (score avant/après sur les seuls critères modifiés).

## B7. Méthode d'évaluation de la qualité

**Jeu de test** : 20 CV **synthétiques** (aucun CV réel), en français, couvrant : premier emploi, junior, expérimenté, cadre, reconversion, interruption de carrière, CV très court, très dense, mal structuré, PDF à deux colonnes, administratif, technique (IT), commercial, métier de terrain (logistique, vente, soins), multilingue (FR/DE/EN), frontalier, permis B, CV avec et sans photo. Chaque CV contient des **défauts connus volontairement** (dates incohérentes, tâches sans portée, langues sans niveau…) et des **qualités connues**.

**Attentes de référence** (écrites à la main, pas par l'IA) : défauts à détecter, choses à ne pas affirmer (« ne maîtrise pas Excel »), informations à ne jamais modifier.

**Grille** (0 à 3 par critère, avec exemples faible/moyen/excellent dans le fichier d'évaluation) : exactitude du diagnostic · pertinence métier et niveau · spécificité · applicabilité · respect des faits · qualité rédactionnelle · cohérence interne · justification du score · absence de conseils inutiles ou contradictoires · qualité de l'extraction.
**Erreurs critiques** (une seule = échec du CV, quelle que soit la moyenne) : expérience, diplôme, compétence ou chiffre inventé · recommandation discriminatoire · conseil trompeur · score incohérent avec les constats.

**Reproductibilité** : 5 CV × 3 exécutions, avant et après. Variation acceptable : formulation ; défauts : constats prioritaires différents, écart de score supérieur à 5 points (seuil à valider).

**Coût estimé** : ~65 appels (20 avant + 20 après + 2×15 répétitions + vérifications) × ~0,03-0,06 $ ≈ **2 à 4 $**.

## B8. Gratuit et payant (à valider par toi : touche l'offre)

`[REC]` Le gratuit doit permettre de **corriger réellement son CV** : par exemple les **3 constats prioritaires complets** (constat, pourquoi, proposition). Le payant apporte : toutes les recommandations, la réécriture complète, l'adaptation à une offre, les lettres, le générateur, plus de crédits. `[HYP]` Montrer la valeur avant de demander de payer augmente le retour sur la plateforme. **Aucune modification sans ta validation.**

## B9. Mesure et tests

**Événements à ajouter** (sans contenu de CV, dédoublonnés par personne et par jour, consentement respecté) : `home_viewed`, `home_cta_clicked`, `analysis_started` (fichier choisi), `analysis_completed` (serveur), `results_viewed`, `locked_item_clicked`, `correction_copied` / `cv_downloaded`, `returned_7d` (calculé côté serveur). Le paiement reste confirmé uniquement par le webhook Stripe signé (déjà le cas).

**Tests** : vu le volume (~17 inscriptions par mois), **pas d'A/B concluant à court terme**. Plan : 1) mettre la mesure en place ; 2) mettre en ligne la variante 1 et comparer 4 semaines avant/après sur l'entonnoir complet (en notant les autres changements, par exemple la campagne Facebook) ; 3) lancer l'A/B variante 1 contre variante 3 quand le trafic le permet, sur une seule différence, avec une durée fixée à l'avance.

## B10. Priorisation

| Lot | Contenu | Conversion | Confiance | Effort | Risque technique | Mesure | Validation requise |
|---|---|---|---|---|---|---|---|
| **1. Honnêteté** | Faux résultat de secours, faux avis, statistiques, promesses Tarifs, −25 points, case photo, bug ATS, Tarifs mobile | Moyen | **Très élevé** | **0,5 à 1 jour** | Faible | Facile | Retrait des avis, textes de Tarifs (pas les prix) |
| **2. Moteur v2** | P0 restant + P1 + jeu d'évaluation + comparaison avant/après | Élevé (rétention) | Élevé | 2 à 4 jours | Moyen (format de réponse, affichage) | Jeu de test | Grille de notation |
| **3. Accueil** | Variante 1, exemple d'analyse, FAQ, regroupement des fonctions | Élevé `[HYP]` | Élevé | 1 à 2 jours | Faible | Entonnoir | Texte final, choix de variante |
| **4. Mesure** | Événements manquants, tableau de bord de l'entonnoir | Indirect | — | 0,5 à 1 jour | Faible | — | — |
| **5. Gratuit/payant** | Nouveau découpage | Élevé `[HYP]` | Moyen | 0,5 jour | Faible | Entonnoir | **Décision commerciale** |

Ordre proposé : **1 → 4 → 2 → 3 → 5**. La mesure avant le moteur et l'accueil, pour pouvoir comparer.

## B11. Risques

- Changer le format de réponse de l'analyse peut casser l'affichage, l'historique et le PDF exporté : nouvelle version rétrocompatible, tests de non-régression.
- Les scores des nouvelles analyses ne seront pas comparables aux anciens : l'indiquer dans l'historique.
- Retirer les faux avis réduit la « preuve sociale » à court terme : la remplacer par la démonstration et de vrais avis.
- Coût IA : maîtrisé (moins de 0,06 $ par analyse même avec une vérification).

## B12. Décisions dont j'ai besoin

1. **Lot 1** : je retire les 3 avis d'exemple de l'accueil, les 3 avis codés en dur de Tarifs et les statistiques non vérifiables ? Je corrige les textes de Tarifs (sans toucher aux prix) ?
2. Tu confirmes l'ordre **1 → 4 → 2 → 3 → 5** ?
3. Tu acceptes un budget d'environ **2 à 4 $ d'appels IA** pour l'évaluation (étape C, moteur v2) ?
4. Variante d'accueil : **1 (Diagnostic)** comme base ?
5. Gratuit/payant (B8) : on en discute après le lot 2, chiffres d'entonnoir en main ?
6. L'avis refusé (3 étoiles) : le republier ?
