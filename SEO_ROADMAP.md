# SEO Roadmap — SwissCV Pro

Suivi des pages SEO créées et planifiées. Ne pas créer de page programmatique sans intention de recherche réelle et valeur spécifique (voir CLAUDE.md pour le contexte produit).

## Fondations techniques (faites — 21.08.2026)
- `robots.txt` créé (n'existait pas — servait le HTML de la homepage à la place)
- `sitemap.xml` créé (même problème)
- `_redirects` nettoyé (règles mortes vers des fichiers inexistants + catch-all 404 dangereux supprimé)
- Duplicate content `/accueil/` bloqué via robots.txt (même contenu que `/`)
- Propriété Google Search Console ajoutée et sitemap soumis par l'utilisateur (21.08.2026)

## Cluster 1 — CV Suisse (pages à forte intention commerciale)

| URL | Mot-clé principal | Intention | Statut | Créée le |
|---|---|---|---|---|
| `/cv-suisse.html` | cv suisse | Informationnelle + commerciale | ✅ Publiée | 21.08.2026 |
| `/modele-cv-suisse.html` | modèle cv suisse | Commerciale | ✅ Publiée | 21.08.2026 |
| `/cv-ats.html` | cv ats | Informationnelle | ✅ Publiée | 21.08.2026 |
| `/analyse-cv.html` | analyse cv | Commerciale forte | ✅ Publiée | 21.08.2026 |
| `/adapter-cv-offre-emploi.html` | adapter cv offre emploi | Commerciale | ✅ Publiée | 21.08.2026 |
| `/lettre-motivation-suisse.html` | lettre de motivation suisse | Informationnelle + commerciale | ✅ Publiée | 21.08.2026 |

## Détail — `/cv-suisse.html`
- **Title** : CV Suisse : structure, photo, langues et erreurs à éviter | SwissCV Pro
- **Meta description** : Comment rédiger un CV suisse qui respecte les standards du marché de l'emploi en Suisse romande...
- **H1** : CV Suisse : la structure et les codes attendus par les recruteurs
- **CTA principal** : Analyser gratuitement mon CV → `/app.html`
- **CTA secondaire** : Voir des modèles de CV → `/cv-templates.html`
- **Données structurées** : Article, BreadcrumbList, FAQPage (4 questions réelles, visibles sur la page)
- **Liens internes sortants** : `/app.html`, `/cv-templates.html`, `/pricing.html`, `/contact.html`, `/support.html`, `/modele-cv-suisse.html`, `/cv-ats.html`, `/analyse-cv.html`

## Détail — `/modele-cv-suisse.html`
- **Title** : Modèle de CV Suisse : structure et exemples concrets | SwissCV Pro
- **H1** : Modèle de CV Suisse
- **CTA principal** : Analyser mon CV gratuitement → `/app.html`
- **CTA secondaire** : Voir les modèles SwissCV Pro → `/cv-templates.html`
- **Données structurées** : BreadcrumbList (pas de FAQ — pas de section Q/R réelle sur cette page)
- **Liens internes sortants** : `/app.html`, `/cv-templates.html`, `/cv-suisse.html`, `/cv-ats.html`

## Détail — `/cv-ats.html`
- **Title** : CV ATS : comment passer les logiciels de tri de CV | SwissCV Pro
- **H1** : CV ATS : comment passer les logiciels de tri automatique
- **CTA principal** : Analyser mon CV gratuitement → `/app.html`
- **Données structurées** : Article, BreadcrumbList, FAQPage (3 questions réelles)
- **Liens internes sortants** : `/app.html`, `/cv-suisse.html`, `/modele-cv-suisse.html`, `/analyse-cv.html`

## Détail — `/analyse-cv.html`
- **Title** : Analyse de CV gratuite en ligne par IA | SwissCV Pro
- **H1** : Analyse CV gratuite : score, ATS et conseils personnalisés
- **CTA principal** : bouton hero direct sous le H1 → `/app.html`
- **Données structurées** : SoftwareApplication (offre 0 CHF), BreadcrumbList
- **Liens internes sortants** : `/app.html`, `/cv-suisse.html`, `/cv-ats.html`, `/pricing.html`

## Détail — `/adapter-cv-offre-emploi.html`
- **Title** : Comment adapter son CV à une offre d'emploi | SwissCV Pro
- **H1** : Adapter son CV à une offre d'emploi
- **CTA principal** : Analyser mon CV gratuitement → `/app.html`
- **Données structurées** : Article, BreadcrumbList
- **Liens internes sortants** : `/app.html`, `/cv-suisse.html`, `/analyse-cv.html`, `/cover-letter.html`

## Détail — `/lettre-motivation-suisse.html`
- **Title** : Lettre de motivation Suisse : structure, exemple et erreurs à éviter | SwissCV Pro
- **H1** : Lettre de motivation Suisse : structure et exemple
- **CTA principal** : Analyser mon CV gratuitement → `/app.html` (cover-letter.html nécessite une connexion, pas utilisable comme CTA d'entrée)
- **CTA secondaire** : Voir les tarifs → `/pricing.html`
- **Données structurées** : Article, BreadcrumbList, FAQPage (2 questions réelles)
- **Liens internes sortants** : `/app.html`, `/pricing.html`, `/cv-suisse.html`, `/adapter-cv-offre-emploi.html`, `/analyse-cv.html`

## Groupes suivants (non commencés, à prioriser après retour Search Console)
- Pages par situation (CV sans expérience, CV étudiant, CV reconversion, CV frontalier...)
- Pages par métier (CV infirmier, CV développeur, CV comptable...)
- Pages géographiques (CV Genève, CV Lausanne, CV Vaud...) — seulement si contenu réellement différenciant, jamais du remplissage
- Blog / guides (`/blog/`)

⚠️ Ne pas produire ces pages en masse sur la base de suppositions. Une fois quelques semaines de données Search Console disponibles (impressions, requêtes, positions), prioriser les groupes suivants selon la demande réelle observée plutôt que selon ce plan initial.

## Ce qui reste à faire côté technique
- Vérifier Core Web Vitals une fois plusieurs pages en ligne
- Ajouter `hreflang` seulement si une version dans une autre langue est créée (pas nécessaire pour l'instant, site 100% français)
- Suivi conversion (page_view → signup → cv_analysis → premium) — à connecter à Google Analytics existant (`G-VE7PJZTF8L`, déjà présent sur `index.html`)
