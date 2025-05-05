import express from 'express';
import PluginManager from '../services/plugin-manager';

const router = express.Router();
const pluginManager = new PluginManager('./plugins');

router.get('/', (req, res) => {
  const plugins = pluginManager.listPlugins();
  res.json(plugins);
});

router.post('/:pluginId/:action', (req, res) => {
  const { pluginId, action } = req.params;
  const params = req.body;

  try {
    const result = pluginManager.executeAction(pluginId, action, params);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;