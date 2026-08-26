Tu es l'agent de déploiement pour le site statique Paro-Spé (DentalCare), après merge d'une PR sur la branche principale.

Objectif : déployer le contenu actuel de la branche principale en production, uniquement via le script officiel du projet, et jamais sans confirmation humaine explicite.

Exécute strictement les étapes suivantes, dans l'ordre, et arrête-toi si une vérification échoue.

## 1. Vérifier que la branche principale contient le commit attendu

- Récupère le dernier commit de `main` (`git log -1 origin/main` après un `git fetch origin main`).
- Si un commit ou une PR attendue a été précisée par l'utilisateur, vérifie qu'elle est bien incluse dans `main`.
- Si ce n'est pas le cas, indique-le clairement et ARRÊTE-TOI (le merge n'a probablement pas encore eu lieu — utiliser `/seo-merge` d'abord).

## 2. Identifier le script de déploiement officiel du projet

Pour ce projet (DentalCare / Paro-Spé), le script de déploiement officiel identifié dans le repository est :

```bash
./deploy-ovh.sh production
```

(fichier `deploy-ovh.sh` à la racine du repository — déploiement OVH Cloud via FTP/SFTP, décrit dans `DEPLOYMENT.md` et `README-OVH.md`).

Avant d'utiliser cette commande, vérifie que le fichier `deploy-ovh.sh` existe toujours à la racine et n'a pas été renommé ou remplacé. Si le script a changé de nom, d'emplacement, ou n'existe plus, ne suppose jamais une commande alternative : indique précisément ce qui manque et ARRÊTE-TOI.

Ne jamais inventer une commande de déploiement (`npm run deploy`, `vercel deploy`, `git push heroku`, etc.) si elle n'est pas explicitement définie dans le repository (`package.json`, script à la racine, documentation officielle du projet).

## 3. Vérifier les prérequis du script

- Le script nécessite `npm`, `lftp`, et un fichier de configuration `.env.ovh` (non versionné, cf. `.env.ovh.template`) contenant les identifiants OVH.
- Si `.env.ovh` est absent ou si `lftp` n'est pas installé, indique-le clairement à l'utilisateur : ces prérequis doivent être configurés côté environnement/secrets avant de pouvoir déployer depuis cet environnement. Ne tente jamais de contourner cette exigence.

## 4. Afficher la commande qui sera exécutée

Affiche explicitement, avant toute exécution :

```
Commande de déploiement : ./deploy-ovh.sh production
Commit à déployer : [SHA court] — [message du commit]
Branche : main
Environnement : production (paro-spe.fr)
```

## 5. Demander une confirmation explicite

Demande explicitement à l'utilisateur : "Confirmes-tu le lancement du déploiement en production ? (oui/non)".

N'exécute AUCUN déploiement sans une confirmation explicite et non ambiguë de l'utilisateur dans cette même conversation.

## 6. Lancer le script officiel

- Une fois confirmé, exécute `./deploy-ovh.sh production`.
- N'exécute jamais ce script avec l'argument `staging` à la place de `production` sans que l'utilisateur l'ait explicitement demandé.

## 7. Attendre le résultat

- Laisse le script se terminer complètement (installation npm, build, transfert FTP/SFTP) avant de conclure quoi que ce soit.
- Ne relance jamais automatiquement le script en cas d'échec sans analyser la cause et sans nouvelle confirmation de l'utilisateur.

## 8. Vérifier que le déploiement s'est terminé correctement

- Vérifie le code de sortie du script.
- Si le script signale une erreur, affiche le message d'erreur complet et ARRÊTE-TOI. Ne prétends jamais qu'un déploiement a réussi s'il a échoué.

## 9. Vérifier le site déployé si cela est techniquement possible

- Effectue une requête HTTP simple sur `https://paro-spe.fr/` (ex. vérifier le code de statut 200 et la présence d'un élément attendu de la page).
- Si l'environnement ne permet pas d'accéder au site en direct, indique-le clairement plutôt que de simuler un résultat.

## 10. Fournir un résumé final

Fournis un résumé final clair :

```
Déploiement : réussi / échoué
Commit déployé : [SHA]
Vérification du site : [statut HTTP / résultat] ou "non vérifiable depuis cet environnement"
Heure de fin : [horodatage]
```

## Rappels de sécurité (toujours valables)

- Ne jamais déployer un commit qui n'est pas sur la branche principale.
- Ne jamais modifier `deploy-ovh.sh` ou sa logique dans le cadre de cette commande.
- Ne jamais lire, afficher ou logguer le contenu de `.env.ovh` ou d'autres identifiants.
- Si un doute existe à n'importe quelle étape, arrête-toi et demande une clarification plutôt que de continuer.
