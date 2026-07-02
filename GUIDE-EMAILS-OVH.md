# 📧 Guide de Création des Adresses Email - Paro-Spé

Guide étape par étape pour créer et configurer les adresses email professionnelles.

---

## 📋 Adresses à créer

Vous avez besoin de **2 adresses email** :

| Adresse | Utilisation |
|---------|-------------|
| **secretariat@paro-spe.fr** | Formulaire de contact du site, contact général |
| **dr-brochand@paro-spe.fr** | Adresse personnelle du Dr Brochand |

---

## ⚠️ Prérequis

Avant de créer les adresses email, vous DEVEZ avoir :

- ✅ Configuré les DNS avec les enregistrements MX (voir [GUIDE-DNS-OVH.md](./GUIDE-DNS-OVH.md))
- ✅ Attendu la propagation DNS (4-24h)

**Pour vérifier que les MX sont configurés :**

Allez sur [mxtoolbox.com](https://mxtoolbox.com) et testez `paro-spe.fr`

Vous devriez voir 3 serveurs MX :
- mx1.mail.ovh.net
- mx2.mail.ovh.net
- mx3.mail.ovh.net

---

## 📍 Étape 1 : Vérifier votre offre email

### 1.1 Accéder à la gestion des emails

1. Connectez-vous à [ovh.com/manager](https://www.ovh.com/manager/)
2. Allez dans **Emails** (menu de gauche)
3. Cliquez sur **paro-spe.fr**

### 1.2 Vérifier le quota d'emails

Le **forfait Perso OVH** inclut **10 adresses email de 5 Go** chacune.

Vous allez en créer 2, il vous en restera 8 pour le futur.

---

## 📍 Étape 2 : Créer secretariat@paro-spe.fr

### 2.1 Créer l'adresse

1. Dans **Emails** > **paro-spe.fr**
2. Onglet **Comptes email**
3. Cliquez sur **Créer une adresse email** (ou **Ajouter un compte**)
4. Remplissez :
   - **Nom du compte** : `secretariat`
   - **Description** : `Secrétariat du cabinet - Contact général`
   - **Taille** : `5 Go` (max disponible)
   - **Mot de passe** : Choisissez un mot de passe sécurisé
   - **Confirmation** : Retapez le mot de passe
5. Cliquez sur **Valider**

📝 **Notez le mot de passe** : ___________________

### 2.2 Attendre l'activation

⏱️ **Temps d'activation : 5-15 minutes**

Vous verrez l'adresse apparaître dans la liste avec le statut **Actif**.

---

## 📍 Étape 3 : Créer dr-brochand@paro-spe.fr

### 3.1 Créer l'adresse

Même procédure que pour l'adresse précédente :

1. Cliquez sur **Créer une adresse email**
2. Remplissez :
   - **Nom du compte** : `dr-brochand`
   - **Description** : `Dr Raphaël Brochand`
   - **Taille** : `5 Go`
   - **Mot de passe** : Choisissez un mot de passe sécurisé
   - **Confirmation** : Retapez le mot de passe
3. Cliquez sur **Valider**

📝 **Notez le mot de passe** : ___________________

---

## 📍 Étape 4 : Configurer une redirection (optionnel)

Si vous voulez que les emails de `secretariat@paro-spe.fr` soient automatiquement redirigés vers une autre adresse (Gmail, Outlook, etc.) :

### 4.1 Créer une redirection

1. Dans **Emails** > **paro-spe.fr**
2. Onglet **Redirection**
3. Cliquez sur **Ajouter une redirection**
4. Remplissez :
   - **De l'adresse** : `secretariat@paro-spe.fr`
   - **Vers l'adresse** : `votre-email@gmail.com` (ou autre)
   - **Conserver une copie** : Cochez si vous voulez garder les emails sur le serveur OVH
5. Cliquez sur **Valider**

⚠️ **Note :** Avec une redirection, vous pouvez recevoir les emails sur votre boîte personnelle tout en gardant une adresse professionnelle.

---

## 📍 Étape 5 : Accéder au webmail

### 5.1 Se connecter au webmail OVH

1. Allez sur [webmail.ovh.com](https://www.webmail.ovh.com/)
2. Entrez :
   - **Adresse email** : `secretariat@paro-spe.fr`
   - **Mot de passe** : Le mot de passe créé à l'étape 2
3. Cliquez sur **Connexion**

Vous accédez au webmail RoundCube.

### 5.2 Tester l'envoi d'un email

1. Cliquez sur **Nouveau message**
2. **Destinataire** : Votre email personnel (pour tester)
3. **Objet** : `Test email Paro-Spé`
4. **Message** : `Test de l'adresse secretariat@paro-spe.fr`
5. Cliquez sur **Envoyer**
6. Vérifiez que vous recevez bien l'email

---

## 📍 Étape 6 : Configurer un client email (Outlook, Thunderbird, etc.)

### 6.1 Paramètres de configuration

Pour configurer un client email (Outlook, Thunderbird, Mail, etc.) :

#### Serveur entrant (IMAP - recommandé)
- **Serveur** : `ssl0.ovh.net`
- **Port** : `993`
- **Sécurité** : SSL/TLS
- **Nom d'utilisateur** : `secretariat@paro-spe.fr`
- **Mot de passe** : Le mot de passe créé

#### Serveur sortant (SMTP)
- **Serveur** : `ssl0.ovh.net`
- **Port** : `587` (STARTTLS) ou `465` (SSL/TLS)
- **Sécurité** : STARTTLS ou SSL/TLS
- **Authentification** : Oui
- **Nom d'utilisateur** : `secretariat@paro-spe.fr`
- **Mot de passe** : Le même mot de passe

### 6.2 Configuration automatique

La plupart des clients email détectent automatiquement les paramètres OVH.

Il suffit de :
1. Ajouter un compte
2. Entrer l'adresse email complète
3. Entrer le mot de passe
4. Le client configure tout automatiquement

---

## 📍 Étape 7 : Configurer sur mobile (iOS/Android)

### iPhone/iPad

1. **Réglages** > **Mail** > **Comptes** > **Ajouter un compte**
2. Choisissez **Autre**
3. Sélectionnez **Ajouter un compte Mail**
4. Remplissez :
   - **Nom** : `Secrétariat Paro-Spé`
   - **Adresse** : `secretariat@paro-spe.fr`
   - **Mot de passe** : Votre mot de passe
   - **Description** : `Paro-Spé`
5. Cliquez sur **Suivant**
6. Sélectionnez **IMAP**
7. **Serveur de réception** :
   - **Nom d'hôte** : `ssl0.ovh.net`
   - **Nom d'utilisateur** : `secretariat@paro-spe.fr`
   - **Mot de passe** : Votre mot de passe
8. **Serveur d'envoi** :
   - **Nom d'hôte** : `ssl0.ovh.net`
   - **Nom d'utilisateur** : `secretariat@paro-spe.fr`
   - **Mot de passe** : Votre mot de passe
9. Cliquez sur **Suivant** puis **Enregistrer**

### Android (Gmail App)

1. Ouvrez l'application **Gmail**
2. Menu > **Paramètres** > **Ajouter un compte**
3. Choisissez **Autre**
4. Entrez `secretariat@paro-spe.fr`
5. Choisissez **Personnel (IMAP)**
6. Entrez le mot de passe
7. Les paramètres se configurent automatiquement
8. Cliquez sur **Suivant** pour finaliser

---

## 📍 Étape 8 : Sécuriser les emails (SPF, DKIM, DMARC)

### 8.1 Vérifier le SPF

Le SPF indique aux serveurs de messagerie quels serveurs sont autorisés à envoyer des emails pour votre domaine.

**Déjà configuré dans le guide DNS !**

Vérifiez l'enregistrement TXT :
```
v=spf1 include:mx.ovh.com ~all
```

### 8.2 Vérifier le DMARC

Le DMARC protège contre le spoofing (usurpation d'identité).

**Déjà configuré dans le guide DNS !**

Enregistrement TXT sur `_dmarc.paro-spe.fr` :
```
v=DMARC1; p=quarantine; rua=mailto:secretariat@paro-spe.fr
```

### 8.3 Configurer DKIM (signature des emails)

DKIM signe cryptographiquement vos emails pour prouver qu'ils viennent bien de vous.

1. Dans OVH Manager > **Emails** > **paro-spe.fr**
2. Onglet **DKIM**
3. Cliquez sur **Activer DKIM**
4. Suivez les instructions (OVH ajoute automatiquement l'enregistrement DNS)

**⏱️ Activation : 5-15 minutes**

### 8.4 Tester la configuration

Testez vos enregistrements sur [mxtoolbox.com](https://mxtoolbox.com) :
- SPF Check
- DMARC Check
- DKIM Check

---

## 📍 Étape 9 : Configurer le formulaire de contact

### 9.1 Vérifier le formulaire dans le code

Le site utilise le formulaire de contact avec l'adresse `secretariat@paro-spe.fr`.

Je vais vérifier et mettre à jour le code pour m'assurer qu'il envoie bien vers cette adresse.

### 9.2 Option 1 : FormSubmit (recommandé)

**FormSubmit** est un service gratuit qui envoie les formulaires HTML vers une adresse email.

1. Allez sur [formsubmit.co](https://formsubmit.co/)
2. Entrez `secretariat@paro-spe.fr`
3. Cliquez sur **Send**
4. Vous recevrez un email de confirmation sur `secretariat@paro-spe.fr`
5. Cliquez sur le lien de confirmation dans l'email

✅ **L'adresse est activée !**

Le formulaire du site enverra maintenant les messages vers `secretariat@paro-spe.fr`.

### 9.3 Option 2 : Web3Forms (alternative)

Si vous préférez Web3Forms :

1. Allez sur [web3forms.com](https://web3forms.com/)
2. Créez un compte (gratuit)
3. Créez un formulaire
4. Obtenez votre **Access Key**
5. Je mettrai à jour le code avec cette clé

---

## ✅ Checklist de vérification

Après configuration :

- [ ] `secretariat@paro-spe.fr` est créée et active
- [ ] `dr-brochand@paro-spe.fr` est créée et active
- [ ] Vous pouvez vous connecter au webmail
- [ ] Vous pouvez envoyer un email de test
- [ ] Vous pouvez recevoir un email de test
- [ ] Les enregistrements SPF, DKIM, DMARC sont configurés
- [ ] Le formulaire de contact est configuré (FormSubmit ou Web3Forms)
- [ ] Les emails sont configurés sur vos appareils (optionnel)

---

## 🆘 Problèmes courants

### Je ne peux pas envoyer d'emails

**Causes possibles :**

1. **Port SMTP bloqué** → Essayez le port 587 au lieu de 465
2. **Authentification incorrecte** → Vérifiez le mot de passe
3. **SPF mal configuré** → Vérifiez sur mxtoolbox.com

### Je ne reçois pas d'emails

**Causes possibles :**

1. **MX mal configurés** → Vérifiez sur mxtoolbox.com
2. **DNS pas encore propagés** → Attendez 24h
3. **Boîte mail pleine** → Vérifiez le quota (5 Go)

**Solution :**

```bash
# Tester les MX
dig paro-spe.fr MX

# Tester le SPF
dig paro-spe.fr TXT
```

### Les emails partent en spam

**Causes possibles :**

1. **SPF manquant** → Configurez-le dans les DNS
2. **DKIM manquant** → Activez-le dans OVH Manager
3. **DMARC manquant** → Configurez-le dans les DNS
4. **Serveur OVH en liste noire** → Contactez le support OVH

**Solution :**

1. Vérifiez SPF, DKIM, DMARC sur [mail-tester.com](https://www.mail-tester.com/)
2. Envoyez un email à l'adresse fournie par mail-tester
3. Consultez le rapport et corrigez les problèmes

---

## 📊 Gestion quotidienne

### Accès rapide au webmail

🔗 **[webmail.ovh.com](https://www.webmail.ovh.com/)**

### Modifier un mot de passe

1. OVH Manager > **Emails** > **paro-spe.fr**
2. Cliquez sur **...** à côté de l'adresse
3. **Modifier le mot de passe**
4. Entrez le nouveau mot de passe
5. Validez

### Augmenter le quota d'une boîte

1. OVH Manager > **Emails** > **paro-spe.fr**
2. Cliquez sur **...** à côté de l'adresse
3. **Modifier le compte**
4. Changez la taille (max 5 Go sur forfait Perso)
5. Validez

### Créer une signature d'email

Dans le webmail RoundCube :

1. **Paramètres** (roue dentée)
2. **Identités**
3. Cliquez sur l'adresse email
4. Section **Signature** :
   ```
   --
   Secrétariat du Cabinet Paro-Spé
   📞 01 46 60 50 32
   📧 secretariat@paro-spe.fr
   🌐 https://paro-spe.fr
   📍 1 Avenue de la Division Leclerc, 92290 Châtenay-Malabry
   ```
5. Enregistrez

---

## 📚 Prochaines étapes

Une fois les emails créés :

1. ✅ Déployez le site → Voir **[QUICKSTART-OVH.md](./QUICKSTART-OVH.md)**
2. ✅ Testez le formulaire de contact
3. ✅ Configurez le monitoring → Voir **[GUIDE-MONITORING-OVH.md](./GUIDE-MONITORING-OVH.md)**

---

## 📖 Ressources

- [Documentation OVH Email](https://docs.ovh.com/fr/emails/)
- [Webmail OVH](https://www.webmail.ovh.com/)
- [MX Toolbox](https://mxtoolbox.com/)
- [Mail Tester](https://www.mail-tester.com/)
- [FormSubmit](https://formsubmit.co/)
- [Web3Forms](https://web3forms.com/)

---

**📧 Vos adresses email professionnelles sont prêtes !**

*Temps estimé : 15-20 minutes de configuration*
