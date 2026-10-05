# Documentation

Guides internes du site Paro-Spé. Le sommaire du projet (commandes npm, structure) est dans le [README](../README.md) à la racine.

## Déploiement

| Guide | Rôle |
|-------|------|
| [Démarrage Paro-Spé](deploiement/DEMARRAGE-PARO-SPE.md) | Parcours complet, étape par étape |
| [Quickstart OVH](deploiement/QUICKSTART-OVH.md) | Mise en ligne rapide |
| [Suite de déploiement](deploiement/SUITE-DEPLOIEMENT.md) | Ce qui reste après la première mise en ligne |
| [Déploiement](deploiement/DEPLOYMENT.md) | Procédure détaillée |
| [Checklist](deploiement/CHECKLIST-DEPLOIEMENT.md) | Points de vérification |
| [README OVH](deploiement/README-OVH.md) | Point d’entrée hébergement OVH |
| [Message de lancement](deploiement/MESSAGE-LANCEMENT-SITE.md) | Texte de communication au lancement |

Commande de déploiement, depuis la racine du dépôt : `./scripts/deploy-ovh.sh production`

## OVH (DNS, SSL, emails)

| Guide | Rôle |
|-------|------|
| [DNS](ovh/GUIDE-DNS-OVH.md) | Zones DNS des domaines |
| [SSL](ovh/GUIDE-SSL-OVH.md) | Certificat Let's Encrypt |
| [Emails](ovh/GUIDE-EMAILS-OVH.md) | Adresses @paro-spe.fr |

## Analytics et monitoring

| Guide | Rôle |
|-------|------|
| [Analytics sans cookies](analytics/GUIDE-ANALYTICS-SANS-COOKIES.md) | Google Analytics anonyme |
| [MCP Search Console / GA4](analytics/GUIDE-MCP-SEARCH-CONSOLE-GA4.md) | Connexion Cursor à GA4 et Search Console |
| [Rapport hebdomadaire](analytics/RAPPORT-ANALYTICS-HEBDOMADAIRE.md) | Workflow GitHub Actions |
| [UptimeRobot](monitoring/GUIDE-UPTIMEROBOT.md) | Surveillance de disponibilité |

Les rapports générés sont dans `rapports-analytics/` à la racine.

## SEO

| Document | Rôle |
|----------|------|
| [Diagnostic d’indexation implantologie](seo/DIAGNOSTIC-INDEXATION-IMPLANTOLOGIE.md) | Analyse d’indexation |
| [Analyse mots-clés v3](seo/analyse-seo-mots-cles-paro-spe-v3.html) | Comptage des mots-clés (dernière version) |
