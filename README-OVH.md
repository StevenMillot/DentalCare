# 🏥 Paro-Spé - Déploiement OVH Cloud

Configuration complète pour le déploiement et la maintenance du site Paro-Spé sur OVH Cloud.

---

## 📚 Documentation

Ce projet inclut une documentation complète pour le déploiement sur OVH :

### 🚀 Pour commencer rapidement

**[QUICKSTART-OVH.md](./QUICKSTART-OVH.md)** - Déploiement en 5 minutes
- Configuration rapide en 3 étapes
- Commandes essentielles
- Dépannage express

### 📖 Documentation complète

**[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide complet de déploiement
- Configuration initiale détaillée
- Déploiement automatique et manuel
- Configuration DNS et SSL
- Sécurité et optimisations
- Maintenance et dépannage
- Monitoring et logs

### ✅ Checklist de déploiement

**[CHECKLIST-DEPLOIEMENT.md](./CHECKLIST-DEPLOIEMENT.md)** - Liste de vérifications
- Avant le déploiement
- Pendant le déploiement
- Après le déploiement (70+ points de contrôle)
- Tests de sécurité et performance

---

## 🎯 Démarrage ultra-rapide

```bash
# 1. Configuration (une seule fois)
cp .env.ovh.template .env.ovh
nano .env.ovh  # Remplir avec identifiants OVH

# 2. Installation
npm install
brew install lftp  # ou apt-get install lftp

# 3. Déploiement
chmod +x deploy-ovh.sh
./deploy-ovh.sh production
```

✅ **Site en ligne sur https://paro-spe.fr**

---

## 📁 Fichiers de configuration OVH

### Fichiers créés pour OVH

| Fichier | Description |
|---------|-------------|
| `.htaccess` | Configuration Apache : HTTPS, sécurité, cache, compression |
| `deploy-ovh.sh` | Script de déploiement automatisé FTP/SFTP |
| `.env.ovh.template` | Template de configuration (à copier en `.env.ovh`) |
| `health-check.php` | Endpoint de monitoring du site |
| `error-handler.php` | Gestionnaire d'erreurs PHP |
| `monitoring.js` | Système de monitoring JavaScript |
| `500.html` | Page d'erreur serveur personnalisée |
| `robots.txt` | Optimisé pour OVH (bloque fichiers sensibles) |

### Documentation

| Fichier | Description |
|---------|-------------|
| `QUICKSTART-OVH.md` | Guide de démarrage rapide (5 min) |
| `DEPLOYMENT.md` | Documentation complète (80+ pages) |
| `CHECKLIST-DEPLOIEMENT.md` | Checklist de vérifications (70+ points) |
| `README-OVH.md` | Ce fichier (point d'entrée) |

---

## 🔐 Sécurité

Le déploiement OVH inclut automatiquement :

✅ **HTTPS forcé** avec redirections automatiques  
✅ **Headers de sécurité** (HSTS, CSP, X-Frame-Options, etc.)  
✅ **Protection des fichiers sensibles** (.env, .git, node_modules, etc.)  
✅ **Compression GZIP** de tous les assets  
✅ **Cache optimisé** (1 an pour assets, no-cache pour HTML)  
✅ **Monitoring des erreurs** JavaScript et PHP  
✅ **Health check** pour surveiller l'état du serveur  
✅ **Blocage des bots malveillants** via robots.txt  

Score visé : **A+** sur [securityheaders.com](https://securityheaders.com)

---

## ⚡ Performance

Optimisations incluses :

- **Compression GZIP** : -70% sur le poids des fichiers
- **Cache agressif** : 1 an sur CSS/JS/images
- **Service Worker** : Cache offline pour visites répétées
- **Images responsive** : Variantes adaptées à chaque écran
- **CSS/JS minifiés** : Taille réduite au minimum
- **Lazy loading** : Images chargées à la demande

Cibles de performance :
- PageSpeed Mobile : **> 90**
- PageSpeed Desktop : **> 95**
- Temps de chargement : **< 3s**

---

## 🛠️ Commandes principales

```bash
# Déploiement complet
./deploy-ovh.sh production

# Préparer le build (sans déployer)
npm run deploy:prepare

# Rafraîchir CSS/JS après modifications
npm run dev:refresh

# Mettre à jour le Service Worker
npm run sw:bump

# Générer images responsive
npm run images:responsive

# Test local
python3 -m http.server 8000
```

---

## 📊 Monitoring

### Health Check

Vérifiez l'état du serveur :

```bash
curl https://paro-spe.fr/health-check.php
```

Retourne :
- État des fichiers essentiels
- Espace disque disponible
- Configuration PHP
- Extensions chargées
- Métriques de performance

### Erreurs JavaScript

Dans la console du navigateur :

```javascript
// Voir les erreurs capturées
ParoSpeMonitoring.getStoredErrors()

// Logger un événement personnalisé
ParoSpeMonitoring.logEvent('test', { data: 'exemple' })

// Effacer les erreurs stockées
ParoSpeMonitoring.clearStoredErrors()
```

### Logs PHP

Si activés, les logs PHP sont dans : `/logs/php-errors.log`

---

## 🔄 Workflow de déploiement

### Déploiement standard

```bash
# 1. Faire vos modifications
nano index.html

# 2. Tester localement
npm run dev:refresh
python3 -m http.server 8000

# 3. Déployer
npm run deploy:prepare
./deploy-ovh.sh production

# 4. Vérifier
# Ouvrir https://paro-spe.fr
# Vérifier la checklist
```

### Déploiement avec mise à jour du Service Worker

```bash
npm run sw:bump
./deploy-ovh.sh production
```

### Rollback (en cas de problème)

```bash
# Restaurer le dernier backup
cd backups
ls -t *.tar.gz | head -n 1  # Voir le dernier

# Extraire et redéployer
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz -C /tmp/restore
cd /tmp/restore
./deploy-ovh.sh production
```

---

## 🐛 Dépannage rapide

### Le site ne s'affiche pas ?

1. Vérifier le certificat SSL (OVH Manager)
2. Vérifier que `.htaccess` est uploadé
3. Consulter les logs PHP (OVH Manager > Statistiques et logs)

### CSS/JS ne se chargent pas ?

```bash
npm run dev:refresh
./deploy-ovh.sh production
```

### Formulaire ne fonctionne pas ?

1. Vérifier la console JavaScript (F12)
2. Tester le fallback mailto
3. Vérifier les CORS dans `.htaccess`

### Service Worker obsolète ?

```bash
npm run sw:bump
./deploy-ovh.sh production
# Côté client : F12 > Application > Service Workers > Unregister
```

Plus de solutions dans **[DEPLOYMENT.md](./DEPLOYMENT.md)** section Dépannage.

---

## 📞 Support

### Documentation

1. **[QUICKSTART-OVH.md](./QUICKSTART-OVH.md)** - Démarrage rapide
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Documentation complète
3. **[CHECKLIST-DEPLOIEMENT.md](./CHECKLIST-DEPLOIEMENT.md)** - Vérifications

### OVH

- **Espace client** : [ovh.com/manager](https://www.ovh.com/manager/)
- **Documentation** : [docs.ovh.com](https://docs.ovh.com/fr/)
- **Support** : Voir espace client OVH

---

## 🎉 C'est prêt !

Votre site Paro-Spé est maintenant configuré pour un déploiement optimal sur OVH Cloud avec :

✅ Sécurité maximale  
✅ Performance optimisée  
✅ Déploiement automatisé  
✅ Monitoring intégré  
✅ Documentation complète  

**Prochaines étapes :**

1. Lire **[QUICKSTART-OVH.md](./QUICKSTART-OVH.md)**
2. Configurer `.env.ovh`
3. Déployer avec `./deploy-ovh.sh production`
4. Vérifier avec **[CHECKLIST-DEPLOIEMENT.md](./CHECKLIST-DEPLOIEMENT.md)**

---

**Bon déploiement ! 🚀**
