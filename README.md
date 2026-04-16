# DentalCare (Parodontia) — site statique

Site vitrine statique (HTML/CSS/JS) avec pages “traitement”, formulaire de contact, et optimisations perf/SEO adaptées à un déploiement **GitHub Pages** et/ou domaine.

## Lancer en local

Évite `file://` (certaines APIs et chemins se comportent différemment). Utilise un serveur statique :

```bash
python3 -m http.server 8000
```

Puis ouvre `http://127.0.0.1:8000/`.

## Déploiement GitHub Pages (important)

- **Noms de fichiers “web-safe”** : les assets sont volontairement renommés **sans accents** et **sans espaces**.
  - Pourquoi : sur GitHub Pages, un fichier `équipe.avif` / `Présentation.mp4` peut 404 selon la normalisation Unicode (NFD/NFC), même si ça marche en local sur macOS.
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

## Formulaire de contact

- **Validation JS dédiée** (messages inline + toast) : pas de dépendance aux comportements `checkValidity()` du navigateur.
- **Envoi** : FormSubmit (ou Web3Forms si configuré), avec fallback `mailto:` en cas d’échec.

## Structure (repères)

- `index.html` : page principale + galerie + formulaire
- `*.html` : pages “traitement” / “spécialiste”
- `css/` : styles modulaires
- `js/script.js` : navigation, galerie, formulaire, toasts, optimisations
- `assets/` : médias (noms web-safe) + variantes `*-{...}w.*`
