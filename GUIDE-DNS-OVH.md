# 🌐 Guide de Configuration DNS - Paro-Spé

Guide étape par étape pour configurer les DNS de tous vos domaines chez OVH.

---

## 📋 Vos domaines

Vous avez **4 domaines** à configurer :

| Domaine | Rôle |
|---------|------|
| **paro-spe.fr** | ✅ Domaine principal (avec HTTPS) |
| paro-spe.com | ↪️ Redirige vers paro-spe.fr |
| parospe.com | ↪️ Redirige vers paro-spe.fr |
| parospe.fr | ↪️ Redirige vers paro-spe.fr |

---

## 🎯 Objectif

- **paro-spe.fr** → Site principal accessible en HTTPS
- **www.paro-spe.fr** → Redirige automatiquement vers paro-spe.fr
- **Tous les autres domaines** → Redirigent vers paro-spe.fr

---

## 📍 Étape 1 : Trouver l'adresse IP de votre hébergement

### 1.1 Se connecter à OVH Manager

1. Allez sur [ovh.com/manager](https://www.ovh.com/manager/)
2. Connectez-vous avec vos identifiants OVH

### 1.2 Récupérer l'IP de l'hébergement

1. Dans le menu de gauche, allez dans **Hébergements**
2. Cliquez sur votre hébergement (celui avec le login FTP `parosps`)
3. Onglet **Informations générales**
4. Notez l'**adresse IPv4** (quelque chose comme `213.186.33.XXX`)

📝 **Notez cette IP :** `___________________` ← Vous en aurez besoin !

---

## 📍 Étape 2 : Configurer paro-spe.fr (domaine principal)

### 2.1 Accéder à la zone DNS

1. Dans OVH Manager, allez dans **Domaines** (menu de gauche)
2. Cliquez sur **paro-spe.fr**
3. Cliquez sur l'onglet **Zone DNS**

### 2.2 Vérifier/Ajouter l'enregistrement A

**Cherchez un enregistrement A pour le sous-domaine vide (ou @)**

#### Si l'enregistrement existe déjà :
1. Cliquez sur le bouton **...** à droite
2. Cliquez sur **Modifier l'entrée**
3. **Cible** : Mettez l'adresse IP de votre hébergement (notée à l'étape 1.2)
4. Cliquez sur **Suivant** puis **Valider**

#### Si l'enregistrement n'existe pas :
1. Cliquez sur **Ajouter une entrée**
2. Choisissez **A**
3. **Sous-domaine** : Laissez vide (ou mettez `@`)
4. **Cible** : Mettez l'adresse IP de votre hébergement
5. **TTL** : Laissez par défaut
6. Cliquez sur **Suivant** puis **Valider**

**Résultat attendu :**
```
Type    Sous-domaine    TTL     Cible
A       (vide ou @)     3600    213.186.33.XXX (votre IP)
```

### 2.3 Configurer l'enregistrement CNAME pour www

**Cherchez un enregistrement CNAME pour www**

#### Si l'enregistrement existe :
1. Cliquez sur le bouton **...** à droite
2. Cliquez sur **Modifier l'entrée**
3. **Cible** : `paro-spe.fr.` (avec le point à la fin !)
4. Cliquez sur **Suivant** puis **Valider**

#### Si l'enregistrement n'existe pas :
1. Cliquez sur **Ajouter une entrée**
2. Choisissez **CNAME**
3. **Sous-domaine** : `www`
4. **Cible** : `paro-spe.fr.` (avec le point à la fin !)
5. **TTL** : Laissez par défaut
6. Cliquez sur **Suivant** puis **Valider**

**Résultat attendu :**
```
Type    Sous-domaine    TTL     Cible
CNAME   www             3600    paro-spe.fr.
```

### 2.4 Configurer les enregistrements MX (pour les emails)

**Pour recevoir des emails sur @paro-spe.fr, vous devez configurer les enregistrements MX**

1. Cliquez sur **Ajouter une entrée**
2. Choisissez **MX**
3. **Sous-domaine** : Laissez vide
4. **Priorité** : `1`
5. **Cible** : `mx1.mail.ovh.net.` (avec le point à la fin !)
6. Cliquez sur **Suivant** puis **Valider**

7. Répétez pour le serveur de backup :
   - **Priorité** : `5`
   - **Cible** : `mx2.mail.ovh.net.`

8. Répétez pour le troisième serveur :
   - **Priorité** : `100`
   - **Cible** : `mx3.mail.ovh.net.`

**Résultat attendu :**
```
Type    Sous-domaine    Priorité    Cible
MX      (vide)          1           mx1.mail.ovh.net.
MX      (vide)          5           mx2.mail.ovh.net.
MX      (vide)          100         mx3.mail.ovh.net.
```

### 2.5 Configurer les enregistrements SPF et DKIM (anti-spam)

**SPF (Sender Policy Framework) :**

1. Cliquez sur **Ajouter une entrée**
2. Choisissez **TXT**
3. **Sous-domaine** : Laissez vide
4. **Valeur** : `v=spf1 include:mx.ovh.com ~all`
5. **TTL** : Laissez par défaut
6. Cliquez sur **Suivant** puis **Valider**

**DMARC (Domain-based Message Authentication) :**

1. Cliquez sur **Ajouter une entrée**
2. Choisissez **TXT**
3. **Sous-domaine** : `_dmarc`
4. **Valeur** : `v=DMARC1; p=quarantine; rua=mailto:secretariat@paro-spe.fr`
5. Cliquez sur **Suivant** puis **Valider**

**Résultat attendu :**
```
Type    Sous-domaine    Valeur
TXT     (vide)          v=spf1 include:mx.ovh.com ~all
TXT     _dmarc          v=DMARC1; p=quarantine; rua=mailto:secretariat@paro-spe.fr
```

---

## 📍 Étape 3 : Configurer les domaines de redirection

Pour **paro-spe.com**, **parospe.com** et **parospe.fr**, vous avez **2 options** :

### ✅ Option 1 : Redirection visible (RECOMMANDÉE)

Cette méthode utilise la fonction de redirection d'OVH. L'URL change dans la barre d'adresse.

#### Pour chaque domaine (paro-spe.com, parospe.com, parospe.fr) :

1. Dans OVH Manager, allez dans **Domaines**
2. Cliquez sur le domaine (ex: **paro-spe.com**)
3. Cliquez sur l'onglet **Redirection**
4. Cliquez sur **Ajouter une redirection**
5. **Type de redirection** : Choisissez **Visible**
6. **Sous-domaine** : Laissez vide (pour rediriger le domaine racine)
7. **Cible** : `https://paro-spe.fr`
8. **Type** : **301 - Permanent**
9. Cochez **Rediriger également www**
10. Cliquez sur **Valider**

Répétez pour chacun des 3 domaines.

**✅ Avantages :**
- Simple à configurer
- Gestion directe par OVH
- Pas besoin de configurer les DNS

### Option 2 : Redirection via DNS (alternative)

Si vous préférez gérer les redirections via le .htaccess (déjà configuré), vous devez pointer les DNS vers le même hébergement.

#### Pour chaque domaine (paro-spe.com, parospe.com, parospe.fr) :

1. Allez dans **Domaines** > Cliquez sur le domaine
2. Onglet **Zone DNS**
3. Ajoutez un enregistrement **A** :
   - **Sous-domaine** : Laissez vide
   - **Cible** : L'adresse IP de votre hébergement (la même que paro-spe.fr)
4. Ajoutez un enregistrement **CNAME** pour www :
   - **Sous-domaine** : `www`
   - **Cible** : `paro-spe.fr.`

**⚠️ Note :** Avec cette option, vous devez attacher tous les domaines à votre hébergement (voir section Multisite ci-dessous).

---

## 📍 Étape 4 : Attacher les domaines à l'hébergement (Multisite)

⚠️ **Seulement si vous avez choisi l'Option 2 pour les redirections**

### 4.1 Configurer le domaine principal

1. Dans OVH Manager, allez dans **Hébergements**
2. Cliquez sur votre hébergement
3. Onglet **Multisite**
4. Vérifiez que **paro-spe.fr** est présent
   - **Domaine** : `paro-spe.fr`
   - **Dossier racine** : `www` (ou laissez vide si vous déployez à la racine)
   - **SSL** : Activez-le (voir Guide SSL)

### 4.2 Ajouter les domaines de redirection

Pour chaque domaine secondaire (paro-spe.com, parospe.com, parospe.fr) :

1. Cliquez sur **Ajouter un domaine**
2. **Domaine** : `paro-spe.com` (ou parospe.com, parospe.fr)
3. Cochez **Avec www**
4. **Dossier racine** : `www` (le même que paro-spe.fr)
5. **SSL** : Activez-le
6. Cliquez sur **Suivant** puis **Valider**

Répétez pour chacun des 3 domaines.

**Le .htaccess s'occupera automatiquement des redirections.**

---

## 📍 Étape 5 : Vérifier la configuration

### 5.1 Attendre la propagation DNS

⏱️ **Temps de propagation : 4 à 24 heures** (généralement 1-2h)

### 5.2 Vérifier avec des outils en ligne

**Vérifier les enregistrements A :**

Allez sur [dnschecker.org](https://dnschecker.org) et vérifiez :
- `paro-spe.fr` → Doit pointer vers l'IP de votre hébergement
- `www.paro-spe.fr` → Doit pointer vers paro-spe.fr

**Vérifier les enregistrements MX :**

Allez sur [mxtoolbox.com](https://mxtoolbox.com) et testez `paro-spe.fr`

### 5.3 Vérifier en ligne de commande

Si vous avez accès à un terminal :

```bash
# Vérifier l'enregistrement A
dig paro-spe.fr A

# Vérifier le CNAME de www
dig www.paro-spe.fr CNAME

# Vérifier les MX
dig paro-spe.fr MX

# Vérifier le SPF
dig paro-spe.fr TXT
```

---

## ✅ Checklist de vérification

Une fois la propagation terminée :

- [ ] `paro-spe.fr` pointe vers l'IP de votre hébergement
- [ ] `www.paro-spe.fr` est un CNAME vers paro-spe.fr
- [ ] Les 3 enregistrements MX sont configurés
- [ ] L'enregistrement SPF est présent
- [ ] L'enregistrement DMARC est présent
- [ ] Les redirections des domaines secondaires sont configurées
- [ ] `paro-spe.com`, `parospe.com`, `parospe.fr` redirigent vers paro-spe.fr

---

## 🆘 Problèmes courants

### Le site ne s'affiche pas après 24h

1. Vérifiez que l'enregistrement A pointe vers la bonne IP
2. Videz le cache DNS de votre ordinateur :
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Les redirections ne fonctionnent pas

1. Vérifiez que le .htaccess est bien uploadé sur le serveur
2. Si vous utilisez l'Option 2, vérifiez que les domaines sont bien attachés dans Multisite
3. Attendez la propagation DNS complète

### Les emails ne sont pas reçus

1. Vérifiez les enregistrements MX avec [mxtoolbox.com](https://mxtoolbox.com)
2. Vérifiez que les adresses email sont créées (voir GUIDE-EMAILS-OVH.md)
3. Vérifiez que l'enregistrement SPF est correct

---

## 📚 Prochaines étapes

Une fois les DNS configurés :

1. ✅ Activez le certificat SSL → Voir **[GUIDE-SSL-OVH.md](./GUIDE-SSL-OVH.md)**
2. ✅ Créez les adresses email → Voir **[GUIDE-EMAILS-OVH.md](./GUIDE-EMAILS-OVH.md)**
3. ✅ Déployez le site → Voir **[QUICKSTART-OVH.md](./QUICKSTART-OVH.md)**

---

**🎉 Vos DNS sont maintenant configurés !**

*Temps estimé : 15-20 minutes de configuration + 4-24h de propagation*
