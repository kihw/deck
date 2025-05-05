#!/bin/bash

# Script de démarrage rapide pour Deck
# Usage: ./start.sh [port]

# Définir les couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deck - Stream Deck Virtuel${NC}"
echo "========================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé. Veuillez l'installer d'abord.${NC}"
    echo "Exécutez ./install.sh pour l'installation complète."
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ Fichier .env non trouvé, création d'un fichier par défaut...${NC}"
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Fichier .env créé à partir de .env.example${NC}"
    else
        # Créer un fichier .env par défaut
        echo "# Configuration de base" > .env
        echo "PORT=${1:-3000}" >> .env
        echo "HOST=0.0.0.0" >> .env
        echo "PIN_LENGTH=4" >> .env
        echo "PIN_CUSTOM=" >> .env
        echo "MAX_CONNECTIONS=10" >> .env
        echo "LOG_LEVEL=info" >> .env
        echo -e "${GREEN}✓ Fichier .env créé avec les paramètres par défaut${NC}"
    fi
fi

# Si un port est spécifié en argument, modifier le fichier .env
if [ ! -z "$1" ]; then
    # Remplacer ou ajouter la ligne PORT
    if grep -q "^PORT=" .env; then
        sed -i "s/^PORT=.*/PORT=$1/" .env
    else
        echo "PORT=$1" >> .env
    fi
    echo -e "${YELLOW}ℹ️ Port configuré sur: $1${NC}"
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️ Dépendances non installées, installation en cours...${NC}"
    npm install
    echo -e "${GREEN}✓ Dépendances installées${NC}"
fi

echo ""
echo -e "${GREEN}✨ Démarrage de Deck...${NC}"
echo ""

# Démarrer l'application
node main.js

# Code d'erreur
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Erreur lors du démarrage de Deck${NC}"
    echo "Consultez les logs pour plus d'informations."
    exit 1
fi
