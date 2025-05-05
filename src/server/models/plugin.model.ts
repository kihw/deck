export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}

export interface PluginAction {
  name: string;
  execute: () => Promise<any>;
}

export class Plugin {
  constructor(
    public id: string,
    public metadata: PluginMetadata,
    public actions: PluginAction[]
  ) {}

  getAction(actionName: string): PluginAction | undefined {
    return this.actions.find(action => action.name === actionName);
  }
}