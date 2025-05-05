# OBS Plugin

Le plugin OBS permet de contrôler [OBS Studio](https://obsproject.com/) via son interface WebSocket.

## Prérequis

- OBS Studio installé sur votre ordinateur
- [obs-websocket](https://github.com/obsproject/obs-websocket) installé et activé dans OBS

## Configuration

1. Dans OBS Studio, allez dans `Tools > WebSocket Server Settings`
2. Cochez `Enable WebSocket Server`
3. Le port par défaut est `4444` (peut être modifié)
4. Définissez un mot de passe si nécessaire

## Paramètres du fichier .env

```
# OBS WebSocket
OBS_ADDRESS=localhost:4444
OBS_PASSWORD=votre_mot_de_passe
```

- `OBS_ADDRESS`: adresse de l'hôte OBS (par défaut: localhost:4444)
- `OBS_PASSWORD`: mot de passe si configuré dans OBS

## Actions disponibles

| Action | Description |
|--------|-------------|
| `obs.toggleStream` | Démarre ou arrête le streaming en fonction de l'état actuel |

## Résolution des problèmes

### Erreur "Invalid URL"

Assurez-vous que le format d'adresse dans le fichier .env est correct, exemple: `localhost:4444`.

### Échec de connexion à OBS

- Vérifiez qu'OBS est bien en cours d'exécution
- Vérifiez que le plugin obs-websocket est installé et activé
- Vérifiez que le port dans .env correspond à celui configuré dans OBS
- Si un mot de passe est défini dans OBS, assurez-vous qu'il est correctement renseigné dans .env

## À venir

- Contrôle des scènes
- Contrôle des sources
- Gestion de l'enregistrement
- État des différentes sorties (streaming, enregistrement)