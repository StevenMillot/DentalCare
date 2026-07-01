# 🚀 Démarrage Rapide - Déploiement OVH

Guide express pour déployer Paro-Spé sur OVH en 5 minutes.

---

## ⚡ En 3 étapes

### 1️⃣ Configuration (1 fois seulement)

```bash
# Copier le template de configuration
cp .env.ovh.template .env.ovh

# Éditer avec vos identifiants OVH
nano .env.ovh
```

Remplissez :
```bash
FTP_HOST=ftp.clusterXXX.hosting.ovh.net  # Trouvable dans OVH Manager > Hébergement > FTP-SSH
FTP_USER=votre-login-ftp                  # Login FTP OVH
FTP_PASS=votre-mot-de-passe-ftp          # Mot de passe FTP
FTP_REMOTE_DIR=/www                       # Répertoire (généralement /www)
```

### 2️⃣ Installation des dépendances

```bash
npm install

# Installer lftp pour le déploiement FTP
# macOS:
brew install lftp

# Ubuntu/Debian:
sudo apt-get install lftp
```

### 3️⃣ Déploiement

```bash
# Rendre le script exécutable (première fois)
chmod +x deploy-ovh.sh

# Déployer !
./deploy-ovh.sh production
```

✅ **C'est tout !** Votre site est en ligne sur `https://paro-spe.fr`

---

## 📋 Checklist post-déploiement

Vérifiez rapidement :

- [ ] Site accessible : `https://paro-spe.fr`
- [ ] HTTPS fonctionne (cadenas vert)
- [ ] Redirections OK : `www` → `non-www`, `http` → `https`
- [ ] Formulaire de contact fonctionne
- [ ] Images s'affichent
- [ ] Service Worker enregistré (F12 > Application)
- [ ] Pas d'erreurs JavaScript (F12 > Console)

---

## 🔄 Déploiements suivants

Pour mettre à jour le site après modifications :

```bash
# Faire vos modifications...

# Déployer
./deploy-ovh.sh production
```

Le script s'occupe de tout :
- ✅ Build CSS/JS
- ✅ Optimisation images
- ✅ Mise à jour service worker
- ✅ Upload FTP
- ✅ Backup automatique

---

## 🆘 Problème ?

### Erreur de connexion FTP ?
→ Vérifiez vos identifiants dans `.env.ovh`

### Page blanche après déploiement ?
→ Vérifiez que `.htaccess` est bien uploadé

### CSS/JS ne se chargent pas ?
```bash
npm run dev:refresh
./deploy-ovh.sh production
```

### Service Worker ne se met pas à jour ?
```bash
npm run sw:bump
./deploy-ovh.sh production
```

---

## 📚 Documentation complète

Pour en savoir plus, consultez **[DEPLOYMENT.md](./DEPLOYMENT.md)** :

- Configuration DNS
- Certificat SSL
- Sécurité avancée
- Monitoring
- Dépannage complet
- Maintenance

---

## 🎯 Commandes essentielles

```bash
# Build + optimisation avant déploiement
npm run deploy:prepare

# Déployer sur OVH
./deploy-ovh.sh production

# Rafraîchir CSS/JS après modification
npm run dev:refresh

# Mettre à jour le cache Service Worker
npm run sw:bump

# Générer images responsive
npm run images:responsive

# Tester localement
python3 -m http.server 8000
```

---

## 🔐 Sécurité

Le déploiement inclut automatiquement :

✅ **HTTPS forcé** (redirections automatiques)  
✅ **Headers de sécurité** (CSP, HSTS, X-Frame-Options, etc.)  
✅ **Protection fichiers sensibles** (.git, .env, etc.)  
✅ **Compression GZIP** (CSS, JS, HTML)  
✅ **Cache optimisé** (assets 1 an, HTML no-cache)  
✅ **Monitoring erreurs** (JavaScript + PHP)  

Testez : [securityheaders.com](https://securityheaders.com/?q=https://paro-spe.fr)

---

**🎉 Félicitations ! Votre site est déployé et sécurisé sur OVH Cloud.**

Pour toute question, consultez [DEPLOYMENT.md](./DEPLOYMENT.md) ou le support OVH.
