# 🔌 Guide MCP Search Console / GA4 - Paro-Spé

Guide pour configurer, dans Cursor, un serveur MCP (Model Context Protocol) qui donne à l'IA
un accès en lecture aux données **Google Analytics 4** et **Google Search Console** du site
`paro-spe.fr`. Une fois configuré, vous pouvez demander directement dans le chat des choses
comme *« Quelles sont les 10 pages les plus vues sur les 28 derniers jours ? »* ou
*« Quelles requêtes Search Console génèrent le plus de clics vers la page implantologie ? »*.

---

## 🎯 Objectif

- ✅ Connecter Cursor aux API **GA4 Data** et **Search Console**
- ✅ Interroger les statistiques du site directement depuis le chat de l'agent
- ✅ Accès **lecture uniquement** par défaut (aucune modification de propriété, aucun envoi de sitemap)
- ✅ Identifiants stockés localement, jamais commit dans le dépôt

Le serveur MCP utilisé est [`ga4-mcp`](https://github.com/chimpmatic/ga4-mcp) (npm), qui expose en un
seul serveur les outils GA4 (rapports, temps réel, dimensions personnalisées) et Search Console
(analytics de recherche, sitemaps, inspection d'URL).

Deux méthodes d'authentification sont possibles :

- **Option A (recommandée, 100% mobile)** : vous vous connectez avec **votre propre compte
  Gmail**, celui qui a déjà accès à GA4 et à Search Console. Aucun compte de service, aucun
  fichier à télécharger, aucun ordinateur nécessaire. C'est la méthode décrite ci-dessous.
- **Option B (compte de service)** : plus adaptée si vous préférez un accès dédié séparé de votre
  compte personnel, ou une automatisation serveur. Voir la section [Option B](#option-b--compte-de-service-alternative)
  en bas de ce guide — nécessite de télécharger un fichier JSON, plus simple depuis un ordinateur.

---

## 📱 Option A : connexion avec votre compte Google personnel (OAuth, 100% mobile)

Cette méthode utilise le format d'identifiants "OAuth utilisateur" (le même que celui produit par
`gcloud auth login`), sans jamais avoir besoin de créer ni télécharger de clé de compte de service.
Tout se fait dans le navigateur de votre téléphone.

### A.1 Créer un projet Google Cloud

1. Ouvrez [console.cloud.google.com/projectcreate](https://console.cloud.google.com/projectcreate)
2. Connectez-vous avec le compte Gmail qui a accès à GA4 et Search Console
3. **Nom du projet** : `mcp-analytics` (ou ce que vous voulez)
4. Appuyez sur **Créer**, puis attendez quelques secondes que le projet soit sélectionné

### A.2 Activer les 2 API nécessaires

Ouvrez ces deux liens (le projet créé à l'étape précédente doit être sélectionné en haut de page) et
appuyez sur **Activer/Enable** sur chacun :

1. [console.cloud.google.com/apis/library/analyticsdata.googleapis.com](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com)
2. [console.cloud.google.com/apis/library/searchconsole.googleapis.com](https://console.cloud.google.com/apis/library/searchconsole.googleapis.com)

### A.3 Configurer l'écran de consentement OAuth (« Google Auth Platform »)

⚠️ Depuis 2024, Google a renommé et éclaté cette page en 3 onglets : **Branding**, **Audience**,
**Clients** (l'ancien menu « OAuth consent screen » / « Écran de consentement OAuth » a disparu).
Si vous suivez un tutoriel plus ancien qui parle d'une page unique, c'est normal que vous ne la
trouviez pas — utilisez les liens ci-dessous.

1. Ouvrez [console.cloud.google.com/auth/overview](https://console.cloud.google.com/auth/overview)
   (le bon projet doit être sélectionné en haut). Si c'est la première fois, appuyez sur
   **Commencer/Get started** et suivez l'assistant :
   - **Type d'utilisateurs (Audience/User type)** : **Externe (External)**
   - **Nom de l'application** : `Paro-spe Analytics` ou `MCP Analytics` (libre)
   - **E-mail d'assistance utilisateur** et **Coordonnées du développeur** : votre Gmail
   - Terminez l'assistant (**Créer/Save and continue** puis **Créer/Create**)
2. Avant de pouvoir publier, l'onglet **Branding**
   ([console.cloud.google.com/auth/branding](https://console.cloud.google.com/auth/branding)) peut
   demander des informations de domaine (« App Domain »). Le site `paro-spe.fr` a déjà ce qu'il
   faut, pas besoin de créer de nouvelles pages :
   - **Page d'accueil de l'application** : `https://paro-spe.fr/`
   - **Lien vers la politique de confidentialité** : `https://paro-spe.fr/politique-de-confidentialite.html`
   - **Conditions d'utilisation** (facultatif) : `https://paro-spe.fr/mentions-legales.html`
   - **Domaines autorisés (Authorized domains)** : `paro-spe.fr`
   - **Enregistrer/Save**
3. Une fois configuré, allez dans l'onglet **Audience** :
   [console.cloud.google.com/auth/audience](https://console.cloud.google.com/auth/audience)
4. Dans la section **Statut de publication (Publishing status)**, appuyez sur **Publier
   l'application (Publish app)** puis confirmez. *(Cette étape évite que le jeton n'expire après 7
   jours et évite de devoir gérer une liste de testeurs. Vous verrez quand même un avertissement
   « Google n'a pas vérifié cette appli » lors de la connexion à l'étape A.5 — c'est normal pour un
   usage personnel : cliquez sur « Advanced/Paramètres avancés » puis « Go to ... (unsafe)/Accéder
   à ... (non sécurisé) » pour continuer.)*
5. Si vous ne trouvez pas ce bouton, utilisez plutôt la section **Utilisateurs test (Test users)**
   juste au-dessus : **+ Ajouter des utilisateurs (Add users)**, ajoutez votre propre Gmail,
   **Enregistrer** — cela débloque l'accès immédiatement, mais le jeton généré à l'étape A.5
   expirera après 7 jours tant que l'app n'est pas publiée.

### A.4 Créer un identifiant OAuth (Client ID)

1. Ouvrez l'onglet **Clients** : [console.cloud.google.com/auth/clients](https://console.cloud.google.com/auth/clients)
2. **+ Créer un client OAuth (Create client)**
3. **Type d'application** : **Application Web (Web application)**
4. **Nom** : `mcp-oauth-playground`
5. **URI de redirection autorisés (Authorized redirect URIs)** : ajoutez exactement :

   ```
   https://developers.google.com/oauthplayground
   ```

6. **Créer**. Une fenêtre affiche votre **Client ID** et **Client Secret** — copiez-les (vous
   pouvez aussi les retrouver plus tard en rouvrant ce client depuis l'onglet **Clients**)

### A.5 Générer le refresh token avec OAuth Playground

1. Ouvrez [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground/)
2. Appuyez sur l'icône ⚙️ (Settings) en haut à droite
3. Cochez **Use your own OAuth credentials**
4. Collez votre **OAuth Client ID** et **OAuth Client secret** (étape A.4), fermez le panneau
5. Dans la colonne de gauche (**Step 1**), champ **Input your own scopes**, collez :

   ```
   https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/webmasters.readonly
   ```

6. Appuyez sur **Authorize APIs**
7. Connectez-vous avec le Gmail qui a accès à GA4/Search Console, acceptez l'avertissement
   « application non vérifiée » (Advanced > Go to... (unsafe) > Continue), puis **Autoriser**
8. Vous revenez sur OAuth Playground avec un code déjà rempli à l'**Step 2** : appuyez sur
   **Exchange authorization code for tokens**
9. Copiez la valeur affichée dans **Refresh token** (commence souvent par `1//...`)

Vous avez maintenant 3 valeurs : **Client ID**, **Client Secret**, **Refresh token**.

### A.6 Récupérer l'ID de propriété GA4 et le site Search Console

1. GA4 : [analytics.google.com](https://analytics.google.com/) > icône ⚙️ **Admin** > **Détails de
   la propriété** > notez l'**ID de propriété** (nombre, pas le `G-XXXXXXXXXX`)
2. Search Console : [search.google.com/search-console](https://search.google.com/search-console)
   > notez l'URL exacte de la propriété (ex. `https://paro-spe.fr/` ou `sc-domain:paro-spe.fr`)

### A.7 Générer le fichier de credentials local

Avec les 3 valeurs de l'étape A.5, exécutez (sur l'ordinateur/serveur qui fera tourner le serveur
MCP, ou transmettez-les à l'agent pour qu'il le fasse pour vous) :

```bash
GOOGLE_OAUTH_CLIENT_ID="...apps.googleusercontent.com" \
GOOGLE_OAUTH_CLIENT_SECRET="..." \
GOOGLE_OAUTH_REFRESH_TOKEN="1//..." \
npm run mcp:setup-google-auth
```

Cela écrit `.cursor/secrets/ga4-gsc-service-account.json` (déjà exclu de git) au format attendu
par `ga4-mcp` — aucune autre modification n'est nécessaire, `.cursor/mcp.json` pointe déjà vers ce
fichier.

> 💾 **Pour persister ces identifiants entre plusieurs sessions Cursor Cloud Agent** sans les
> retaper : enregistrez les 3 valeurs comme secrets dans **Cursor Dashboard > Cloud Agents >
> Secrets** sous les noms `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
> `GOOGLE_OAUTH_REFRESH_TOKEN`. Elles seront réinjectées automatiquement dans chaque nouvelle
> session ; relancez alors `npm run mcp:setup-google-auth` une fois par session pour régénérer le
> fichier local.

Passez ensuite directement à la section **« Tester la connexion »** en bas de ce guide (l'Étape 4
« Configuration du serveur MCP », plus bas, ne concerne que l'Option B — avec l'Option A la
configuration `.cursor/mcp.json` existante fonctionne sans modification, il suffit d'y ajouter
votre `GA4_PROPERTY_ID`).

---

## Option B : compte de service (alternative)

Cette méthode nécessite de créer un compte de service Google Cloud, de télécharger une clé JSON et
de la transférer sur la machine qui exécute Cursor — plus simple à faire depuis un ordinateur.

### Étape 1 : Créer un projet Google Cloud et un compte de service

### 1.1 Créer/choisir un projet

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Créez un nouveau projet (ex. `paro-spe-mcp`) ou choisissez un projet existant

### 1.2 Activer les API nécessaires

Dans **API et services > Bibliothèque**, activez :

1. **Google Analytics Data API**
2. **Google Analytics Admin API** (optionnel, utile pour `get_account_summaries`)
3. **Google Search Console API**

### 1.3 Créer un compte de service

1. **API et services > Identifiants > Créer des identifiants > Compte de service**
2. **Nom** : `mcp-ga4-search-console`
3. Cliquez sur **Créer et continuer**, puis **OK** (pas besoin de rôle IAM projet)
4. Ouvrez le compte de service créé, onglet **Clés > Ajouter une clé > Créer une clé JSON**
5. Téléchargez le fichier JSON — **gardez-le confidentiel**

📝 **Notez l'adresse email du compte de service** (ex. `mcp-ga4-search-console@paro-spe-mcp.iam.gserviceaccount.com`)

---

## 📍 Étape 2 : Donner accès au compte de service

### 2.1 Accès Google Analytics 4

1. Dans [analytics.google.com](https://analytics.google.com/), ouvrez la propriété du site
2. **Admin > Accès aux propriétés (colonne Propriété)**
3. **+ > Ajouter des utilisateurs**
4. Collez l'email du compte de service
5. Rôle : **Lecteur** (suffisant pour les rapports)
6. **Ajouter**

### 2.2 Accès Google Search Console

1. Dans [search.google.com/search-console](https://search.google.com/search-console)
2. Sélectionnez la propriété `paro-spe.fr`
3. **Paramètres > Utilisateurs et autorisations > Ajouter un utilisateur**
4. Collez l'email du compte de service
5. Autorisation : **Complète** (ou **Restreinte** si vous ne voulez pas autoriser l'envoi de sitemaps)

### 2.3 Récupérer l'ID de propriété GA4

1. GA4 > **Admin > Détails de la propriété**
2. Notez l'**ID de propriété** (nombre, ex. `123456789`, pas le `G-XXXXXXXXXX`)

---

## 📍 Étape 3 : Installer la clé localement (jamais commit)

1. Placez le fichier JSON téléchargé à l'étape 1.3 ici, dans le dépôt local :

   ```
   .cursor/secrets/ga4-gsc-service-account.json
   ```

2. Ce chemin est déjà exclu par `.gitignore` (`.cursor/secrets/*`) — vérifiez avec :

   ```bash
   git status
   ```

   Le fichier ne doit **jamais** apparaître dans les fichiers suivis.

---

## 📍 Étape 4 : Configuration du serveur MCP dans Cursor (Option B)

La configuration est déjà présente dans `.cursor/mcp.json` (valable pour les deux options, A et B) :

```json
{
  "mcpServers": {
    "ga4-search-console": {
      "command": "npx",
      "args": ["-y", "ga4-mcp", "--tools", "ga4,gsc"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "${workspaceFolder}/.cursor/secrets/ga4-gsc-service-account.json",
        "GA4_PROPERTY_ID": ""
      }
    }
  }
}
```

1. Ouvrez ce fichier et complétez `GA4_PROPERTY_ID` avec l'ID noté à l'étape 2.3
2. Si votre client Cursor ne supporte pas la variable `${workspaceFolder}`, remplacez la valeur de
   `GOOGLE_APPLICATION_CREDENTIALS` par le **chemin absolu** vers le fichier JSON, par exemple :

   ```
   /workspace/.cursor/secrets/ga4-gsc-service-account.json
   ```

3. Dans Cursor : **Settings > MCP** (ou **Cursor Settings > Features > MCP Servers**), rechargez
   les serveurs MCP. `ga4-search-console` doit apparaître avec un statut actif et 13 outils
   disponibles (`ping` + 6 outils GA4 + 6 outils GSC).

> ℹ️ L'option `--tools ga4,gsc` limite volontairement le serveur aux outils de **lecture**
> (rapports GA4, analytics de recherche GSC). Les groupes `admin` (création/suppression de
> propriétés GA4) et `indexing` (notifications d'indexation) sont désactivés par défaut. Pour les
> activer, changez `--tools` en `--tools all` — à faire uniquement si nécessaire.

---

## 📍 Tester la connexion (Option A ou B)

Dans le chat Cursor, essayez par exemple :

- « Utilise l'outil `ping` du serveur `ga4-search-console` pour vérifier la connexion. »
- « Liste les sites disponibles dans Search Console (`gsc_list_sites`). »
- « Donne-moi les pages les plus vues sur `paro-spe.fr` sur les 28 derniers jours (`run_report`). »
- « Quelles sont les requêtes Search Console avec le plus de clics ce mois-ci
  (`gsc_search_analytics`) ? »

Si l'agent renvoie une erreur d'authentification :

- Vérifiez que le fichier `.cursor/secrets/ga4-gsc-service-account.json` existe bien
- **Option A** : vérifiez que les 3 valeurs (Client ID / Secret / Refresh token) sont correctes et
  que les scopes autorisés à l'étape A.5 incluent bien `analytics.readonly` et
  `webmasters.readonly`
- **Option B** : vérifiez que le compte de service a bien un accès **Lecteur** sur la propriété
  GA4 et sur la propriété Search Console (Étape 2)
- Dans les deux cas, vérifiez que les API **Analytics Data** et **Search Console** sont bien
  activées sur le projet Google Cloud utilisé

---

## 🔐 Rappel sécurité

- ❌ Ne commitez jamais le fichier `ga4-gsc-service-account.json`, ni le Client Secret / Refresh
  token en clair dans un fichier suivi par git
- ❌ Ne partagez pas ces valeurs par email ou messagerie non chiffrée
- ✅ **Option A** : en cas de doute sur une fuite, révoquez l'accès dans
  [myaccount.google.com/permissions](https://myaccount.google.com/permissions) (section « Accès
  tiers ») en supprimant l'accès de l'application `MCP Analytics`, puis recommencez l'étape A.5
  pour générer un nouveau refresh token
- ✅ **Option B** : en cas de doute sur une fuite, révoquez la clé dans Google Cloud Console
  (**Identifiants > Compte de service > Clés > Supprimer**) et générez-en une nouvelle
- ✅ Limitez les scopes/rôles au strict nécessaire en lecture, sauf besoin explicite d'écriture
