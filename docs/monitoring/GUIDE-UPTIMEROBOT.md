# 📡 Guide UptimeRobot - Monitoring du Site - Paro-Spé

Guide pour configurer le monitoring de disponibilité du site avec UptimeRobot (gratuit).

---

## 🎯 Objectif

Mettre en place un système de surveillance qui vous **alerte par email** si le site tombe en panne.

**UptimeRobot :**
- ✅ 100% gratuit (jusqu'à 50 monitors)
- ✅ Vérification toutes les 5 minutes
- ✅ Alertes par email instantanées
- ✅ Historique de disponibilité (uptime)
- ✅ Pas de cookies côté utilisateur (monitoring serveur)
- ✅ Aucune installation nécessaire

---

## 📍 Étape 1 : Créer un compte UptimeRobot

### 1.1 S'inscrire

1. Allez sur [uptimerobot.com](https://uptimerobot.com/)
2. Cliquez sur **Free Sign Up** (Inscription gratuite)
3. Remplissez :
   - **Email** : `dr-brochand@paro-spe.fr` (ou votre email perso)
   - **Mot de passe** : Choisissez un mot de passe sécurisé
4. Cochez **I'm not a robot**
5. Cliquez sur **Sign Up**

### 1.2 Confirmer l'email

1. Vous recevez un email de confirmation
2. Cliquez sur le lien de confirmation
3. Vous êtes redirigé vers le dashboard UptimeRobot

---

## 📍 Étape 2 : Créer un monitor pour paro-spe.fr

### 2.1 Ajouter un nouveau monitor

1. Dans le dashboard, cliquez sur **+ Add New Monitor**
2. **Monitor Type** : Choisissez **HTTP(s)**
3. **Friendly Name** : `Paro-Spé - Site Principal`
4. **URL (or IP)** : `https://paro-spe.fr`
5. **Monitoring Interval** : `5 minutes` (gratuit)
6. Laissez les autres options par défaut
7. Cliquez sur **Create Monitor**

✅ **Le site est maintenant surveillé toutes les 5 minutes !**

### 2.2 Ajouter un monitor pour www

Même procédure :

1. **+ Add New Monitor**
2. **HTTP(s)**
3. **Friendly Name** : `Paro-Spé - www`
4. **URL** : `https://www.paro-spe.fr`
5. **Monitoring Interval** : `5 minutes`
6. **Create Monitor**

### 2.3 Ajouter un monitor pour le health check

Si vous voulez surveiller l'état interne du serveur :

1. **+ Add New Monitor**
2. **HTTP(s)**
3. **Friendly Name** : `Paro-Spé - Health Check`
4. **URL** : `https://paro-spe.fr/health-check.php`
5. **Monitoring Interval** : `5 minutes`
6. **Advanced Settings** :
   - **Search term** (optionnel) : `"status":"ok"`
   - Cela vérifie que le health check retourne bien un statut OK
7. **Create Monitor**

---

## 📍 Étape 3 : Configurer les alertes par email

### 3.1 Vérifier les contacts par défaut

UptimeRobot crée automatiquement un contact avec votre email d'inscription.

1. Allez dans **My Settings** (icône utilisateur en haut à droite)
2. Onglet **Alert Contacts**
3. Vérifiez que votre email est listé

### 3.2 Ajouter d'autres emails (optionnel)

Pour recevoir les alertes sur plusieurs adresses :

1. **My Settings** > **Alert Contacts**
2. Cliquez sur **Add Alert Contact**
3. **Alert Contact Type** : **E-mail**
4. **Friendly Name** : `Secrétariat`
5. **E-mail to Alert** : `secretariat@paro-spe.fr`
6. Cliquez sur **Create Alert Contact**
7. Un email de confirmation est envoyé à cette adresse
8. Cliquez sur le lien de confirmation dans l'email

Répétez si vous voulez ajouter d'autres contacts.

### 3.3 Configurer les notifications

1. Cliquez sur un monitor (ex: `Paro-Spé - Site Principal`)
2. Cliquez sur **Edit**
3. Section **Alert Contacts to Notify**
4. Cochez les contacts qui doivent recevoir les alertes
5. **Alert When** :
   - ✅ **Down** (quand le site tombe)
   - ✅ **Up** (quand le site revient)
6. Cliquez sur **Save Changes**

---

## 📍 Étape 4 : Configurer les SMS (optionnel, payant)

UptimeRobot propose des alertes SMS, mais c'est payant (~$4/mois pour 10 SMS).

**Alternative gratuite :** Configurez une notification par **webhook Discord** ou **Slack** (gratuit).

---

## 📍 Étape 5 : Créer une page de statut publique (optionnel)

### 5.1 Activer la page de statut

1. Dans **My Settings** > **Public Status Pages**
2. Cliquez sur **Add Public Status Page**
3. **Friendly Name** : `Statut Paro-Spé`
4. **Monitors to Display** : Sélectionnez tous vos monitors
5. **Custom Domain** (optionnel) : Vous pouvez utiliser `status.paro-spe.fr`
6. **Custom Logo URL** (optionnel) : URL de votre logo
7. Cliquez sur **Create Public Status Page**

Vous obtenez une URL publique : `https://stats.uptimerobot.com/xxxxx`

**Cette page affiche en temps réel l'état de votre site.**

Vous pouvez la partager ou la mettre en lien sur votre site si vous voulez.

---

## 📍 Étape 6 : Intégrer le badge de statut (optionnel)

### 6.1 Ajouter un badge sur le site

UptimeRobot fournit un badge que vous pouvez afficher sur votre site :

1. Allez sur votre **Public Status Page**
2. Cliquez sur **Get Badge**
3. Copiez le code HTML fourni
4. Ajoutez-le dans le footer de votre site

Exemple :
```html
<a href="https://stats.uptimerobot.com/xxxxx" target="_blank">
  <img src="https://img.shields.io/uptimerobot/ratio/m123456789-xxxxx" alt="Uptime">
</a>
```

**Ce badge affiche le % d'uptime du site en temps réel.**

---

## 📍 Étape 7 : Configurer les notifications avancées

### 7.1 Webhooks Discord (optionnel)

Si vous utilisez Discord :

1. Créez un serveur Discord (ou utilisez un existant)
2. Créez un canal (ex: `#alertes-paro-spe`)
3. Paramètres du canal > **Intégrations** > **Webhooks** > **Nouveau Webhook**
4. **Nom** : `UptimeRobot`
5. Copiez l'**URL du webhook**
6. Dans UptimeRobot > **My Settings** > **Alert Contacts**
7. **Add Alert Contact** > **Webhook**
8. **URL to Notify** : Collez l'URL Discord + `/slack` à la fin
   - Exemple : `https://discord.com/api/webhooks/123456/abcdef/slack`
9. Cliquez sur **Create Alert Contact**

### 7.2 Webhooks Slack (optionnel)

Si vous utilisez Slack :

1. Créez un workspace Slack (ou utilisez un existant)
2. Créez une app : [api.slack.com/apps](https://api.slack.com/apps)
3. Activez **Incoming Webhooks**
4. Créez un webhook pour un canal
5. Copiez l'URL du webhook
6. Dans UptimeRobot > **Add Alert Contact** > **Webhook**
7. Collez l'URL du webhook Slack
8. **Create Alert Contact**

---

## 📍 Étape 8 : Tester les alertes

### 8.1 Tester une alerte Down

**⚠️ Attention : Cette manipulation rendra votre site inaccessible pendant quelques minutes**

Option 1 : Modifier temporairement le .htaccess pour bloquer l'accès

1. Dans le .htaccess, ajoutez au début :
   ```apache
   # TEST UPTIMEROBOT - À SUPPRIMER APRÈS TEST
   Require all denied
   ```
2. Uploadez le fichier sur le serveur
3. Attendez 5-10 minutes
4. Vous devriez recevoir un email : **"paro-spe.fr is DOWN"**
5. Supprimez la ligne de test du .htaccess
6. Re-uploadez
7. Vous recevez un email : **"paro-spe.fr is UP"**

Option 2 : Test sans casser le site (recommandé)

1. Éditez un monitor dans UptimeRobot
2. Changez temporairement l'URL vers une URL inexistante : `https://paro-spe.fr/test-404-uptimerobot`
3. Sauvegardez
4. Attendez 5 minutes
5. Vous recevez un email d'alerte
6. Remettez l'URL correcte
7. Sauvegardez

---

## ✅ Ce que UptimeRobot surveille

### Vérifications automatiques

Toutes les 5 minutes, UptimeRobot :
1. ✅ Accède à votre site
2. ✅ Vérifie que le serveur répond (code HTTP 200)
3. ✅ Mesure le temps de réponse
4. ✅ Vérifie que la page contient du contenu (pas vide)
5. ✅ (Optionnel) Vérifie qu'un mot-clé spécifique est présent

### Alertes envoyées

Vous recevez un email **immédiatement** si :
- ❌ Le site ne répond pas (timeout)
- ❌ Le serveur retourne une erreur (404, 500, etc.)
- ❌ Le temps de réponse est trop long (> 30s)
- ✅ Le site revient en ligne après une panne

---

## 📊 Statistiques et rapports

### 8.1 Dashboard UptimeRobot

Dans le dashboard, vous voyez :
- **Uptime** : Pourcentage de disponibilité (ex: 99.9%)
- **Response Time** : Temps de réponse moyen
- **Dernières pannes** : Historique des incidents
- **Graphiques** : Disponibilité sur 7j, 30j, 90j

### 8.2 Rapports automatiques (optionnel)

1. **My Settings** > **Notification Settings**
2. Activez **Daily** ou **Weekly Reports**
3. Vous recevrez un rapport par email avec :
   - Uptime global
   - Temps de réponse moyen
   - Liste des incidents

---

## 🆘 Que faire en cas de panne ?

### Si vous recevez une alerte "Site DOWN"

1. **Vérifiez vous-même** : Ouvrez `https://paro-spe.fr` dans votre navigateur
   - Si le site s'affiche : Fausse alerte (possible si le serveur était temporairement lent)
   - Si le site ne s'affiche pas : Vraie panne

2. **Vérifiez le type de panne** :
   - **Erreur 404** : Un fichier est manquant (vérifiez le .htaccess)
   - **Erreur 500** : Erreur serveur (vérifiez les logs PHP sur OVH Manager)
   - **Timeout** : Serveur trop lent ou inaccessible (contactez OVH)
   - **DNS** : Le domaine ne pointe plus vers le serveur (vérifiez les DNS)

3. **Contactez le support OVH** si nécessaire :
   - Espace client OVH > **Support** > **Créer un ticket**
   - Par téléphone (numéro dans votre espace client)

4. **Informez vos patients** (si la panne dure) :
   - Réseaux sociaux (Facebook, Instagram)
   - Email aux patients avec RDV proche

---

## 📈 Objectifs d'uptime

### Standards de l'industrie

| Uptime | Downtime par an | Qualité |
|--------|-----------------|---------|
| 99.9% | ~8h45 | ✅ Bon |
| 99.95% | ~4h22 | ✅ Très bon |
| 99.99% | ~52 minutes | ✅✅ Excellent |
| 99.999% | ~5 minutes | 💎 Exceptionnel (cher) |

**Avec OVH forfait Perso, visez 99.9% minimum (normal pour un site vitrine).**

---

## 💰 Version gratuite vs payante

### UptimeRobot Gratuit (Free)

- ✅ 50 monitors
- ✅ Vérification toutes les 5 minutes
- ✅ Historique de 30 jours
- ✅ Alertes email illimitées
- ✅ 1 page de statut publique

**Largement suffisant pour un site comme Paro-Spé !**

### UptimeRobot Pro ($7/mois)

- Vérification toutes les 1 minute
- Historique illimité
- Alertes SMS
- Multi-utilisateurs
- Support prioritaire

**Pas nécessaire pour votre cas.**

---

## ✅ Checklist UptimeRobot

- [ ] Compte UptimeRobot créé
- [ ] Monitor `paro-spe.fr` ajouté (vérification 5 min)
- [ ] Monitor `www.paro-spe.fr` ajouté (optionnel)
- [ ] Monitor `health-check.php` ajouté (optionnel)
- [ ] Email d'alerte configuré (dr-brochand@paro-spe.fr)
- [ ] Email supplémentaire ajouté (secretariat@paro-spe.fr)
- [ ] Test d'alerte effectué
- [ ] Page de statut publique créée (optionnel)
- [ ] Badge de statut ajouté au site (optionnel)

---

## 🔗 Ressources

- [UptimeRobot](https://uptimerobot.com/)
- [Documentation UptimeRobot](https://uptimerobot.com/help/)
- [API UptimeRobot](https://uptimerobot.com/api/) (pour intégrations avancées)

---

## 📝 Alternative : Pingdom (optionnel)

Si vous voulez une alternative à UptimeRobot :

**Pingdom** (par SolarWinds)
- ✅ Gratuit pendant 30 jours
- ❌ Payant ensuite (~$10/mois)
- ✅ Interface plus avancée
- ✅ Monitoring depuis plusieurs localisations

Site : [pingdom.com](https://www.pingdom.com/)

**Pour Paro-Spé, UptimeRobot gratuit est amplement suffisant.**

---

**📡 Votre site est maintenant surveillé 24/7 !**

*Temps estimé : 10-15 minutes*

Vous serez alerté immédiatement en cas de panne et pourrez réagir rapidement.

---

## 🔄 Prochaines étapes

1. ✅ Attendez quelques jours pour voir l'uptime se stabiliser
2. ✅ Si l'uptime est < 99%, identifiez les causes (logs OVH)
3. ✅ Consultez le dashboard régulièrement (1x/semaine)
4. ✅ Réagissez rapidement aux alertes

**Félicitations ! Votre infrastructure de monitoring est complète. 🎉**
