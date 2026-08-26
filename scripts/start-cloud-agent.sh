#!/usr/bin/env bash
# Initialisation "start" du Cloud Agent : régénère le fichier de credentials MCP
# GA4/Search Console à partir des secrets Cursor (s'ils sont configurés), sans
# jamais faire échouer le démarrage de l'environnement si l'un d'eux manque.
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

exit 0
