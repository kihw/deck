# Plugin de Notification Personnalisé

## 🔔 Présentation

Le plugin de notification personnalisé offre une solution flexible pour envoyer des notifications via plusieurs canaux :
- Email
- Slack
- Discord

## 🚀 Fonctionnalités Principales

### Configuration Multi-Canaux
- Configuration indépendante de chaque canal
- Possibilité d'activer/désactiver des canaux spécifiques
- Support de plusieurs webhooks et comptes

### Types de Notifications
- Information (Bleu)
- Avertissement (Orange)
- Erreur (Rouge)

## 📦 Utilisation

### Configuration Initiale

```typescript
await notificationPlugin.actions.configureNotifications.execute({
  email: 'mon-email@example.com',
  slackWebhook: 'https://hooks.slack.com/services/...',
  discordWebhook: 'https://discord.com/api/webhooks/...'
});
```

### Envoi de Notifications

```typescript
await notificationPlugin.actions.sendNotification.execute({
  message: 'Une notification importante !',
  type: 'warning',
  channels: ['email', 'slack', 'discord']
});
```

## 🔧 Configuration Détaillée

### Variables d'Environnement Requises

```bash
# Pour les notifications par email
NOTIFICATION_EMAIL=votre-email@gmail.com
NOTIFICATION_EMAIL_PASSWORD=mot-de-passe-application
```

### Configuration dans `.env`

```env
# Canaux de notification
NOTIFICATION_EMAIL=admin@example.com
NOTIFICATION_SLACK_WEBHOOK=https://hooks.slack.com/...
NOTIFICATION_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

## 🛡️ Sécurité

- Les tokens et mots de passe sont gérés de manière sécurisée
- Supporte l'authentification par token
- Validation des configurations avant envoi

## 🔮 Cas d'Usage

- Alertes système
- Notifications de stream
- Surveillance de performances
- Rapports d'erreurs

## 🔬 Personnalisation Avancée

Le plugin permet une personnalisation poussée :
- Filtrage des notifications
- Configuration de canaux spécifiques
- Personnalisation des styles de message

## 📋 Roadmap

- [ ] Support de plus de canaux de notification
- [ ] Templates de messages personnalisables
- [ ] Intégration avec d'autres plugins Deck

---

*Plugin développé par l'équipe Deck*
