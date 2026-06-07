# DentalCare (Parodontia)

Site vitrine statique — HTML, CSS, JS — optimisé pour **GitHub Pages** et domaine custom.

---

## Démarrage rapide

```bash
npm install
python3 -m http.server 8000
```

Ouvrir [http://127.0.0.1:8000/](http://127.0.0.1:8000/) — éviter `file://` (sprite SVG, service worker, fetch).

---

## Les 2 commandes à retenir

| Commande | Quand |
|----------|-------|
| **`npm run dev:refresh`** | Après modif CSS, JS ou sprite `icons.svg` |
| **`npm run deploy:prepare`** | Juste avant `git push` (déploiement) |

C’est tout pour le travail courant.

### Ce que chaque « super-commande » fait déjà

**`dev:refresh`** enchaîne automatiquement :
`css:bundle` → `css:minify` → `icons:sync-inline` → `js:bundle` → `js:minify`

**`deploy:prepare`** enchaîne automatiquement :
`dev:refresh` → `images:responsive` → `images:cleanup` → `images:check` → `sw:bump`

Tu n’as donc **pas** à lancer à la main : `css:*`, `js:*`, `icons:sync-inline`, `images:*`, `sw:bump` — sauf cas particulier ci-dessous.

### Commandes à lancer seules (rare)

| Commande | Cas précis |
|----------|------------|
| `npm run pwa:head` | Tu crées une **nouvelle** page `.html` à la racine |
| `npm run pwa:icons` | Tu changes le **logo** (`assets/logo-b-raphael-brochand.svg`) |
| `npm run images:responsive` | Tu veux générer les variantes photo **sans** tout le pipeline deploy (ex. test local après ajout d’images) |

---

## Workflows courants

### Modifier le site (CSS / JS)

1. Éditer les **sources** :
   - CSS → fichiers dans `css/` (pas `bundle.css` directement)
   - JS global → `js/script.js`
   - Carrousel → `js/src/carousel/`
2. Lancer :

```bash
npm run dev:refresh
```

3. Le HTML charge `css/bundle.css`, `js/script.min.js`, `js/cabinet-media-carousel.min.js`.

### Déployer

```bash
npm run deploy:prepare
git add -A && git commit -m "…" && git push
```

`deploy:prepare` enchaîne : build CSS/JS → images responsive → vérification → bump cache SW.

### Ajouter une photo (équipe ou galerie)

1. Déposer l’**original** (sans suffixe `-360w`, etc.) :
   - Équipe → `assets/team/nom.jpg`
   - Galerie → `assets/cabinet-gallery/nom.avif`
2. Référencer le `srcset` dans le HTML.
3. Au déploiement, `deploy:prepare` génère et vérifie les variantes tout seul.

Pour tester en local avant le push : `npm run images:responsive` (optionnel).

| Dossier | Format | Largeurs générées |
|---------|--------|-------------------|
| `assets/team/` | JPG | 360, 540, 720, 1080 |
| `assets/cabinet-gallery/` | AVIF | 240, 480, 640, 960, 1600 |

Le générateur est **idempotent** : il ne recrée pas une variante déjà présente.

Config partagée : `tools/responsive-images-config.mjs`.

### Modifier une icône UI (sprite)

Le site utilise `assets/Icones/icons.svg` via `<use href="…#i-nom">`.

Éditer le sprite, puis `npm run dev:refresh` — la synchro inline est incluse.

### Nouvelle page HTML

```bash
npm run pwa:head
```

Ajoute manifest, apple-touch-icon et meta PWA si manquants.

---

## Structure du projet

```
index.html              Page principale
*.html                  Pages traitement / spécialiste / légales
css/                    Sources CSS modulaires
css/bundle.css          CSS livré (généré)
js/script.js            JS principal (source)
js/script.min.js        JS livré (généré)
js/src/carousel/        Carrousel cabinet (source)
js/cabinet-media-carousel.min.js
assets/Icones/
  icons.svg             Sprite UI (cœur, téléphone, flèches…)
  technologies/         Icônes raster section Technologies
  traitements/          Icônes raster section Traitements
assets/team/            Portraits + variantes *-{360,540,720,1080}w.jpg
assets/cabinet-gallery/ Photos + variantes *-{240…1600}w.avif
sw.js                   Service worker
site.webmanifest        Manifest PWA
scripts/                Scripts Node (maintenance / build)
tools/                  Génération images responsive
```

---

## Scripts (`scripts/` et `tools/`) — référence

Détail pour comprendre ce qui tourne sous le capot. En usage normal : seulement `dev:refresh` et `deploy:prepare`.

| npm | Inclus dans | Rôle |
|-----|-------------|------|
| `dev:refresh` | — | **Commande principale dev** |
| `deploy:prepare` | — | **Commande principale deploy** |
| `css:bundle` / `css:minify` | `dev:refresh` | Assemble et minifie le CSS |
| `js:bundle` / `js:minify` | `dev:refresh` | Assemble et minifie le JS |
| `icons:sync-inline` | `dev:refresh` | Sprite → fallback dans `script.js` |
| `images:responsive` | `deploy:prepare` | Variantes `srcset` manquantes |
| `images:cleanup` | `deploy:prepare` | Supprime doublons corrompus |
| `images:check` | `deploy:prepare` | Vérifie les variantes |
| `sw:bump` | `deploy:prepare` | Incrémente le cache SW |
| `pwa:head` | *(manuel, rare)* | Balises PWA sur nouvelle page HTML |
| `pwa:icons` | *(manuel, rare)* | Régénère les PNG PWA depuis le logo |

---

## JavaScript runtime

| Fichier | Rôle |
|---------|------|
| `js/script.js` | Nav, formulaire, toasts, sprite, carte, SW, vidéo hero |
| `js/src/carousel/` | Carrousel + lightbox cabinet |
| `sw.js` | Cache : HTML network-first, assets cache-first |

**Ne pas éditer** `*.min.js` ni `cabinet-media-carousel.js` — fichiers générés.

---

## PWA / cache

- **Manifest** : injecté après `load` sur `index.html` ; `<link rel="manifest">` classique sur les autres pages.
- **Service worker** : après déploiement, les visiteurs peuvent garder d’anciens assets en cache.

Si un changement ne apparaît pas :

```bash
npm run sw:bump
```

Ou DevTools → Application → Service Workers → Unregister.

> Sur `github.io`, le `Cache-Control` HTTP (~10 min) est imposé par GitHub. Le SW compense pour les visites répétées.

---

## Formulaire de contact

- Validation JS dédiée (messages inline + toasts).
- Envoi : FormSubmit par défaut, Web3Forms si `data-web3forms-access-key` est renseigné.
- Fallback `mailto:` si l’envoi réseau échoue.

---

## GitHub Pages

`site.webmanifest` utilise `start_url: "./"` et `scope: "./"` pour fonctionner en sous-dossier (`/DentalCare/`).
