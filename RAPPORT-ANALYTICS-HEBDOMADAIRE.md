# Rapport analytics hebdomadaire (GA4 / Search Console)

Ce dépôt contient un workflow GitHub Actions qui génère **automatiquement, chaque
lundi**, un rapport de métriques pour `paro-spe.fr` à partir de la Google Search
Console et de Google Analytics 4 (mêmes identifiants OAuth que le serveur MCP, voir
`GUIDE-MCP-SEARCH-CONSOLE-GA4.md`).

⚠️ **Ne pas confondre avec l'automatisation « SEO Weekly Audit »** (audit SEO
technique on-page + corrections, PR dédiées, commandes `.cursor/commands/seo-*.md`
avec confirmation humaine explicite avant tout merge/déploiement). Ce rapport-ci est
un outil **différent et complémentaire** : il agrège des métriques en **lecture
seule** (aucune correction, aucun contenu du site modifié) et ne merge ni ne déploie
jamais rien.

## Ce que fait l'automatisation

Chaque semaine (et à la demande via « Run workflow ») :

1. Récupère les données Search Console (clics, impressions, CTR, position moyenne,
   top requêtes, top pages, état des sitemaps) et GA4 (sessions, utilisateurs,
   pages vues, taux d'engagement, top pages) sur les 7 derniers jours, comparées à
   la semaine précédente.
2. Génère un rapport Markdown, committé dans le dossier
   [`rapports-analytics/`](rapports-analytics/) (un fichier par semaine, nommé par
   date de fin de période).
3. Ouvre une **issue GitHub** (label `analytics-report`) avec le résumé complet —
   vous recevrez une notification (email / app GitHub mobile) sans avoir à aller
   chercher le rapport.
4. Signale automatiquement les anomalies (baisse de clics/impressions ≥ 20 %,
   erreurs de sitemap, sitemap manquant) en haut du rapport.

Fichiers concernés : `.github/workflows/analytics-weekly-report.yml`,
`scripts/analytics-weekly-report.mjs`.

## Mise en route (une seule fois)

### 1. Ajouter les secrets GitHub Actions

Les mêmes 3 valeurs OAuth déjà utilisées pour le serveur MCP (voir
`GUIDE-MCP-SEARCH-CONSOLE-GA4.md`) doivent être ajoutées comme **secrets GitHub**
(différents des secrets Cursor — GitHub Actions ne peut pas lire les secrets Cursor).

Depuis votre mobile, ouvrez ce lien puis ajoutez chaque secret un par un (bouton
« New repository secret ») :

👉 <https://github.com/StevenMillot/DentalCare/settings/secrets/actions/new>

| Nom du secret | Valeur |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | le Client ID obtenu via OAuth Playground |
| `GOOGLE_OAUTH_CLIENT_SECRET` | le Client Secret correspondant |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | le refresh token obtenu via OAuth Playground |

Ce sont exactement les mêmes valeurs que celles fournies pour les secrets Cursor.

### 2. Vérifier que le workflow est bien actif

Une fois cette pull request mergée sur `main`, le workflow apparaît dans l'onglet
**Actions** du dépôt :

👉 <https://github.com/StevenMillot/DentalCare/actions/workflows/analytics-weekly-report.yml>

### 3. Tester une fois manuellement

Sur cette page, appuyez sur **« Run workflow »** (bouton en haut à droite du tableau)
puis confirmez. Le rapport de test sera committé dans `rapports-analytics/` et une
issue sera créée dans l'onglet **Issues** du dépôt en 1 à 2 minutes.

Après ce premier test réussi, le rapport se relancera automatiquement chaque lundi
matin, sans aucune action de votre part.

## Où consulter les rapports

- **Notification immédiate** : nouvelle issue GitHub, label `analytics-report`.
- **Historique complet** : dossier [`rapports-analytics/`](rapports-analytics/) du
  dépôt (un fichier Markdown par semaine).

## Tester localement (optionnel, pour un développeur)

```bash
npm run mcp:setup-google-auth   # si besoin, régénère .cursor/secrets/ga4-gsc-service-account.json
GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... GOOGLE_OAUTH_REFRESH_TOKEN=... \
  npm run analytics:report:dry-run
```

`--dry-run` affiche le rapport dans le terminal sans rien committer ni créer d'issue.
