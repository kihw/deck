import { PluginConfig } from './types';

// Ajustable validation rules
const VALIDATION_RULES = {
  pluginConfig: {
    enabled: (value: any) => typeof value === 'boolean',
    settings: (value: any) => typeof value === 'object' && value !== null
  },
  maxSettingsDepth: 5,
  maxSettingsSize: 1024 * 10 // 10KB
};

export function validateConfig(
  config: Record<string, PluginConfig>, 
  customRules?: typeof VALIDATION_RULES
): boolean {
  const rules = { ...VALIDATION_RULES, ...customRules };

  for (const [pluginId, pluginConfig] of Object.entries(config)) {
    // Validate basic structure
    if (!validatePluginConfig(pluginConfig, rules)) {
      console.warn(`Invalid configuration for plugin: ${pluginId}`);
      return false;
    }

    // Optional: Deep validation of settings
    if (!validateSettings(pluginConfig.settings, rules.maxSettingsDepth)) {
      console.warn(`Invalid settings for plugin: ${pluginId}`);
      return false;
    }

    // Settings size check
    const settingsSize = JSON.stringify(pluginConfig.settings).length;
    if (settingsSize > rules.maxSettingsSize) {
      console.warn(`Settings too large for plugin: ${pluginId}`);
      return false;
    }
  }

  return true;
}

function validatePluginConfig(
  config: PluginConfig, 
  rules: typeof VALIDATION_RULES
): boolean {
  for (const [key, validator] of Object.entries(rules.pluginConfig)) {
    if (config.hasOwnProperty(key) && !validator(config[key])) {
      return false;
    }
  }
  return true;
}

function validateSettings(
  settings: Record<string, any>, 
  maxDepth: number, 
  currentDepth = 0
): boolean {
  if (currentDepth > maxDepth) return false;

  for (const value of Object.values(settings)) {
    if (typeof value === 'object' && value !== null) {
      if (!validateSettings(value, maxDepth, currentDepth + 1)) {
        return false;
      }
    }
  }

  return true;
}

export function sanitizeConfig(
  config: Record<string, PluginConfig>
): Record<string, PluginConfig> {
  const sanitizedConfig: Record<string, PluginConfig> = {};

  for (const [pluginId, pluginConfig] of Object.entries(config)) {
    sanitizedConfig[pluginId] = {
      enabled: !!pluginConfig.enabled,
      settings: sanitizeSettings(pluginConfig.settings)
    };
  }

  return sanitizedConfig;
}

function sanitizeSettings(
  settings: Record<string, any>, 
  currentDepth = 0, 
  maxDepth = 5
): Record<string, any> {
  if (currentDepth >= maxDepth) return {};

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSettings(value, currentDepth + 1, maxDepth);
    } else if (typeof value === 'string') {
      // Remove potential script tags, prevent XSS
      sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
