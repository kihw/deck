import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Plugin } from '../models/Plugin';
import logger from '../services/logger';

const router = express.Router();

// Récupérer tous les plugins accessibles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const plugins = await Plugin.find({ 
      $or: [
        { visibility: 'public' },
        { owner: req.user.id }
      ]
    });
    res.json(plugins);
    logger.info(`Plugins récupérés pour l'utilisateur ${req.user.id}`);
  } catch (error) {
    logger.error(`Erreur de récupération des plugins: ${error.message}`);
    res.status(500).json({ message: 'Erreur de récupération des plugins' });
  }
});

// Créer un nouveau plugin
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newPlugin = new Plugin({
      ...req.body,
      owner: req.user.id
    });
    await newPlugin.save();
    logger.info(`Nouveau plugin créé par ${req.user.id}`);
    res.status(201).json(newPlugin);
  } catch (error) {
    logger.error(`Erreur de création de plugin: ${error.message}`);
    res.status(400).json({ message: 'Création de plugin impossible' });
  }
});

export default router;