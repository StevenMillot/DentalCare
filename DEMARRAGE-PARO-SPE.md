# 🚀 Guide de Démarrage - Paro-Spé.fr

Guide complet étape par étape pour déployer votre site sur OVH Cloud.

---

## 📋 Vos informations

### Domaines
- **Principal** : paro-spe.fr (sans www)
- **Redirections** : paro-spe.com, parospe.com, parospe.fr → tous vers paro-spe.fr

### Hébergement OVH
- **Forfait** : Perso (10 Go)
- **Serveur FTP** : ftp.cluster100.hosting.ovh.net
- **Login FTP** : parosps
- **Port** : 21

### Emails
- secretariat@paro-spe.fr (contact site)
- dr-brochand@paro-spe.fr (personnel)

---

## 🎯 Plan de déploiement en 7 étapes

### ✅ Étape 1 : Configuration DNS (30 min + 24h propagation)
**Guide** : [GUIDE-DNS-OVH.md](./GUIDE-DNS-OVH.md)

**À faire :**
1. Se connecter à OVH Manager
2. Noter l'IP de l'hébergement
3. Configurer les DNS de paro-spe.fr (A, CNAME, MX)
4. Configurer les redirections pour les 3 autres domaines
5. Attendre la propagation (4-24h)

**Vérification** : `dig paro-spe.fr A` doit retourner l'IP OVH

---

### ✅ Étape 2 : Activation SSL (10 min + 2h activation)
**Guide** : [GUIDE-SSL-OVH.md](./GUIDE-SSL-OVH.md)

**À faire :**
1. Attendre que les DNS soient propagés (étape 1)
2. Dans OVH Manager > Hébergements
3. Commander un certificat SSL Let's Encrypt (gratuit)
4. Sélectionner paro-spe.fr et www.paro-spe.fr
5. Attendre l'activation (5 min à 2h)

**Vérification** : `https://paro-spe.fr` affiche un cadenas vert

---

### ✅ Étape 3 : Création des adresses email (15 min)
**Guide** : [GUIDE-EMAILS-OVH.md](./GUIDE-EMAILS-OVH.md)

**À faire :**
1. Dans OVH Manager > Emails > paro-spe.fr
2. Créer `secretariat@paro-spe.fr` (5 Go)
3. Créer `dr-brochand@paro-spe.fr` (5 Go)
4. Noter les mots de passe
5. Activer FormSubmit pour le formulaire de contact
6. Tester l'envoi/réception d'emails

**Vérification** : Se connecter au webmail et envoyer un email de test

---

### ✅ Étape 4 : Déploiement du site (5 min)
**Guide** : [QUICKSTART-OVH.md](./QUICKSTART-OVH.md)

**À faire :**
1. Le fichier `.env.ovh` est déjà configuré avec vos identifiants ✅
2. Installer les dépendances :
   ```bash
   npm install
   brew install lftp  # ou sudo apt-get install lftp
   ```
3. Déployer :
   ```bash
   chmod +x deploy-ovh.sh
   ./deploy-ovh.sh production
   ```
4. Attendre la fin du déploiement (2-3 min)

**Vérification** : Ouvrir `https://paro-spe.fr` → le site s'affiche

---

### ✅ Étape 5 : Google Analytics (20 min - optionnel)
**Guide** : [GUIDE-ANALYTICS-SANS-COOKIES.md](./GUIDE-ANALYTICS-SANS-COOKIES.md)

**À faire :**
1. Créer un compte Google Analytics
2. Récupérer l'ID de mesure (G-XXXXXXXXXX)
3. Éditer `js/analytics.js` et remplacer `G-XXXXXXXXXX` par votre ID
4. Redéployer avec `./deploy-ovh.sh production`
5. Vérifier dans GA > Rapports > Temps réel

**⚠️ Sans cookies, pas de bandeau obligatoire !**

**Vérification** : GA affiche 1 utilisateur actif quand vous visitez le site

---

### ✅ Étape 6 : Monitoring UptimeRobot (15 min - optionnel)
**Guide** : [GUIDE-UPTIMEROBOT.md](./GUIDE-UPTIMEROBOT.md)

**À faire :**
1. Créer un compte sur uptimerobot.com
2. Ajouter un monitor pour `https://paro-spe.fr` (vérification 5 min)
3. Configurer les alertes email (dr-brochand@ et secretariat@)
4. Tester une alerte

**Vérification** : Recevoir un email de test d'UptimeRobot

---

### ✅ Étape 7 : Vérifications finales (15 min)
**Checklist** : [CHECKLIST-DEPLOIEMENT.md](./CHECKLIST-DEPLOIEMENT.md)

**À vérifier :**
- [ ] `https://paro-spe.fr` accessible
- [ ] `http://paro-spe.fr` → redirige vers HTTPS
- [ ] `www.paro-spe.fr` → redirige vers paro-spe.fr
- [ ] `paro-spe.com`, `parospe.com`, `parospe.fr` → redirigent tous
- [ ] Formulaire de contact fonctionne
- [ ] Emails reçus sur secretariat@paro-spe.fr
- [ ] Headers de sécurité OK (tester sur securityheaders.com)
- [ ] Performance OK (tester sur pagespeed.web.dev)
- [ ] Aucun cookie créé (F12 > Application > Cookies)

---

## ⚠️ Choses importantes à faire APRÈS le premier déploiement

### 1. Changer le mot de passe FTP
1. OVH Manager > Hébergements > FTP-SSH
2. Modifier le mot de passe de `parosps`
3. Mettre à jour le fichier `.env.ovh` avec le nouveau mot de passe

### 2. Activer FormSubmit pour le formulaire
1. Aller sur [formsubmit.co](https://formsubmit.co/)
2. Entrer `secretariat@paro-spe.fr`
3. Cliquer sur le lien de confirmation dans l'email reçu

### 3. Configurer Google Analytics (si souhaité)
1. Créer le compte GA
2. Éditer `js/analytics.js` avec votre ID
3. Redéployer

---

## 📞 Support en cas de problème

### Documentation complète
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide exhaustif (800+ lignes)
- [CHECKLIST-DEPLOIEMENT.md](./CHECKLIST-DEPLOIEMENT.md) - 70+ points de vérification

### Guides spécifiques
- [GUIDE-DNS-OVH.md](./GUIDE-DNS-OVH.md) - Configuration DNS détaillée
- [GUIDE-SSL-OVH.md](./GUIDE-SSL-OVH.md) - Activation SSL pas à pas
- [GUIDE-EMAILS-OVH.md](./GUIDE-EMAILS-OVH.md) - Création emails
- [GUIDE-ANALYTICS-SANS-COOKIES.md](./GUIDE-ANALYTICS-SANS-COOKIES.md) - GA anonyme
- [GUIDE-UPTIMEROBOT.md](./GUIDE-UPTIMEROBOT.md) - Monitoring uptime

### Support OVH
- Espace client : [ovh.com/manager](https://www.ovh.com/manager/)
- Documentation : [docs.ovh.com](https://docs.ovh.com/)
- Support : Créer un ticket dans l'espace client

---

## 🔄 Déploiements suivants (après le premier)

Une fois que tout est configuré, déployer une mise à jour est ultra-simple :

```bash
# 1. Faire vos modifications dans le code
# 2. Déployer
./deploy-ovh.sh production
```

C'est tout ! Le script s'occupe de :
- ✅ Build CSS/JS
- ✅ Optimisation images
- ✅ Mise à jour Service Worker
- ✅ Backup automatique
- ✅ Upload FTP

---

## 📊 Statistiques cibles

Après déploiement, vous devriez avoir :

| Métrique | Cible | Test |
|----------|-------|------|
| **Sécurité** | A ou A+ | [securityheaders.com](https://securityheaders.com/?q=https://paro-spe.fr) |
| **SSL** | A ou A+ | [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/analyze.html?d=paro-spe.fr) |
| **Performance Mobile** | > 90 | [pagespeed.web.dev](https://pagespeed.web.dev/?url=https://paro-spe.fr) |
| **Performance Desktop** | > 95 | [pagespeed.web.dev](https://pagespeed.web.dev/?url=https://paro-spe.fr) |
| **Uptime** | > 99.9% | UptimeRobot dashboard |

---

## ⏱️ Temps total estimé

| Étape | Temps | Attente |
|-------|-------|---------|
| 1. DNS | 30 min | 4-24h |
| 2. SSL | 10 min | 5 min - 2h |
| 3. Emails | 15 min | 5-15 min |
| 4. Déploiement | 5 min | - |
| 5. Analytics | 20 min | - |
| 6. UptimeRobot | 15 min | - |
| 7. Vérifications | 15 min | - |
| **TOTAL** | **~2h** | **+ 24h propagation** |

**Durée réelle : 1 journée de travail + 1 journée d'attente DNS**

---

## ✅ Ce qui est déjà fait pour vous

Dans ce projet, **tout est déjà configuré** :

- ✅ Fichier `.htaccess` avec redirections multi-domaines
- ✅ Fichier `.env.ovh` avec vos identifiants FTP
- ✅ Script de déploiement `deploy-ovh.sh` prêt à l'emploi
- ✅ Formulaire configuré pour `secretariat@paro-spe.fr`
- ✅ Google Analytics en mode anonyme (juste mettre votre ID)
- ✅ Monitoring JS/PHP intégré
- ✅ Health check endpoint (`/health-check.php`)
- ✅ Page 500 personnalisée
- ✅ Tous les headers de sécurité configurés
- ✅ Compression GZIP activée
- ✅ Cache optimisé
- ✅ Protection des fichiers sensibles

**Vous n'avez QUE la configuration externe à faire (DNS, SSL, emails).**

---

## 🎉 Une fois tout configuré

Votre site sera :

✅ **Sécurisé** - HTTPS, headers de sécurité, protection fichiers  
✅ **Performant** - Compression, cache, images optimisées  
✅ **Surveillé** - UptimeRobot + monitoring erreurs  
✅ **RGPD** - Analytics anonyme, pas de cookies, pas de bandeau  
✅ **Professionnel** - Emails @paro-spe.fr, formulaire fonctionnel  
✅ **Multi-domaines** - Tous les domaines redirigent vers le principal  

**Félicitations ! Vous avez un site de qualité professionnelle ! 🚀**

---

**Commencez par l'étape 1 : [GUIDE-DNS-OVH.md](./GUIDE-DNS-OVH.md)**

Bonne chance ! 💪
