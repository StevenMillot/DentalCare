# 🚀 Guide de Déploiement OVH Cloud - Paro-Spé

Guide complet pour déployer et maintenir le site Paro-Spé sur OVH Cloud (forfait perso).

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration initiale](#configuration-initiale)
3. [Déploiement automatique](#déploiement-automatique)
4. [Déploiement manuel](#déploiement-manuel)
5. [Configuration DNS](#configuration-dns)
6. [Certificat SSL](#certificat-ssl)
7. [Vérifications post-déploiement](#vérifications-post-déploiement)
8. [Maintenance](#maintenance)
9. [Dépannage](#dépannage)
10. [Sécurité](#sécurité)

---

## Prérequis

### Localement

- **Node.js** (version 14+) et **npm**
- **Git**
- **lftp** (pour le déploiement FTP automatisé)
  - macOS: `brew install lftp`
  - Ubuntu/Debian: `sudo apt-get install lftp`
  - Windows: Utiliser WSL ou FileZilla

### Chez OVH

- Un **hébergement web OVH Cloud** (forfait perso ou supérieur)
- Un **nom de domaine** configuré (paro-spe.fr)
- Accès à l'**espace client OVH**

---

## Configuration initiale

### 1. Récupérer vos identifiants FTP OVH

1. Connectez-vous à l'[espace client OVH](https://www.ovh.com/manager/)
2. Allez dans **Hébergements** > Sélectionnez votre hébergement
3. Onglet **FTP-SSH**
4. Notez :
   - **Serveur FTP** (ex: `ftp.cluster042.hosting.ovh.net`)
   - **Login FTP** (ex: `parospe`)
   - Cliquez sur **"Modifier le mot de passe"** si nécessaire

### 2. Configurer les variables d'environnement

```bash
# Copier le template de configuration
cp .env.ovh.template .env.ovh

# Éditer avec vos identifiants
nano .env.ovh
```

Remplissez les valeurs suivantes dans `.env.ovh` :

```bash
FTP_HOST=ftp.clusterXXX.hosting.ovh.net  # Votre serveur FTP OVH
FTP_USER=votre-login-ftp                  # Votre login FTP
FTP_PASS=votre-mot-de-passe-ftp          # Votre mot de passe FTP
FTP_PORT=21                               # Port FTP (21 par défaut)
FTP_REMOTE_DIR=/www                       # Répertoire distant (/www sur OVH)
```

⚠️ **Important** : Le fichier `.env.ovh` est déjà dans `.gitignore` et ne sera **jamais** commité.

### 3. Installer les dépendances

```bash
npm install
```

---

## Déploiement automatique

### Utilisation du script de déploiement

Le script `deploy-ovh.sh` automatise tout le processus :

```bash
# Rendre le script exécutable (première fois seulement)
chmod +x deploy-ovh.sh

# Déployer en production
./deploy-ovh.sh production
```

### Ce que fait le script

1. ✅ Vérifie les prérequis (npm, lftp)
2. ✅ Charge la configuration depuis `.env.ovh`
3. ✅ Installe les dépendances npm
4. ✅ Exécute `npm run deploy:prepare` (build CSS/JS, images, SW)
5. ✅ Crée un backup local (optionnel)
6. ✅ Upload tous les fichiers via FTP/SFTP
7. ✅ Affiche un rapport de déploiement

### Options de configuration

Dans `.env.ovh`, vous pouvez ajuster :

```bash
# Créer un backup avant chaque déploiement
CREATE_BACKUP=true

# Utiliser SFTP (plus sécurisé) au lieu de FTP
USE_SFTP=false

# Port SFTP (si USE_SFTP=true)
SFTP_PORT=22
```

---

## Déploiement manuel

Si vous préférez un déploiement manuel via FileZilla :

### 1. Préparer le build

```bash
npm install
npm run deploy:prepare
```

### 2. Se connecter via FileZilla

- **Hôte** : Votre `FTP_HOST` (ex: `ftp.cluster042.hosting.ovh.net`)
- **Identifiant** : Votre `FTP_USER`
- **Mot de passe** : Votre `FTP_PASS`
- **Port** : `21` (FTP) ou `22` (SFTP)

### 3. Uploader les fichiers

Transférez **tout le contenu** du projet vers `/www` sur le serveur **SAUF** :

❌ Ne **PAS** uploader :
- `node_modules/`
- `scripts/`
- `tools/`
- `backups/`
- `.git/` et `.github/`
- `package.json`, `package-lock.json`
- `README.md`, `DEPLOYMENT.md`
- `.env.ovh`
- `deploy-ovh.sh`

✅ **Assurez-vous d'uploader** :
- `.htaccess` (crucial pour la sécurité et redirections)
- Tous les fichiers HTML
- Les dossiers `css/`, `js/`, `assets/`
- `robots.txt`, `sitemap.xml`
- `sw.js` (service worker)
- `site.webmanifest`
- Tous les favicons et PWA icons

---

## Configuration DNS

### Pointer votre domaine vers OVH

1. Dans l'**espace client OVH** > **Domaines** > Votre domaine
2. Onglet **Zone DNS**
3. Vérifiez/ajoutez les enregistrements suivants :

```
Type    Sous-domaine    Cible
A       @               XXX.XXX.XXX.XXX (IP de votre hébergement OVH)
CNAME   www             votre-domaine.tld.
```

4. **Propagation DNS** : Peut prendre 4-24h

### Vérifier la propagation

```bash
# Vérifier l'enregistrement A
dig paro-spe.fr A

# Vérifier l'enregistrement CNAME
dig www.paro-spe.fr CNAME
```

Ou utilisez : [https://dnschecker.org](https://dnschecker.org)

---

## Certificat SSL

### Activation du SSL Let's Encrypt sur OVH

1. **Espace client OVH** > **Hébergements** > Votre hébergement
2. Onglet **Informations générales**
3. Section **Certificat SSL** > Cliquez sur **Commander un certificat SSL**
4. Choisissez **Let's Encrypt** (gratuit)
5. Suivez les étapes

Le certificat sera actif sous **quelques minutes à quelques heures**.

### Vérifier le SSL

```bash
# Vérifier le certificat
openssl s_client -connect paro-spe.fr:443 -servername paro-spe.fr

# Ou simplement dans le navigateur
https://paro-spe.fr
```

Le fichier `.htaccess` force automatiquement HTTPS (voir section Sécurité).

---

## Vérifications post-déploiement

### Checklist complète

Après chaque déploiement, vérifiez :

#### 1. Accès au site

- [ ] `https://paro-spe.fr` accessible
- [ ] `https://www.paro-spe.fr` redirige vers `https://paro-spe.fr`
- [ ] `http://paro-spe.fr` redirige vers `https://paro-spe.fr`
- [ ] `http://www.paro-spe.fr` redirige vers `https://paro-spe.fr`

#### 2. Pages principales

- [ ] Page d'accueil
- [ ] Pages spécialistes
- [ ] Pages traitements
- [ ] Mentions légales
- [ ] Page 404 personnalisée

#### 3. Ressources

- [ ] CSS chargé correctement
- [ ] JavaScript fonctionne
- [ ] Images s'affichent
- [ ] Carrousel photos cabinet
- [ ] Vidéo hero

#### 4. Fonctionnalités

- [ ] Formulaire de contact fonctionne
- [ ] Navigation mobile (menu hamburger)
- [ ] Service Worker enregistré
- [ ] PWA installable

#### 5. SEO & Performance

```bash
# Vérifier le sitemap
curl https://paro-spe.fr/sitemap.xml

# Vérifier le robots.txt
curl https://paro-spe.fr/robots.txt

# Vérifier les headers de sécurité
curl -I https://paro-spe.fr
```

- [ ] Sitemap accessible
- [ ] robots.txt accessible
- [ ] Headers de sécurité présents (voir section suivante)

#### 6. Sécurité

Testez sur [Security Headers](https://securityheaders.com) :

- [ ] Strict-Transport-Security
- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] X-XSS-Protection
- [ ] Referrer-Policy
- [ ] Permissions-Policy

#### 7. Performance

Testez sur :
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

Cibles :
- [ ] Score Performance > 90
- [ ] Score Accessibilité > 90
- [ ] Score SEO > 90
- [ ] Temps de chargement < 3s

#### 8. Monitoring

- [ ] Health check : `https://paro-spe.fr/health-check.php`
- [ ] Aucune erreur JavaScript dans la console
- [ ] Vérifier les logs d'erreurs (si activés)

---

## Maintenance

### Mises à jour du contenu

Pour modifier le contenu du site :

```bash
# 1. Faire vos modifications localement

# 2. Tester en local
python3 -m http.server 8000

# 3. Préparer le déploiement
npm run deploy:prepare

# 4. Vérifier les changements
git status
git diff

# 5. Déployer
./deploy-ovh.sh production
```

### Mises à jour du CSS/JS

```bash
# Après modification des sources CSS ou JS
npm run dev:refresh

# Tester localement
python3 -m http.server 8000

# Déployer
npm run deploy:prepare
./deploy-ovh.sh production
```

### Ajout de photos

```bash
# 1. Ajouter les photos dans le bon dossier
#    - Équipe : assets/team/nom.jpg
#    - Galerie : assets/cabinet-gallery/nom.avif

# 2. Mettre à jour le HTML avec les srcset

# 3. Générer les variantes responsive
npm run images:responsive

# 4. Déployer
npm run deploy:prepare
./deploy-ovh.sh production
```

### Rotation des backups

Les backups locaux sont créés dans `/backups/` avec horodatage.

Nettoyage manuel recommandé :

```bash
# Garder seulement les 10 derniers backups
ls -t backups/*.tar.gz | tail -n +11 | xargs rm --
```

### Mise à jour du Service Worker

Si le contenu ne se met pas à jour après déploiement :

```bash
# Incrémenter la version du cache SW
npm run sw:bump

# Redéployer
./deploy-ovh.sh production
```

---

## Dépannage

### Problème : Erreur de connexion FTP

**Symptômes** : Le script ne peut pas se connecter au serveur FTP.

**Solutions** :

1. Vérifiez vos identifiants dans `.env.ovh`
2. Testez la connexion manuellement :
   ```bash
   lftp -u $FTP_USER,$FTP_PASS $FTP_HOST
   ```
3. Vérifiez le firewall local
4. Essayez avec SFTP : `USE_SFTP=true` dans `.env.ovh`

### Problème : Page blanche après déploiement

**Causes possibles** :

1. **Fichier .htaccess manquant** → Vérifiez qu'il est bien uploadé
2. **Erreur PHP** → Vérifiez les logs PHP (voir OVH Manager)
3. **Chemins incorrects** → Vérifiez les chemins dans le HTML

**Solution** :

```bash
# Vérifier les fichiers uploadés
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST -e "ls /www; quit"

# Vérifier le .htaccess
lftp -u $FTP_USER,$FTP_PASS $FTP_HOST -e "cat /www/.htaccess; quit"
```

### Problème : CSS/JS ne se chargent pas

**Symptômes** : Le site s'affiche sans styles ou sans interactions.

**Solutions** :

1. Vérifiez la console JavaScript (F12)
2. Vérifiez que les fichiers existent :
   - `css/bundle.css`
   - `js/script.min.js`
   - `js/cabinet-media-carousel.min.js`
3. Régénérez le build :
   ```bash
   npm run dev:refresh
   npm run deploy:prepare
   ./deploy-ovh.sh production
   ```
4. Videz le cache du navigateur (Ctrl+F5)

### Problème : Redirections HTTPS ne fonctionnent pas

**Symptômes** : Le site est accessible en HTTP.

**Solutions** :

1. Vérifiez que le certificat SSL est actif (OVH Manager)
2. Vérifiez que le `.htaccess` est bien uploadé
3. Vérifiez le contenu du `.htaccess` :
   ```bash
   # Doit contenir :
   RewriteCond %{HTTPS} !=on
   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```
4. Attendez quelques minutes (propagation)

### Problème : Formulaire de contact ne fonctionne pas

**Symptômes** : Erreur lors de l'envoi du formulaire.

**Solutions** :

1. Vérifiez la configuration FormSubmit ou Web3Forms
2. Vérifiez la console JavaScript (F12)
3. Testez le fallback `mailto:`
4. Vérifiez les headers CORS dans `.htaccess`

### Problème : Service Worker ne se met pas à jour

**Symptômes** : Anciennes versions du site en cache.

**Solutions** :

```bash
# 1. Incrémenter la version du SW
npm run sw:bump

# 2. Redéployer
./deploy-ovh.sh production

# 3. Côté client :
# - Ouvrir DevTools > Application > Service Workers
# - Cliquer sur "Unregister"
# - Recharger la page (F5)
```

### Problème : Images ne s'affichent pas

**Symptômes** : Images cassées ou 404.

**Solutions** :

1. Vérifiez que les images sont uploadées dans `assets/`
2. Vérifiez les chemins dans le HTML (relatifs, pas absolus)
3. Régénérez les variantes responsive :
   ```bash
   npm run images:responsive
   npm run deploy:prepare
   ./deploy-ovh.sh production
   ```
4. Vérifiez les permissions sur le serveur

---

## Sécurité

### Headers de sécurité configurés

Le fichier `.htaccess` configure automatiquement :

| Header | Valeur | Protection |
|--------|--------|------------|
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS pendant 1 an |
| `X-Frame-Options` | `SAMEORIGIN` | Protège contre clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Protège contre XSS |
| `X-Content-Type-Options` | `nosniff` | Empêche MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Protège vie privée |
| `Content-Security-Policy` | Configurée | Limite les sources de contenu |
| `Permissions-Policy` | Configurée | Limite les API navigateur |

### Fichiers protégés

Le `.htaccess` bloque l'accès à :

- Fichiers cachés (`.git`, `.env`, etc.)
- Dossiers sensibles (`scripts/`, `tools/`, `node_modules/`, `backups/`)
- Fichiers de configuration (`package.json`, `.gitignore`, etc.)
- Fichiers de backup (`*.bak`, `*.sql`, etc.)

### Monitoring des erreurs

Le système de monitoring capture automatiquement :

- **Erreurs JavaScript** → Stockées localement + envoyées au serveur (si configuré)
- **Erreurs PHP** → Loggées dans `/logs/php-errors.log`
- **Erreurs de chargement** → Ressources 404 ou timeout

Consultez les erreurs JavaScript :

```javascript
// Dans la console du navigateur
ParoSpeMonitoring.getStoredErrors()
```

### Health Check

Vérifiez la santé du site :

```bash
# Public (si HEALTH_CHECK_SECRET non défini)
curl https://paro-spe.fr/health-check.php

# Privé (si HEALTH_CHECK_SECRET défini)
curl "https://paro-spe.fr/health-check.php?key=VOTRE_CLE"
```

Retourne :
- État du serveur
- Fichiers essentiels présents
- Espace disque
- Configuration PHP
- Métriques de performance

### Bonnes pratiques

1. ✅ **Ne jamais commiter** `.env.ovh`
2. ✅ **Changer régulièrement** les mots de passe FTP
3. ✅ **Surveiller** les logs d'erreurs
4. ✅ **Tester** le health check régulièrement
5. ✅ **Faire des backups** avant chaque déploiement
6. ✅ **Utiliser SFTP** si disponible (plus sécurisé que FTP)
7. ✅ **Tester en local** avant de déployer
8. ✅ **Vérifier** les headers de sécurité après chaque déploiement

---

## Ressources utiles

### OVH

- [Espace client OVH](https://www.ovh.com/manager/)
- [Documentation OVH - Hébergement web](https://docs.ovh.com/fr/hosting/)
- [FAQ OVH](https://www.ovh.com/fr/support/)

### Outils de test

- [Security Headers](https://securityheaders.com) - Test des headers de sécurité
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test du certificat SSL
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance
- [GTmetrix](https://gtmetrix.com/) - Performance détaillée
- [DNS Checker](https://dnschecker.org) - Propagation DNS

### Monitoring et analyse

- [Google Search Console](https://search.google.com/search-console) - SEO
- [Google Analytics](https://analytics.google.com/) - Statistiques
- [Uptime Robot](https://uptimerobot.com/) - Monitoring uptime (gratuit)

---

## Support

### Problèmes techniques

Pour toute question ou problème technique :

1. Consultez d'abord cette documentation
2. Vérifiez les logs d'erreurs
3. Testez le health check
4. Contactez le support OVH si nécessaire

### Contact OVH

- **Support OVH** : [support.ovh.com](https://support.ovh.com)
- **Téléphone** : Voir espace client OVH
- **Urgence** : Tickets prioritaires disponibles selon votre offre

---

## Historique des déploiements

Conservez un historique des déploiements :

```bash
# Créer un fichier de log manuel
echo "$(date '+%Y-%m-%d %H:%M:%S') - Déploiement v1.0.0 - Ajout formulaire contact" >> deployments.log
```

Ou utilisez Git :

```bash
git log --oneline --graph --all
```

---

**✨ Votre site Paro-Spé est maintenant prêt pour OVH Cloud !**

Dernier conseil : **Testez toujours en local avant de déployer en production** ! 🚀
