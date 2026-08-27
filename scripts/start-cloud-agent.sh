#!/usr/bin/env bash
# Initialisation "start" du Cloud Agent : régénère les fichiers de credentials
# (MCP GA4/Search Console, config FTP OVH) à partir des secrets Cursor (s'ils
# sont configurés), sans jamais faire échouer le démarrage de l'environnement
# si l'un d'eux manque.
set -uo pipefail

if [ -n "${GOOGLE_OAUTH_CLIENT_ID:-}" ] && [ -n "${GOOGLE_OAUTH_CLIENT_SECRET:-}" ] && [ -n "${GOOGLE_OAUTH_REFRESH_TOKEN:-}" ]; then
  if npm run -s mcp:setup-google-auth; then
    echo "[start] Credentials MCP GA4/Search Console régénérées."
  else
    echo "[start] Échec de la génération des credentials MCP (non bloquant)." >&2
  fi
else
  echo "[start] Secrets GOOGLE_OAUTH_* absents — MCP GA4/Search Console non initialisé (voir GUIDE-MCP-SEARCH-CONSOLE-GA4.md)." >&2
fi

if [ -n "${FTP_HOST:-}" ] && [ -n "${FTP_USER:-}" ] && [ -n "${FTP_PASS:-}" ]; then
  if npm run -s ovh:setup-env; then
    echo "[start] Configuration .env.ovh régénérée."
  else
    echo "[start] Échec de la génération de .env.ovh (non bloquant)." >&2
  fi
  if ! command -v lftp >/dev/null 2>&1; then
    echo "[start] lftp absent — tentative d'installation (non bloquant)." >&2
    sudo apt-get update -qq && sudo apt-get install -y lftp -qq || \
      echo "[start] Échec de l'installation de lftp (non bloquant)." >&2
  fi
else
  echo "[start] Secrets FTP_HOST/FTP_USER/FTP_PASS absents — déploiement OVH non initialisé (voir DEPLOYMENT.md)." >&2
fi

exit 0
