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

---

## 📍 Étape 1 : Créer un projet Google Cloud et un compte de service

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

## 📍 Étape 4 : Configuration du serveur MCP dans Cursor

La configuration est déjà présente dans `.cursor/mcp.json` :

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

## 📍 Étape 5 : Tester la connexion

Dans le chat Cursor, essayez par exemple :

- « Utilise l'outil `ping` du serveur `ga4-search-console` pour vérifier la connexion. »
- « Liste les sites disponibles dans Search Console (`gsc_list_sites`). »
- « Donne-moi les pages les plus vues sur `paro-spe.fr` sur les 28 derniers jours (`run_report`). »
- « Quelles sont les requêtes Search Console avec le plus de clics ce mois-ci
  (`gsc_search_analytics`) ? »

Si l'agent renvoie une erreur d'authentification :

- Vérifiez que le fichier JSON existe bien au chemin configuré
- Vérifiez que le compte de service a bien un accès **Lecteur** sur la propriété GA4 et sur la
  propriété Search Console (Étape 2)
- Vérifiez que les API **Analytics Data** et **Search Console** sont bien activées sur le projet
  Google Cloud (Étape 1.2)

---

## 🔐 Rappel sécurité

- ❌ Ne commitez jamais le fichier `ga4-gsc-service-account.json`
- ❌ Ne partagez pas ce fichier par email ou messagerie non chiffrée
- ✅ En cas de doute sur une fuite, révoquez la clé dans Google Cloud Console
  (**Identifiants > Compte de service > Clés > Supprimer**) et générez-en une nouvelle
- ✅ Gardez le compte de service en accès **Lecteur uniquement**, sauf besoin explicite d'écriture
