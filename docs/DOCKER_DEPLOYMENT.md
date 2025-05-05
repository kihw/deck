# Guide de Déploiement Docker pour Deck

## Vue d'ensemble

Deck peut être facilement déployé avec Docker, ce qui assure un environnement cohérent et simplifie l'installation.

## Installation avec Docker

### Prérequis

- Docker installé sur votre système
- Docker Compose installé

### Démarrage rapide

```bash
# Cloner le repository
git clone https://github.com/kihw/deck.git
cd deck

# Construire et démarrer le conteneur
docker-compose up -d

# Accéder à l'application
# L'application sera disponible sur http://localhost:3000
```

### Construction manuelle

```bash
# Construire l'image
docker build -t deck-app .

# Exécuter le conteneur
docker run -d -p 3000:3000 --name deck deck-app
```

## Configuration

### Variables d'environnement

Vous pouvez configurer l'application en passant des variables d'environnement :

```bash
docker run -d -p 3000:3000 \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e PIN_LENGTH=4 \
  --name deck deck-app
```

### Persistance des données

Pour persister les configurations :

```bash
docker run -d -p 3000:3000 \
  -v $(pwd)/config:/usr/src/app/config \
  --name deck deck-app
```

## Déploiement en production

### Avec Docker Compose

Modifiez le fichier `docker-compose.yml` pour la production :

```yaml
version: '3.8'

services:
  deck:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Avec orchestration (Kubernetes, Swarm)

Un exemple de manifeste Kubernetes :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deck
spec:
  replicas: 1
  selector:
    matchLabels:
      app: deck
  template:
    metadata:
      labels:
        app: deck
    spec:
      containers:
      - name: deck
        image: ghcr.io/kihw/deck:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: deck
spec:
  type: LoadBalancer
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: deck
```

## Surveillance et logs

### Logs du conteneur

```bash
# Voir les logs en temps réel
docker logs -f deck

# Avec docker-compose
docker-compose logs -f deck
```

### Monitoring

Intégration avec des solutions de monitoring :

```yaml
# docker-compose.yml avec Prometheus
version: '3.8'

services:
  deck:
    # ... configuration existante ...
    ports:
      - "3000:3000"
      - "9090:9090"  # Métriques Prometheus
```

## Sécurité

### Bonnes pratiques

1. **Ne pas exposer les ports inutiles**
2. **Utiliser des secrets pour les tokens**
3. **Limiter les ressources du conteneur**

```yaml
services:
  deck:
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
```

## Dépannage

### Le conteneur ne démarre pas

```bash
# Vérifier les logs d'erreur
docker logs deck

# Vérifier l'état du conteneur
docker inspect deck
```

### Problèmes de réseau

```bash
# Tester la connectivité
docker exec -it deck ping google.com

# Vérifier les ports
docker port deck
```

## Mise à jour

```bash
# Arrêter le conteneur actuel
docker-compose down

# Récupérer la dernière version
git pull origin main

# Reconstruire et redémarrer
docker-compose up -d --build
```

## Backup

Pour sauvegarder les configurations et données :

```bash
# Sauvegarder le volume de configuration
docker cp deck:/usr/src/app/config ./backup-config
```

---

Pour toute question, consultez la [documentation principale](../README.md) ou créez une [issue](https://github.com/kihw/deck/issues).