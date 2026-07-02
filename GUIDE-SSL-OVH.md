# 🔒 Guide d'activation SSL Let's Encrypt - Paro-Spé

Guide étape par étape pour activer le certificat SSL gratuit sur vos domaines.

---

## 🎯 Objectif

Activer le HTTPS sur tous vos domaines avec un certificat SSL gratuit Let's Encrypt fourni par OVH.

---

## ⚠️ Prérequis

Avant d'activer le SSL, vous DEVEZ avoir :

- ✅ Configuré les DNS (voir [GUIDE-DNS-OVH.md](./GUIDE-DNS-OVH.md))
- ✅ Attendu la propagation DNS (4-24h)
- ✅ Vérifié que le domaine pointe vers votre hébergement

**Pour vérifier :**
```bash
ping paro-spe.fr
# Doit répondre avec l'IP de votre hébergement OVH
```

---

## 📍 Étape 1 : Activer SSL sur paro-spe.fr (domaine principal)

### 1.1 Accéder à la gestion SSL

1. Connectez-vous à [ovh.com/manager](https://www.ovh.com/manager/)
2. Allez dans **Hébergements** (menu de gauche)
3. Cliquez sur votre hébergement (celui avec le login `parosps`)
4. Onglet **Informations générales**
5. Descendez jusqu'à la section **Certificat SSL**

### 1.2 Commander le certificat Let's Encrypt

**Si aucun certificat n'est actif :**

1. Cliquez sur le bouton **Commander un certificat SSL**
2. Choisissez **Certificat gratuit (Let's Encrypt)**
3. Cliquez sur **Suivant**
4. Sélectionnez **paro-spe.fr** et **www.paro-spe.fr**
5. Cliquez sur **Valider**

**Si un certificat est déjà présent mais inactif :**

1. Cliquez sur le bouton **Régénérer le certificat SSL**
2. Suivez les mêmes étapes

### 1.3 Attendre l'activation

⏱️ **Temps d'activation : 5 minutes à quelques heures**

Le statut du certificat passera de :
- `En cours de génération` → `Actif`

Vous recevrez un email de confirmation d'OVH.

---

## 📍 Étape 2 : Activer SSL sur les domaines secondaires

Si vous avez configuré les domaines **paro-spe.com**, **parospe.com**, **parospe.fr** via l'Option 2 (DNS vers hébergement) dans le guide DNS :

### 2.1 Vérifier les domaines dans Multisite

1. Dans votre hébergement, allez dans l'onglet **Multisite**
2. Vérifiez que tous les domaines sont listés :
   - paro-spe.fr
   - www.paro-spe.fr
   - paro-spe.com
   - www.paro-spe.com
   - parospe.com
   - www.parospe.com
   - parospe.fr
   - www.parospe.fr

### 2.2 Activer SSL pour chaque domaine

Pour chaque domaine listé :

1. Cliquez sur le bouton **...** à droite du domaine
2. Cliquez sur **Modifier le domaine**
3. Cochez **SSL**
4. Cliquez sur **Suivant** puis **Valider**

### 2.3 Régénérer le certificat

Une fois tous les domaines configurés avec SSL :

1. Retournez dans **Informations générales** > Section **Certificat SSL**
2. Cliquez sur **Régénérer le certificat SSL**
3. Sélectionnez **tous les domaines**
4. Cliquez sur **Valider**

---

## 📍 Étape 3 : Vérifier l'activation SSL

### 3.1 Tester en ligne

**Après activation (peut prendre jusqu'à 2h) :**

1. Ouvrez votre navigateur
2. Allez sur `https://paro-spe.fr` (avec le **s** de https)
3. Vérifiez le cadenas vert dans la barre d'adresse
4. Cliquez sur le cadenas → **Le certificat est valide**

### 3.2 Tester avec SSL Labs

Pour un test complet de la sécurité SSL :

1. Allez sur [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
2. Entrez `paro-spe.fr`
3. Lancez le test (prend 2-3 minutes)
4. **Score visé : A ou A+**

### 3.3 Vérifier en ligne de commande

```bash
# Vérifier le certificat SSL
openssl s_client -connect paro-spe.fr:443 -servername paro-spe.fr

# Chercher la ligne "issuer" qui doit contenir "Let's Encrypt"
# Chercher la ligne "subject" qui doit contenir votre domaine
```

---

## 📍 Étape 4 : Forcer HTTPS (redirections automatiques)

### 4.1 Vérifier le .htaccess

Le fichier `.htaccess` que nous avons créé **force automatiquement HTTPS**.

Vérifiez qu'il contient bien ces lignes :

```apache
# Forcer HTTPS
RewriteCond %{HTTPS} !=on
RewriteCond %{REQUEST_URI} !^/\.well-known/
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

✅ **Déjà configuré dans le .htaccess du projet !**

### 4.2 Tester les redirections

Une fois le site déployé, testez :

| URL testée | Doit rediriger vers |
|------------|---------------------|
| `http://paro-spe.fr` | `https://paro-spe.fr` |
| `http://www.paro-spe.fr` | `https://paro-spe.fr` |
| `https://www.paro-spe.fr` | `https://paro-spe.fr` |
| `http://paro-spe.com` | `https://paro-spe.fr` |
| `https://paro-spe.com` | `https://paro-spe.fr` |

---

## 📍 Étape 5 : Activer HSTS (sécurité renforcée)

### Qu'est-ce que HSTS ?

**HTTP Strict Transport Security** force les navigateurs à toujours utiliser HTTPS pendant 1 an.

### C'est déjà configuré !

Le fichier `.htaccess` contient déjà :

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### Inscrire votre domaine dans HSTS Preload (optionnel)

Pour une sécurité maximale, vous pouvez inscrire votre domaine dans la liste HSTS Preload des navigateurs :

1. Allez sur [hstspreload.org](https://hstspreload.org/)
2. Entrez `paro-spe.fr`
3. Vérifiez les prérequis
4. Cliquez sur **Submit**

⚠️ **Attention :** Une fois inscrit dans HSTS Preload, **il est très difficile de revenir en arrière** (plusieurs mois). Ne le faites que si vous êtes sûr de toujours utiliser HTTPS.

---

## 📍 Étape 6 : Renouvellement automatique

### Le certificat se renouvelle tout seul !

Les certificats Let's Encrypt sont valides **90 jours** mais OVH les renouvelle **automatiquement** 30 jours avant expiration.

**Vous n'avez RIEN à faire !**

### Vérifier la date d'expiration

1. Dans OVH Manager > Hébergements > Votre hébergement
2. Section **Certificat SSL**
3. Vous verrez la date d'expiration

Ou en ligne de commande :

```bash
echo | openssl s_client -connect paro-spe.fr:443 -servername paro-spe.fr 2>/dev/null | openssl x509 -noout -dates
```

---

## ✅ Checklist de vérification SSL

Après activation :

- [ ] Le certificat SSL est **Actif** dans OVH Manager
- [ ] `https://paro-spe.fr` affiche un **cadenas vert**
- [ ] Pas d'avertissement de sécurité dans le navigateur
- [ ] `http://paro-spe.fr` redirige automatiquement vers `https://paro-spe.fr`
- [ ] `www.paro-spe.fr` redirige vers `paro-spe.fr` (sans www)
- [ ] Score SSL Labs : **A ou A+**
- [ ] HSTS est actif (vérifiable dans les headers)
- [ ] Tous les domaines secondaires redirigent en HTTPS

---

## 🆘 Problèmes courants

### Le certificat ne s'active pas après plusieurs heures

**Causes possibles :**

1. **DNS mal configurés** → Vérifiez que le domaine pointe bien vers l'hébergement
2. **Domaine pas encore propagé** → Attendez la propagation complète (24h)
3. **Fichier .well-known bloqué** → Vérifiez que le .htaccess n'empêche pas l'accès

**Solution :**

```bash
# Vérifier que le domaine pointe vers l'hébergement
dig paro-spe.fr A

# Attendre la propagation complète
# Réessayer de générer le certificat le lendemain
```

### Avertissement "Connexion non sécurisée" après activation

**Causes possibles :**

1. **Le certificat est en cours de génération** → Attendez encore un peu
2. **Le site charge du contenu HTTP** (images, CSS, JS) → Vérifiez les URLs dans le code

**Solution :**

Vérifiez qu'aucun fichier n'est chargé en HTTP :
- Ouvrez la console du navigateur (F12)
- Cherchez les erreurs "Mixed Content"
- Remplacez tous les `http://` par `https://` ou par des URLs relatives

### Le cadenas est barré ou orange

**Causes :**

- **Mixed Content** : Le site charge des ressources en HTTP

**Solution :**

1. Ouvrez la console du navigateur (F12)
2. Onglet **Security** ou **Sécurité**
3. Identifiez les ressources non sécurisées
4. Corrigez les URLs dans le code

✅ **Notre site charge tout en relatif ou HTTPS, pas de problème !**

### Erreur "Trop de redirections"

**Cause :** Conflit entre les redirections OVH et le .htaccess

**Solution :**

1. Dans OVH Manager, vérifiez l'option **Multisite**
2. Pour paro-spe.fr, vérifiez que **Redirection** est **désactivée**
3. Seul le .htaccess doit gérer les redirections

---

## 📊 Vérifier les headers de sécurité

Une fois SSL actif et le site déployé, testez les headers :

**1. Test en ligne :**

Allez sur [securityheaders.com](https://securityheaders.com/?q=https://paro-spe.fr)

**Score visé : A ou A+**

**2. Test en ligne de commande :**

```bash
curl -I https://paro-spe.fr
```

Vous devriez voir :
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 📚 Prochaines étapes

Une fois le SSL activé :

1. ✅ Créez les adresses email → Voir **[GUIDE-EMAILS-OVH.md](./GUIDE-EMAILS-OVH.md)**
2. ✅ Déployez le site → Voir **[QUICKSTART-OVH.md](./QUICKSTART-OVH.md)**
3. ✅ Vérifiez la sécurité → Voir **[CHECKLIST-DEPLOIEMENT.md](./CHECKLIST-DEPLOIEMENT.md)**

---

## 📖 Ressources

- [Documentation OVH SSL](https://docs.ovh.com/fr/hosting/les-certificats-ssl-sur-les-hebergements-web/)
- [Let's Encrypt](https://letsencrypt.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [HSTS Preload](https://hstspreload.org/)

---

**🔒 Votre site est maintenant sécurisé en HTTPS !**

*Temps estimé : 10 minutes de configuration + 5 min à 2h d'activation*
