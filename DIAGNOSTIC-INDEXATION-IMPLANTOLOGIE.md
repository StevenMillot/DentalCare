# Diagnostic : page « Pose d'implants dentaires » non indexée par Google

## Constat

Le rapport analytics hebdomadaire signale que 2 pages du sitemap ont le statut
Search Console **« Discovered - currently not indexed »** :

- `https://paro-spe.fr/implantologie-pose-implants-dentaires.html`
- `https://paro-spe.fr/politique-de-confidentialite.html`

Ce statut veut dire que Google **connaît l'URL** (via le sitemap, et parfois via un
lien entrant) mais **ne l'a encore jamais explorée/indexée**. Ce n'est pas une erreur
bloquante (comme une page en 404 ou un `noindex`) : c'est une question de priorité de
crawl de la part de Google.

## Vérifications effectuées (aucun problème technique trouvé)

| Vérification | Résultat |
| --- | --- |
| Code HTTP de la page | `200 OK` |
| `robots.txt` | Autorise l'exploration (`Allow: /`, aucune règle ne bloque `.html`) |
| Balise `<meta name="robots">` | `index, follow, max-snippet:-1, max-image-preview:large` — correct |
| `<link rel="canonical">` | Auto-référencée, correcte |
| Présence dans `sitemap.xml` | Oui, avec `priority` 0.9 (plus haute que ses pages sœurs à 0.8) |
| En-têtes HTTP (cache, sécurité) | Identiques à ceux des pages déjà indexées |
| Comparaison avec les pages sœurs indexées (`implantologie-reconstruction-osseuse-gingivale.html`, `implantologie-maintenance-suivi-implantaire.html`) | Même gabarit HTML, même `lastmod`, même nombre de liens internes (1, uniquement depuis `index.html`) |

Conclusion : **il n'y a pas de blocage technique**. Google a « découvert » la page
mais n'a pas encore jugé prioritaire de l'explorer — un cas fréquent sur les petits
sites (peu de pages, autorité de domaine encore faible), surtout pour des pages dont
le contenu est perçu comme proche de pages sœurs déjà explorées.

## Point faible identifié : maillage interne quasi inexistant

Chacune des pages de traitement (`implantologie-*.html`, `parodontie-*.html`,
`chirurgie-orale-*.html`) n'était reliée que par **un seul lien entrant**, toujours
depuis `index.html`. Aucune des pages de traitement ne renvoyait vers une autre page
de traitement (pas de maillage « frère à frère »). Un maillage interne pauvre est un
facteur qui peut retarder l'indexation de pages jugées secondaires par les moteurs de
recherche.

## Correction appliquée dans cette PR

Ajout d'une section **« Voir aussi »** en bas du contenu des 3 pages du groupe
Implantologie, avec des liens croisés vers les 2 autres pages du même groupe :

- `implantologie-pose-implants-dentaires.html` → renvoie vers les 2 autres
- `implantologie-reconstruction-osseuse-gingivale.html` → renvoie vers les 2 autres
- `implantologie-maintenance-suivi-implantaire.html` → renvoie vers les 2 autres

Cela fait passer chaque page de 1 à 3 liens internes entrants, en réutilisant les
classes CSS déjà existantes (`treatment-page__prose h2`, `treatment-page__bullets`),
sans ajouter de nouveau CSS ni casser le gabarit visuel.

Cette même logique pourra être répliquée plus tard sur les groupes Parodontologie et
Chirurgie orale si besoin (non fait ici pour rester focalisé sur la page signalée).

## Action complémentaire à faire manuellement (aucune API fiable pour l'automatiser)

Le maillage interne aide sur la durée, mais l'action la plus rapide et fiable pour
faire indexer ces 2 pages **dès maintenant** est de demander explicitement leur
indexation dans Search Console (faisable au mobile, en 30 secondes par page) :

1. Ouvrir [Google Search Console](https://search.google.com/search-console) sur le
   site `paro-spe.fr`.
2. Coller l'URL complète dans la barre de recherche en haut (« Inspecter n'importe
   quelle URL... ») :
   - `https://paro-spe.fr/implantologie-pose-implants-dentaires.html`
   - `https://paro-spe.fr/politique-de-confidentialite.html`
3. Sur l'écran de résultat, cliquer sur **« Demander une indexation »**.
4. Répéter pour la seconde URL.

Google explore alors la page sous quelques heures/jours (pas de garantie de délai
exact, mais c'est beaucoup plus rapide que d'attendre un crawl spontané). Le rapport
analytics hebdomadaire confirmera automatiquement si le statut passe à « Indexée ».

> Remarque : l'API Google *Indexing API* existe, mais elle est **officiellement
> réservée** aux pages de type `JobPosting` ou `BroadcastEvent` — l'utiliser pour des
> pages classiques violerait les conditions d'utilisation de Google et pourrait
> pénaliser le site. La demande manuelle via l'interface Search Console reste donc la
> seule méthode fiable et autorisée.
