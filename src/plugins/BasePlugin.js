class BasePlugin {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Lifecycle methods
  async initialize() {
    // Override in child classes
    console.log(`Initializing plugin: ${this.name}`);
  }

  async unload() {
    // Override in child classes
    console.log(`Unloading plugin: ${this.name}`);
  }

  // Methods to be implemented by specific plugins
  registerActions() {
    // Returns an array of supported actions
    return [];
  }

  registerListeners() {
    // Registers event listeners specific to the plugin
    return {};
  }
}

module.exports = BasePlugin;