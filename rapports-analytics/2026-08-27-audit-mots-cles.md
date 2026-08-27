# Audit SEO — mots-clés Search Console sous-performants (27 août 2026)

⚠️ Analyse ponctuelle demandée à l'agent, en complément du
[rapport hebdomadaire automatique](../RAPPORT-ANALYTICS-HEBDOMADAIRE.md) (lecture seule).
Ce document propose des **corrections on-page**, appliquées dans cette même Pull Request,
à valider par revue humaine avant merge et déploiement (aucune correction n'est poussée en
production automatiquement — voir `.cursor/commands/seo-merge.md` / `seo-deploy.md`).

## Méthode

- Données interrogées en direct via l'API Google Search Console (mêmes identifiants OAuth
  que le serveur MCP et le rapport hebdomadaire — lecture seule, `webmasters.readonly`).
- Fenêtre analysée : 90 jours glissants (**2026-05-26 → 2026-08-24**, décalage de fraîcheur
  Search Console de 3 jours). En pratique, le trafic mesurable ne démarre que le **21/07/2026**
  (~35 jours de données) : le site est très récent, les volumes sont encore faibles et toute
  conclusion doit être lue avec cette réserve statistique.
- Complément : statut d'indexation de chaque page du sitemap via l'API URL Inspection
  (même mécanique que `scripts/analytics-weekly-report.mjs`).

## 🔴 Constat n°1 (le plus actionnable) : une page « argent » n'a jamais été indexée par Google

| Page | Statut Search Console | Dernier passage de Google |
| --- | --- | --- |
| `implantologie-pose-implants-dentaires.html` | ⏳ **Découverte, non indexée** (« Discovered – currently not indexed ») | **jamais** |

« Pose d'implants dentaires (Straumann®) » est probablement l'un des mots-clés les plus
rentables du cabinet — et sa page n'a **jamais été explorée par Google**, donc **0
impression, 0 clic** depuis la mise en ligne. Toutes les autres pages traitement du sitemap
sont bien indexées (`✅ Submitted and indexed`), avec le même maillage interne, le même
sitemap (`lastmod` identique) et une longueur de contenu comparable — ce n'est donc pas un
problème de contenu dupliqué ou de balisage technique (title/description/canonical/robots
tous corrects), mais très probablement une question de **priorité de crawl** sur un site
encore jeune et à faible autorité.

**Ce que ce rapport ne peut pas corriger par du code** : l'API Search Console utilisée ici
est en lecture seule (`webmasters.readonly`), volontairement — aucune demande d'indexation
n'a été ni ne peut être envoyée automatiquement.

➡️ **Action recommandée pour vous (humain, dans la Search Console)** : ouvrez
[Search Console → Inspection d'URL](https://search.google.com/search-console/inspect),
collez `https://paro-spe.fr/implantologie-pose-implants-dentaires.html`, puis cliquez sur
**« Demander une indexation »**. Cette action ne peut être faite que depuis un compte humain
autorisé sur la propriété.

*(Note secondaire, sans lien avec le SEO commercial : `politique-de-confidentialite.html` est
elle aussi « Découverte, non indexée » — normal et sans conséquence pour une page légale.)*

## 🟠 Constat n°2 : le trafic actuel est presque entièrement « de marque », pas encore « de valeur »

Sur les 13 requêtes distinctes visibles sur 90 jours (Search Console masque les requêtes trop
rares dès qu'elles sont croisées avec la dimension « page », ce qui limite la granularité
possible sur un site à si faible volume), la quasi-totalité concerne des recherches du **nom
des praticiens**, pas des actes de soins :

| Requête | Clics | Impressions | CTR | Position moy. |
| --- | --- | --- | --- | --- |
| cathy birgy | 2 | 20 | 10.0% | 2.7 |
| dr birgy cathy | 2 | 11 | 18.2% | 4.7 |
| raphael brochand dentiste | 2 | 8 | 25.0% | 8.4 |
| dr cathy birgy | 1 | 15 | 6.7% | 3.5 |
| birgy dentiste | 0 | 9 | 0.0% | 8.4 |
| dr birgy reims | 0 | 7 | 0.0% | 11.4 |
| dr brochand chatenay malabry | 0 | 7 | 0.0% | 9.6 |
| docteur birgy | 0 | 2 | 0.0% | 20.0 |
| dr birgy | 0 | 2 | 0.0% | 12.0 |
| dentiste birgy | 0 | 2 | 0.0% | 8.5 |
| birgy | 0 | 1 | 0.0% | 12.0 |
| parpaleix | 0 | 1 | 0.0% | 59.0 |
| **poche parodontale** | 0 | 1 | 0.0% | **1.0** |

`poche parodontale` est la **seule requête « de service »** visible, et elle se classe déjà
1ʳᵉ position — mais avec une seule impression sur 90 jours, impossible d'en tirer une
conclusion fiable pour l'instant. À surveiller dans les prochains rapports hebdomadaires.

Vu par page, les 8 pages « actes » (implantologie / parodontie / chirurgie orale, hors pages
de suivi/maintenance) ne représentent au total que **43 impressions et 2 clics sur 90 jours**,
contre **461 impressions et 55 clics** pour la page d'accueil et les 3 pages « spécialiste »
(portées par les recherches de noms). C'est cohérent avec un site très jeune : la notoriété de
marque arrive avant le référencement sur les mots-clés « actes/valeur », qui demande plus de
temps, de contenu et de liens.

## 🟡 Constat n°3 : « dr birgy reims » — une requête réelle, avec une explication vérifiable dans le contenu existant

7 impressions, 0 clic, position moyenne 11.4 sur 90 jours pour cette requête, toutes sur la
page `specialiste-cathy-birgy.html`. Ce n'est **pas une confusion d'adresse** : le Dr Cathy
Birgy a réellement été *« Assistante hospitalo-universitaire à la Faculté de Chirurgie
Dentaire de Reims »* — un fait déjà présent sur sa page, mais **noyé dans une liste à puces
de formations**, sans aucune phrase de présentation qui le mette en avant pour les moteurs de
recherche (ni dans le `<title>`, ni dans la description, ni en texte courant).

➡️ **Corrigé dans cette PR** : ajout d'un paragraphe de présentation (voir plus bas), rédigé
uniquement à partir des informations déjà publiées sur la page (aucune information inventée).

## 🟡 Constat n°4 : `<title>` de la page d'accueil trop long (114 caractères), tronqué par Google dans les résultats de recherche

Google tronque généralement les balises `<title>` au-delà d'environ 55-60 caractères
(~600 px). La page d'accueil — de loin la page la plus vue (259 impressions / 39 clics sur 90
jours, 15,1 % de CTR) — avait un titre de **114 caractères** :

> « Cabinet de chirurgie dentaire à Châtenay-Malabry (92) — Parodontie, Implantologie &
> Chirurgie orale \| Paro-Spé »

➡️ **Corrigé dans cette PR** : titre raccourci à 58 caractères, en conservant les 3
mots-clés de service, la marque et le département (`title`, `og:title`, `twitter:title` et le
`name` du JSON-LD `WebPage` mis à jour de façon cohérente) :

> « Parodontie, implantologie, chirurgie orale — Paro-Spé (92) »

## 🟡 Constat n°5 : les 3 pages « spécialiste » n'ont aucun texte de présentation (E-E-A-T)

Les pages `specialiste-cathy-birgy.html`, `specialiste-raphael-brochand.html` et
`specialiste-cecile-guelaud.html` n'affichaient qu'un titre et une liste à puces de diplômes,
sans aucune phrase de présentation. Sur un site de santé (contenu « YMYL » — *Your Money or
Your Life* — pour lequel Google accorde une importance particulière à l'expertise démontrée),
une biographie rédigée renforce la qualité perçue de la page, en plus de mieux faire
apparaître les informations déjà publiées (dont, pour le Dr Birgy, le lien avec Reims du
constat n°3).

➡️ **Corrigé dans cette PR** : un paragraphe d'introduction a été ajouté sur les 3 pages,
juste avant la liste à puces existante (classe `.treatment-page__prose`, déjà utilisée sur les
autres pages traitement du site — voir `css/sections.css`), en reformulant uniquement les
informations déjà présentes dans chaque liste de formations. Aucun fait n'a été inventé,
aucun titre ni meta description n'a été modifié sur ces 3 pages (elles se classent déjà
correctement — positions 2,5 à 7,5 — pour les recherches de noms ; le risque de casser ce qui
fonctionne dépassait le gain incertain d'un changement de snippet).

## Résumé des corrections appliquées dans cette Pull Request

| Fichier | Changement | Risque |
| --- | --- | --- |
| `index.html` | `<title>` / `og:title` / `twitter:title` / JSON-LD `WebPage.name` raccourcis (114 → 58 caractères) | Faible — reformulation, mêmes mots-clés, marque et département conservés |
| `specialiste-cathy-birgy.html` | Paragraphe de présentation ajouté (mentionne Reims, fait déjà publié) | Faible — aucune information nouvelle, aucun titre/description modifié |
| `specialiste-raphael-brochand.html` | Paragraphe de présentation ajouté | Faible — idem |
| `specialiste-cecile-guelaud.html` | Paragraphe de présentation ajouté | Faible — idem |

## Ce qui n'a volontairement pas été modifié

- **Aucun contenu médical ou tarifaire inventé** (FAQ patients, prix, remboursement
  mutuelle/Sécu) : ce type de contenu à forte valeur SEO doit être rédigé et validé par les
  praticiens eux-mêmes sur un site de santé — un agent ne doit pas produire d'affirmations
  médicales ou financières non vérifiées.
- **Aucune extension géographique inventée** (villes voisines de Châtenay-Malabry) : je n'ai
  aucune source fiable confirmant les secteurs réellement couverts par le cabinet.
- **Meta descriptions des 3 pages spécialiste laissées identiques entre elles** : ces pages se
  classent déjà bien (positions 2,5 à 7,5) sur les recherches de noms ; les différencier
  aurait un intérêt SEO marginal face au risque de dégrader un snippet qui fonctionne, sur un
  volume encore trop faible pour mesurer l'effet.
- **Aucune demande d'indexation envoyée** (voir constat n°1) : nécessite une action humaine
  dans l'interface Search Console, hors du périmètre en lecture seule de cet agent.

## Recommandations pour la suite (non codées, à décider par vous)

1. **Demander l'indexation** de `implantologie-pose-implants-dentaires.html` dans Search
   Console (constat n°1) — c'est le gain le plus rapide et le plus certain identifié dans cet
   audit.
2. Laisser le [rapport hebdomadaire automatique](../RAPPORT-ANALYTICS-HEBDOMADAIRE.md)
   continuer à tourner pour accumuler du volume : avec aussi peu d'impressions par mot-clé,
   toute optimisation fine du CTR par requête reste statistiquement fragile pour l'instant.
   Refaire cet audit dans 2-3 mois avec plus de données.
3. Vérifier la fiche Google Business Profile / les citations locales (cohérence nom-adresse-
   téléphone), notamment si l'établissement apparaît par erreur ailleurs qu'à
   Châtenay-Malabry.
4. À moyen terme, envisager d'enrichir les pages « actes » (implantologie, parodontie,
   chirurgie orale) avec des sections FAQ validées médicalement par les praticiens : c'est le
   levier le plus efficace pour capter les recherches longue traîne autour des actes (douleur,
   durée, tarif, remboursement), mais cela nécessite une rédaction éditoriale humaine, pas une
   génération automatique.

---
_Audit réalisé le 2026-08-27, à la demande explicite du propriétaire du dépôt. Lecture seule
côté Search Console ; seules les pages HTML listées ci-dessus ont été modifiées, et
uniquement après revue de leur contenu existant._
