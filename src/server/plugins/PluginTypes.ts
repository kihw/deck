export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}

export interface Plugin {
  metadata: PluginMetadata;
  initialize: () => void;
  unload?: () => void;
  actions?: {
    [key: string]: (...args: any[]) => any;
  };
}

export type PluginActionContext = {
  pluginId: string;
  actionName: string;
  params: Record<string, any>;
}

export interface PluginConfiguration {
  enabled: boolean;
  settings?: Record<string, any>;
}

export type PluginConfigurationMap = {
  [pluginId: string]: PluginConfiguration;
}