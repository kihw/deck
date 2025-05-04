const express = require('express');

module.exports = (actionManager, authService) => {
  const router = express.Router();

  // Routes d'authentification
  router.post('/auth/verify', async (req, res) => {
    const { pin } = req.body;
    const isValid = await authService.verifyPin(pin);
    
    if (isValid) {
      const token = authService.generateToken();
      res.json({ token, success: true });
    } else {
      res.status(401).json({ error: 'Invalid PIN', success: false });
    }
  });

  // Configuration des boutons
  router.get('/buttons', (req, res) => {
    res.json(actionManager.getButtonConfigs());
  });

  router.post('/buttons', (req, res) => {
    const { config } = req.body;
    const button = actionManager.createButton(config);
    res.json(button);
  });

  router.put('/buttons/:id', (req, res) => {
    const { id } = req.params;
    const { config } = req.body;
    const button = actionManager.updateButton(id, config);
    
    if (button) {
      res.json(button);
    } else {
      res.status(404).json({ error: 'Button not found' });
    }
  });

  router.delete('/buttons/:id', (req, res) => {
    const { id } = req.params;
    const success = actionManager.deleteButton(id);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Button not found' });
    }
  });

  // Status du serveur
  router.get('/status', (req, res) => {
    res.json({
      status: 'online',
      connections: authService.getActiveConnectionsCount(),
      uptime: process.uptime()
    });
  });

  return router;
};