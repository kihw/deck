export interface PluginLifecycle {
  initialize(config?: Record<string, any>): Promise<void>;
  unload?(): Promise<void>;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  requiredPermissions?: string[];
}

export interface PluginAction {
  id: string;
  name: string;
  description?: string;
  execute(context?: Record<string, any>): Promise<any>;
  validate?(params: any): boolean;
}

export interface Plugin extends PluginLifecycle {
  metadata: PluginMetadata;
  actions: Record<string, PluginAction>;
  helpers?: Record<string, Function>;
}

export interface PluginConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}

export type PluginRegistry = Map<string, Plugin>;
