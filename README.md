# DentalCare (Parodontia) — site statique

Site vitrine statique (HTML/CSS/JS) avec pages “traitement”, formulaire de contact, et optimisations perf/SEO adaptées à un déploiement **GitHub Pages** et/ou domaine.

## Lancer en local

Évite `file://` (certaines APIs et chemins se comportent différemment). Utilise un serveur statique :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://127.0.0.1:8000/`.

## Déploiement GitHub Pages (important)

- **Manifest** : `site.webmanifest` utilise `start_url: "./"` et `scope: "./"` pour fonctionner correctement dans un sous-dossier (`/DentalCare/`).

## Images responsive (`srcset`)

Les photos (équipe, galerie) sont servies avec `srcset` + `sizes` pour éviter de télécharger des images trop lourdes sur mobile.

### Générer / régénérer les variantes

Prérequis : Node.js + npm (dépendance dev `sharp`).

```bash
npm install
npm run images:responsive
```

Génère automatiquement :

- **Galerie cabinet (AVIF)** : `assets/cabinet-gallery/*-{480,960,1600}w.avif`
- **Portraits équipe (JPG)** : `assets/team/*-{360,720,1080}w.jpg`

Script : `tools/generate-responsive-images.mjs`

## CSS bundle

Le site charge `css/bundle.css` (une seule feuille) pour réduire les requêtes bloquantes.

### Générer / régénérer le bundle

```bash
npm run css:bundle
```

## Commandes rapides

### Avant de déployer (recommandé)

Régénère les assets “buildés” (CSS + sprite inline) **et** bump la version du cache du service worker (pour forcer la mise à jour côté utilisateurs) :

```bash
npm run deploy:prepare
```

### En dev (actualiser les assets)

Régénère le **bundle CSS minifié** (`css/bundle.css`), resynchronise le sprite inline dans **`js/script.js`**, puis produit les fichiers **`js/script.min.js`** et **`js/cabinet-media-carousel.min.js`** (c’est ce que charge le HTML en prod).

```bash
npm run dev:refresh
```

Après toute modification de **`js/script.js`** ou du CSS source, relance cette commande avant commit / déploiement.

### Images responsive (vérifier / corriger)

Le site attend des déclinaisons :

- **Team (JPG)** : 360 / 540 / 720 / 1080
- **Cabinet carousel (AVIF)** : 240 / 480 / 640 / 960 / 1600

Commandes :

```bash
# Génère les variantes manquantes (idempotent)
npm run images:responsive

# Vérifie que toutes les variantes attendues existent
npm run images:check
```

## Icônes SVG (sprite) — important

Le site utilise un sprite `assets/Icones/icons.svg` et des `<use href="assets/Icones/icons.svg#...">` dans les pages.

### Cas `file://` (ou environnement qui bloque `assets/Icones/icons.svg`)

En `file://`, les références externes SVG sont bloquées par le navigateur. Pour garantir l’affichage, `js/script.js` (puis `script.min.js` après `npm run dev:refresh`) contient une **copie inline** du sprite (`INLINE_SPRITE_SVG`) utilisée en fallback.

Donc, si tu modifies `assets/Icones/icons.svg`, il faut **synchroniser** cette copie inline :

```bash
npm run icons:sync-inline
```

### Cas HTTP/HTTPS (localhost, GitHub Pages, prod)

Le sprite est chargé “normalement” via `assets/Icones/icons.svg` (et peut être mis en cache par le service worker).  
Si tu ne vois pas un changement après refresh :

- vérifie le cache/service worker (voir section PWA ci-dessous)
- ou fais un hard refresh / désenregistre le SW le temps de valider

## Formulaire de contact

- **Validation JS dédiée** (messages inline + toast) : pas de dépendance aux comportements `checkValidity()` du navigateur.
- **Envoi** : FormSubmit (ou Web3Forms si configuré), avec fallback `mailto:` en cas d’échec.

## PWA / Service Worker

- **Manifest** : `site.webmanifest` — sur **`index.html`**, le lien est injecté après `window.load` (chaîne critique plus courte) ; les autres pages gardent un `<link rel="manifest">` classique.
- **Service worker** : `sw.js`

Le SW applique :

- **HTML** : network-first (toujours à jour, fallback cache/offline)
- **Assets (`.css/.js/.svg/.mp4/...`)** : cache-first (visites répétées plus rapides même si GitHub Pages envoie un `Cache-Control` court côté HTTP).

**TTL HTTP (Lighthouse « durée de mise en cache »)** : sur `github.io`, les en-têtes `Cache-Control` (~10 min) sont **imposés par GitHub** ; on ne peut pas les allonger depuis le dépôt. Pour un TTL long au premier chargement, il faut un **CDN** (ex. Cloudflare) devant le site.

Si tu modifies un asset (ex: `assets/Icones/icons.svg`, `js/script.js` puis `dev:refresh`, `css/` sources puis `dev:refresh`) et que ça ne se reflète pas, il faut **invalider le cache** :

- soit en bumpant `CACHE_VERSION` dans `sw.js`
- soit via la commande :

```bash
npm run sw:bump
```
- soit en désenregistrant le service worker (DevTools → Application → Service Workers) puis refresh

## Structure (repères)

- `index.html` : page principale + galerie + formulaire
- `*.html` : pages “traitement” / “spécialiste”
- `css/` : styles modulaires
- `js/script.js` : source ; **`js/script.min.js`** : livré en prod (généré par `npm run dev:refresh`)
- `assets/` : médias (noms web-safe) + variantes `*-{...}w.*`
