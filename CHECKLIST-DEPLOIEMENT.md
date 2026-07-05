# ✅ Checklist de Déploiement OVH - Paro-Spé

Utilisez cette checklist avant et après chaque déploiement pour vous assurer que rien n'est oublié.

---

## 📦 AVANT LE DÉPLOIEMENT

### Configuration initiale (première fois uniquement)

- [ ] Fichier `.env.ovh` créé et rempli avec identifiants OVH
- [ ] Dépendances npm installées (`npm install`)
- [ ] Outil `lftp` installé sur la machine locale
- [ ] Script `deploy-ovh.sh` rendu exécutable (`chmod +x`)
- [ ] DNS configuré (enregistrements A et CNAME)
- [ ] Certificat SSL activé sur OVH

### Préparation du code

- [ ] Toutes les modifications testées en local
- [ ] Aucune erreur dans la console JavaScript (F12)
- [ ] Aucune erreur dans la console du navigateur
- [ ] Formulaire de contact testé
- [ ] Navigation mobile testée
- [ ] Images responsive générées si nouvelles photos
- [ ] Service Worker version incrémentée si nécessaire (`npm run sw:bump`)

### Build

- [ ] `npm run deploy:prepare` exécuté sans erreur
- [ ] Fichier `css/bundle.css` généré et minifié
- [ ] Fichiers JS minifiés (`js/script.min.js`, `js/cabinet-media-carousel.min.js`)
- [ ] Images responsive créées dans `assets/`
- [ ] Service Worker à jour (`sw.js`)

---

## 🚀 DÉPLOIEMENT

### Upload

- [ ] Script de déploiement lancé : `./deploy-ovh.sh production`
- [ ] Connexion FTP réussie
- [ ] Tous les fichiers uploadés sans erreur
- [ ] Fichier `.htaccess` bien présent sur le serveur
- [ ] Aucun message d'erreur dans la sortie du script

### Vérification serveur

- [ ] Fichiers présents sur le serveur FTP (vérifier via FileZilla ou lftp)
- [ ] `.htaccess` présent à la racine (`/www/.htaccess`)
- [ ] Dossiers `css/`, `js/`, `assets/` présents
- [ ] Fichiers HTML présents à la racine

---

## ✅ APRÈS LE DÉPLOIEMENT

### Accès & Redirections

- [ ] Site accessible via `https://paro-spe.fr` ✅
- [ ] Cadenas vert HTTPS visible dans le navigateur
- [ ] `http://paro-spe.fr` → `https://paro-spe.fr` (redirection 301)
- [ ] `https://www.paro-spe.fr` → `https://paro-spe.fr` (redirection 301)
- [ ] `http://www.paro-spe.fr` → `https://paro-spe.fr` (redirection 301)

### Pages principales

- [ ] **Page d'accueil** (`/`) s'affiche correctement
- [ ] **Dr Raphaël Brochand** (`/specialiste-raphael-brochand.html`)
- [ ] **Dr Cécile Guélaud** (`/specialiste-cecile-guelaud.html`)
- [ ] **Mentions légales** (`/mentions-legales.html`)
- [ ] **Politique de confidentialité** (`/politique-de-confidentialite.html`)
- [ ] **Page 404** (`/404.html`) s'affiche pour les URLs inexistantes

### Pages traitements

- [ ] Extraction dents de sagesse
- [ ] Dégagement dents incluses
- [ ] Résection frein
- [ ] Traitement maladies parodontales
- [ ] Greffe gingivale
- [ ] Maintenance parodontale
- [ ] Pose implants dentaires
- [ ] Reconstruction osseuse/gingivale
- [ ] Maintenance implantaire

### Ressources & Assets

- [ ] **CSS** chargé correctement (styles appliqués)
- [ ] **JavaScript** fonctionne (navigation, formulaire, carrousel)
- [ ] **Images** s'affichent (portraits, galerie, icônes)
- [ ] **Vidéo hero** se charge et lit automatiquement
- [ ] **Logo** s'affiche dans la navigation
- [ ] **Favicons** présents (vérifier onglet navigateur)
- [ ] **Fonts Google** chargées correctement

### Fonctionnalités

- [ ] **Navigation desktop** fonctionne (liens, hover)
- [ ] **Navigation mobile** fonctionne (menu hamburger)
- [ ] **Formulaire de contact** :
  - [ ] Validation des champs
  - [ ] Messages d'erreur s'affichent
  - [ ] Envoi réussi (tester)
  - [ ] Message de confirmation affiché
  - [ ] Email reçu (vérifier boîte mail)
- [ ] **Carrousel photos cabinet** :
  - [ ] Navigation précédent/suivant
  - [ ] Indicateurs de pagination
  - [ ] Lightbox fonctionnelle
  - [ ] Fermeture lightbox (croix, Échap, clic extérieur)
- [ ] **Boutons CTA** :
  - [ ] "Prendre rendez-vous" fonctionne
  - [ ] Liens téléphone cliquables
  - [ ] Liens email cliquables
- [ ] **Service Worker** :
  - [ ] Enregistré (F12 > Application > Service Workers)
  - [ ] Mise en cache active
  - [ ] Aucune erreur dans la console

### SEO & Meta

- [ ] **Sitemap.xml** accessible : `https://paro-spe.fr/sitemap.xml`
- [ ] **Robots.txt** accessible : `https://paro-spe.fr/robots.txt`
- [ ] **Balises meta** présentes (title, description)
- [ ] **Open Graph** configuré (partage réseaux sociaux)
- [ ] **Schema.org** (LocalBusiness) présent
- [ ] **Canonical URLs** corrects

### Sécurité

Testez sur [securityheaders.com](https://securityheaders.com/?q=https://paro-spe.fr)

- [ ] **Strict-Transport-Security** (HSTS)
- [ ] **Content-Security-Policy** (CSP)
- [ ] **X-Frame-Options** (SAMEORIGIN)
- [ ] **X-Content-Type-Options** (nosniff)
- [ ] **X-XSS-Protection**
- [ ] **Referrer-Policy**
- [ ] **Permissions-Policy**

Score visé : **A** ou **A+**

### Performance

Testez sur [PageSpeed Insights](https://pagespeed.web.dev/?url=https://paro-spe.fr)

**Mobile** :
- [ ] Performance > 90
- [ ] Accessibilité > 90
- [ ] Bonnes pratiques > 90
- [ ] SEO > 90

**Desktop** :
- [ ] Performance > 95
- [ ] Accessibilité > 90
- [ ] Bonnes pratiques > 90
- [ ] SEO > 90

**Métriques Core Web Vitals** :
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Compression & Cache

Vérifiez les headers avec `curl -I https://paro-spe.fr` :

- [ ] **Content-Encoding: gzip** (compression activée)
- [ ] **Cache-Control** présent sur les assets
- [ ] HTML : `no-cache, no-store, must-revalidate`
- [ ] CSS/JS : `public, max-age=31536000`
- [ ] Images : `public, max-age=31536000`

### Monitoring & Logs

- [ ] **Health check** accessible : `https://paro-spe.fr/health-check.php`
- [ ] Retourne `"status": "ok"`
- [ ] Aucune erreur JavaScript (F12 > Console)
- [ ] Monitoring activé (vérifier `ParoSpeMonitoring` défini)
- [ ] Pas d'erreurs stockées : `ParoSpeMonitoring.getStoredErrors()` → `[]`

### Tests multi-navigateurs

- [ ] **Chrome** (desktop + mobile)
- [ ] **Firefox**
- [ ] **Safari** (si macOS/iOS disponible)
- [ ] **Edge**

### Tests appareils

- [ ] **Desktop** 1920x1080
- [ ] **Tablette** 768px
- [ ] **Mobile** 375px (iPhone SE)
- [ ] **Mobile** 430px (iPhone 14 Pro Max)

### Accessibilité

- [ ] Navigation au clavier (Tab, Entrée, Échap)
- [ ] Contrastes suffisants (WCAG AA minimum)
- [ ] Attributs `alt` sur les images
- [ ] Labels sur les champs de formulaire
- [ ] Focus visible sur les éléments interactifs

---

## 🔍 VÉRIFICATIONS AVANCÉES

### SSL & TLS

Testez sur [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=paro-spe.fr)

- [ ] Note globale : **A** ou **A+**
- [ ] TLS 1.2+ uniquement
- [ ] Certificat valide
- [ ] Chaîne de certificats complète

### DNS

Vérifiez sur [DNSChecker](https://dnschecker.org/#A/paro-spe.fr)

- [ ] Enregistrement A propagé mondialement
- [ ] Enregistrement CNAME propagé
- [ ] Temps de propagation < 24h

### Uptime Monitoring (optionnel)

Configurez un monitoring externe :

- [ ] [UptimeRobot](https://uptimerobot.com/) configuré
- [ ] Alertes email en cas de downtime
- [ ] Vérification toutes les 5 minutes

---

## 📊 MÉTRIQUES À SURVEILLER

### Quotidiennes

- [ ] Site accessible (vérification manuelle)
- [ ] Formulaires fonctionnels
- [ ] Aucune alerte UptimeRobot

### Hebdomadaires

- [ ] Vérifier les logs d'erreurs
- [ ] Health check : espace disque OK
- [ ] Vérifier les erreurs JavaScript stockées
- [ ] Analyser Google Analytics (si configuré)

### Mensuelles

- [ ] Performance PageSpeed (maintenir > 90)
- [ ] Sécurité SecurityHeaders (maintenir A/A+)
- [ ] SSL Labs (maintenir A/A+)
- [ ] Vérifier les backups locaux
- [ ] Nettoyer les anciens backups (> 10)

---

## 🐛 EN CAS DE PROBLÈME

### Rollback rapide

Si le site ne fonctionne plus après déploiement :

```bash
# Restaurer le dernier backup
cd backups
ls -t *.tar.gz | head -n 1  # Voir le dernier backup

# Extraire et redéployer
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz -C /tmp/restore
cd /tmp/restore
./deploy-ovh.sh production
```

### Contact d'urgence

- **Support OVH** : [support.ovh.com](https://support.ovh.com)
- **Téléphone OVH** : Voir espace client
- **Hébergeur** : OVH Cloud
- **Serveur FTP** : `ftp.clusterXXX.hosting.ovh.net`

---

## 📝 NOTES

**Dernier déploiement :**
- Date : ____________________
- Version : __________________
- Déployé par : ______________
- Durée : ____________________
- Incidents : ________________

**Prochaines actions :**
- [ ] _______________________
- [ ] _______________________
- [ ] _______________________

---

✅ **Déploiement validé le :** _________________ par : _________________

---

*Cette checklist est un guide complet. Adaptez-la selon vos besoins et votre contexte.*
