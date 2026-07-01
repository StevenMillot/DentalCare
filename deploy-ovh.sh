#!/bin/bash

# =====================================================
# SCRIPT DE DÉPLOIEMENT OVH CLOUD - PARO-SPE.FR
# =====================================================
# Ce script prépare et déploie le site sur OVH via FTP/SFTP
# Usage: ./deploy-ovh.sh [environnement]
# Environnements: production, staging
# =====================================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
ENVIRONMENT="${1:-production}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DÉPLOIEMENT OVH CLOUD - PARO-SPÉ    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ------------------------------------------------------
# 1. VÉRIFICATIONS PRÉALABLES
# ------------------------------------------------------

echo -e "${YELLOW}[1/6]${NC} Vérification des prérequis..."

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm n'est pas installé${NC}"
    exit 1
fi

# Vérifier que lftp est installé (pour le déploiement FTP)
if ! command -v lftp &> /dev/null; then
    echo -e "${YELLOW}⚠ lftp n'est pas installé. Installation...${NC}"
    # Détecter le système d'exploitation
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install lftp
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y lftp
    else
        echo -e "${RED}✗ Veuillez installer lftp manuellement${NC}"
        echo "  Ubuntu/Debian: sudo apt-get install lftp"
        echo "  macOS: brew install lftp"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Prérequis vérifiés${NC}"

# ------------------------------------------------------
# 2. CHARGEMENT DE LA CONFIGURATION
# ------------------------------------------------------

echo -e "${YELLOW}[2/6]${NC} Chargement de la configuration..."

# Charger les variables d'environnement depuis le fichier .env.ovh
if [ -f ".env.ovh" ]; then
    export $(cat .env.ovh | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Configuration chargée depuis .env.ovh${NC}"
else
    echo -e "${RED}✗ Fichier .env.ovh introuvable${NC}"
    echo -e "${YELLOW}Création du fichier .env.ovh avec un template...${NC}"
    
    cat > .env.ovh << 'EOF'
# CONFIGURATION OVH CLOUD - PARO-SPE.FR
# ⚠️ NE JAMAIS COMMITER CE FICHIER (ajouté à .gitignore)

# === PRODUCTION ===
FTP_HOST=ftp.cluster0XX.hosting.ovh.net
FTP_USER=votre-login-ftp
FTP_PASS=votre-mot-de-passe-ftp
FTP_PORT=21
FTP_REMOTE_DIR=/www

# === STAGING (optionnel) ===
FTP_HOST_STAGING=ftp.cluster0XX.hosting.ovh.net
FTP_USER_STAGING=votre-login-ftp-staging
FTP_PASS_STAGING=votre-mot-de-passe-ftp-staging
FTP_PORT_STAGING=21
FTP_REMOTE_DIR_STAGING=/staging

# === OPTIONS ===
# Utiliser SFTP (plus sécurisé) ? true/false
USE_SFTP=false
# Port SFTP (généralement 22)
SFTP_PORT=22

# === BACKUP ===
# Créer un backup avant déploiement ? true/false
CREATE_BACKUP=true
EOF
    
    echo -e "${GREEN}✓ Fichier .env.ovh créé${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Éditez .env.ovh avec vos identifiants OVH${NC}"
    echo -e "${YELLOW}   Puis relancez: ./deploy-ovh.sh${NC}"
    exit 0
fi

# Vérifier que les variables nécessaires sont définies
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo -e "${RED}✗ Variables FTP manquantes dans .env.ovh${NC}"
    echo -e "${YELLOW}Vérifiez que FTP_HOST, FTP_USER et FTP_PASS sont définis${NC}"
    exit 1
fi

# ------------------------------------------------------
# 3. PRÉPARATION DU BUILD
# ------------------------------------------------------

echo -e "${YELLOW}[3/6]${NC} Préparation du build..."

# Installer les dépendances
echo "Installation des dépendances npm..."
npm install

# Lancer la préparation du déploiement
echo "Exécution de npm run deploy:prepare..."
npm run deploy:prepare

echo -e "${GREEN}✓ Build préparé${NC}"

# ------------------------------------------------------
# 4. CRÉATION D'UN BACKUP (optionnel)
# ------------------------------------------------------

if [ "${CREATE_BACKUP:-false}" = "true" ]; then
    echo -e "${YELLOW}[4/6]${NC} Création d'un backup du site actuel..."
    
    BACKUP_DIR="backups"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    mkdir -p "$BACKUP_DIR"
    
    # Créer une archive locale avant déploiement
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
        --exclude='node_modules' \
        --exclude='backups' \
        --exclude='.git' \
        --exclude='scripts' \
        --exclude='tools' \
        .
    
    echo -e "${GREEN}✓ Backup créé: $BACKUP_DIR/$BACKUP_NAME${NC}"
else
    echo -e "${YELLOW}[4/6]${NC} Backup désactivé (CREATE_BACKUP=false)"
fi

# ------------------------------------------------------
# 5. LISTE DES FICHIERS À DÉPLOYER
# ------------------------------------------------------

echo -e "${YELLOW}[5/6]${NC} Préparation de la liste des fichiers..."

# Créer un fichier temporaire avec la liste des fichiers à exclure
cat > /tmp/deploy-exclude.txt << 'EOF'
node_modules/
scripts/
tools/
backups/
.git/
.github/
.tmp-*
*.log
.DS_Store
.env*
package.json
package-lock.json
README.md
deploy-ovh.sh
.gitignore
EOF

echo -e "${GREEN}✓ Liste préparée${NC}"

# ------------------------------------------------------
# 6. DÉPLOIEMENT VIA FTP/SFTP
# ------------------------------------------------------

echo -e "${YELLOW}[6/6]${NC} Déploiement sur OVH Cloud..."

# Sélectionner le protocole
if [ "${USE_SFTP:-false}" = "true" ]; then
    PROTOCOL="sftp"
    PORT="${SFTP_PORT:-22}"
    echo -e "${BLUE}→ Utilisation de SFTP (sécurisé)${NC}"
else
    PROTOCOL="ftp"
    PORT="${FTP_PORT:-21}"
    echo -e "${BLUE}→ Utilisation de FTP${NC}"
fi

# Script LFTP pour le déploiement
echo -e "${BLUE}→ Connexion à $FTP_HOST...${NC}"

lftp -c "
set $PROTOCOL:ssl-allow no;
set net:timeout 30;
set net:max-retries 3;
set net:reconnect-interval-base 5;
open -u $FTP_USER,$FTP_PASS -p $PORT $PROTOCOL://$FTP_HOST;
cd $FTP_REMOTE_DIR;

# Créer les dossiers s'ils n'existent pas
mkdir -p css;
mkdir -p js;
mkdir -p assets;
mkdir -p assets/cabinet-gallery;
mkdir -p assets/team;
mkdir -p assets/Icones;
mkdir -p assets/traitements;

# Upload des fichiers principaux
lcd $PWD;
mirror --reverse \
       --delete \
       --verbose \
       --exclude-glob node_modules/ \
       --exclude-glob scripts/ \
       --exclude-glob tools/ \
       --exclude-glob backups/ \
       --exclude-glob .git/ \
       --exclude-glob .github/ \
       --exclude-glob .tmp-* \
       --exclude-glob *.log \
       --exclude-glob .DS_Store \
       --exclude-glob .env* \
       --exclude-glob package.json \
       --exclude-glob package-lock.json \
       --exclude-glob README.md \
       --exclude-glob deploy-ovh.sh \
       --exclude-glob .gitignore \
       --exclude-glob .nojekyll \
       . .;

# Vérifier que le fichier .htaccess est bien présent
put .htaccess;

echo 'Déploiement terminé';
quit;
"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      ✓ DÉPLOIEMENT RÉUSSI !           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}→ Environnement: ${ENVIRONMENT}${NC}"
    echo -e "${BLUE}→ Serveur: ${FTP_HOST}${NC}"
    echo -e "${BLUE}→ Répertoire: ${FTP_REMOTE_DIR}${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Recommandations post-déploiement:${NC}"
    echo "  1. Vérifiez le site sur https://paro-spe.fr"
    echo "  2. Testez les redirections HTTPS"
    echo "  3. Vérifiez les headers de sécurité (securityheaders.com)"
    echo "  4. Testez le formulaire de contact"
    echo "  5. Vérifiez le service worker (DevTools > Application)"
    echo "  6. Testez la version mobile"
    echo "  7. Vérifiez le sitemap.xml et robots.txt"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║      ✗ DÉPLOIEMENT ÉCHOUÉ              ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Vérifiez:${NC}"
    echo "  - Les identifiants FTP dans .env.ovh"
    echo "  - La connexion réseau"
    echo "  - Les permissions sur le serveur OVH"
    exit 1
fi

# ------------------------------------------------------
# FIN DU SCRIPT
# ------------------------------------------------------
