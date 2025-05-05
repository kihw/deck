import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { Plugin, PluginAction } from './types';

interface Icon {
  id: string;
  name: string;
  category: string;
  mimeType: string;
  base64?: string;
  path: string;
  createdAt: Date;
}

class IconManagerPlugin implements Plugin {
  metadata = {
    id: 'icon-manager',
    name: 'Icon Manager',
    version: '1.0.0',
    description: 'Manage icons and images for button customization',
    author: 'Deck Team'
  };

  private icons: Map<string, Icon> = new Map();
  private categories: Set<string> = new Set(['system', 'streaming', 'media', 'social', 'utilities', 'custom']);
  private assetsDirectory: string = './assets/icons';

  actions: Record<string, PluginAction> = {
    uploadIcon: {
      id: 'upload-icon',
      name: 'Upload Icon',
      description: 'Upload a new icon',
      async execute(context: { 
        name: string, 
        category?: string, 
        data: string,
        mimeType: string
      }) {
        try {
          // Validate input
          if (!context.name || !context.data || !context.mimeType) {
            throw new Error('Missing required parameters');
          }

          if (!context.data.startsWith('data:')) {
            throw new Error('Invalid data format');
          }

          // Use provided category or default to 'custom'
          const category = context.category || 'custom';
          
          // Add category if it doesn't exist
          this.categories.add(category);
          
          // Generate a unique ID
          const iconId = crypto.randomBytes(8).toString('hex');
          
          // Create directory if it doesn't exist
          const categoryPath = path.join(this.assetsDirectory, category);
          await fs.ensureDir(categoryPath);
          
          // Extract base64 data
          const base64Data = context.data.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Determine file extension
          const extension = this.getExtensionFromMimeType(context.mimeType);
          const fileName = `${iconId}.${extension}`;
          const filePath = path.join(categoryPath, fileName);
          
          // Save file
          await fs.writeFile(filePath, buffer);
          
          // Create icon object
          const icon: Icon = {
            id: iconId,
            name: context.name,
            category,
            mimeType: context.mimeType,
            path: filePath,
            createdAt: new Date()
          };
          
          // Store icon in memory
          this.icons.set(iconId, icon);
          
          return { 
            success: true, 
            icon: {
              id: icon.id,
              name: icon.name,
              category: icon.category
            }
          };
        } catch (error) {
          console.error('Error uploading icon:', error);
          throw new Error(`Failed to upload icon: ${error.message}`);
        }
      }
    },

    getIcon: {
      id: 'get-icon',
      name: 'Get Icon',
      description: 'Get icon details by ID',
      async execute(context: { iconId: string, includeData?: boolean }) {
        try {
          const icon = this.icons.get(context.iconId);
          
          if (!icon) {
            // Try to find icon by scanning directory
            const foundIcon = await this.findIconById(context.iconId);
            if (!foundIcon) {
              throw new Error(`Icon with ID ${context.iconId} not found`);
            }
            return this.prepareIconResponse(foundIcon, context.includeData);
          }
          
          return this.prepareIconResponse(icon, context.includeData);
        } catch (error) {
          console.error('Error retrieving icon:', error);
          throw new Error(`Failed to get icon: ${error.message}`);
        }
      }
    },

    deleteIcon: {
      id: 'delete-icon',
      name: 'Delete Icon',
      description: 'Delete an icon by ID',
      async execute(context: { iconId: string }) {
        try {
          const icon = this.icons.get(context.iconId);
          
          if (!icon) {
            throw new Error(`Icon with ID ${context.iconId} not found`);
          }
          
          // Delete file
          await fs.remove(icon.path);
          
          // Remove from memory
          this.icons.delete(context.iconId);
          
          return { 
            success: true, 
            message: `Icon ${icon.name} deleted successfully` 
          };
        } catch (error) {
          console.error('Error deleting icon:', error);
          throw new Error(`Failed to delete icon: ${error.message}`);
        }
      }
    },

    listIcons: {
      id: 'list-icons',
      name: 'List Icons',
      description: 'List all available icons with optional category filter',
      async execute(context?: { category?: string }) {
        try {
          // If not loaded yet, scan directories
          if (this.icons.size === 0) {
            await this.scanIconDirectories();
          }

          let icons: Icon[] = Array.from(this.icons.values());
          
          // Filter by category if provided
          if (context?.category && context.category !== 'all') {
            icons = icons.filter(icon => icon.category === context.category);
          }
          
          // Return simplified icon objects (without base64 data)
          return { 
            success: true, 
            icons: icons.map(icon => ({
              id: icon.id,
              name: icon.name,
              category: icon.category
            }))
          };
        } catch (error) {
          console.error('Error listing icons:', error);
          throw new Error(`Failed to list icons: ${error.message}`);
        }
      }
    },

    getCategories: {
      id: 'get-categories',
      name: 'Get Categories',
      description: 'Get all available icon categories',
      async execute() {
        try {
          // Ensure categories are up to date
          await this.updateCategories();
          
          return { 
            success: true, 
            categories: Array.from(this.categories) 
          };
        } catch (error) {
          console.error('Error getting categories:', error);
          throw new Error(`Failed to get categories: ${error.message}`);
        }
      }
    },

    createCategory: {
      id: 'create-category',
      name: 'Create Category',
      description: 'Create a new icon category',
      async execute(context: { category: string }) {
        try {
          if (!context.category) {
            throw new Error('Category name is required');
          }
          
          // Validate category name (alphanumeric with hyphens)
          if (!/^[a-z0-9-]+$/.test(context.category)) {
            throw new Error('Category name must contain only lowercase letters, numbers, and hyphens');
          }
          
          // Create category directory
          const categoryPath = path.join(this.assetsDirectory, context.category);
          await fs.ensureDir(categoryPath);
          
          // Add to categories set
          this.categories.add(context.category);
          
          return { 
            success: true, 
            category: context.category 
          };
        } catch (error) {
          console.error('Error creating category:', error);
          throw new Error(`Failed to create category: ${error.message}`);
        }
      }
    }
  };

  private async prepareIconResponse(icon: Icon, includeData: boolean = false): Promise<any> {
    const response: any = {
      id: icon.id,
      name: icon.name,
      category: icon.category,
      mimeType: icon.mimeType
    };
    
    if (includeData) {
      // Read file if base64 not cached
      if (!icon.base64) {
        try {
          const data = await fs.readFile(icon.path);
          icon.base64 = `data:${icon.mimeType};base64,${data.toString('base64')}`;
          // Update icon in map
          this.icons.set(icon.id, icon);
        } catch (error) {
          console.error(`Error reading icon file: ${icon.path}`, error);
          throw new Error('Failed to read icon file');
        }
      }
      
      response.base64 = icon.base64;
    }
    
    return response;
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/webp': 'webp'
    };
    
    return mimeToExt[mimeType] || 'png';
  }

  private async scanIconDirectories(): Promise<void> {
    try {
      // Ensure assets directory exists
      await fs.ensureDir(this.assetsDirectory);
      
      // Read all categories (directories)
      const categories = await fs.readdir(this.assetsDirectory);
      
      for (const category of categories) {
        const categoryPath = path.join(this.assetsDirectory, category);
        const stats = await fs.stat(categoryPath);
        
        if (stats.isDirectory()) {
          // Add to categories
          this.categories.add(category);
          
          // Read icons in this category
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            const filePath = path.join(categoryPath, file);
            const fileStats = await fs.stat(filePath);
            
            if (fileStats.isFile()) {
              const iconId = path.basename(file, path.extname(file));
              const extension = path.extname(file).substring(1);
              const mimeType = this.getMimeTypeFromExtension(extension);
              
              // Create icon object
              const icon: Icon = {
                id: iconId,
                name: iconId,
                category,
                mimeType,
                path: filePath,
                createdAt: fileStats.birthtime || fileStats.ctime
              };
              
              // Store in memory
              this.icons.set(iconId, icon);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning icon directories:', error);
    }
  }

  private async findIconById(iconId: string): Promise<Icon | null> {
    try {
      // Scan all category directories
      for (const category of this.categories) {
        const categoryPath = path.join(this.assetsDirectory, category);
        
        try {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (file.startsWith(iconId)) {
              const filePath = path.join(categoryPath, file);
              const stats = await fs.stat(filePath);
              
              if (stats.isFile()) {
                const extension = path.extname(file).substring(1);
                const mimeType = this.getMimeTypeFromExtension(extension);
                
                const icon: Icon = {
                  id: iconId,
                  name: iconId,
                  category,
                  mimeType,
                  path: filePath,
                  createdAt: stats.birthtime || stats.ctime
                };
                
                // Store in memory for future use
                this.icons.set(iconId, icon);
                
                return icon;
              }
            }
          }
        } catch (error) {
          // Skip this category if there's an error
          console.error(`Error reading category ${category}:`, error);
        }
      }
    } catch (error) {
      console.error('Error finding icon by ID:', error);
    }
    
    return null;
  }

  private getMimeTypeFromExtension(extension: string): string {
    const extToMime: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp'
    };
    
    return extToMime[extension.toLowerCase()] || 'application/octet-stream';
  }

  private async updateCategories(): Promise<void> {
    try {
      // Ensure assets directory exists
      await fs.ensureDir(this.assetsDirectory);
      
      // Read all directories
      const directories = await fs.readdir(this.assetsDirectory);
      
      for (const dir of directories) {
        const dirPath = path.join(this.assetsDirectory, dir);
        const stats = await fs.stat(dirPath);
        
        if (stats.isDirectory()) {
          this.categories.add(dir);
        }
      }
    } catch (error) {
      console.error('Error updating categories:', error);
    }
  }

  async initialize(config?: Record<string, any>): Promise<void> {
    // Set assets directory from config or use default
    if (config?.assetsDirectory) {
      this.assetsDirectory = config.assetsDirectory;
    }
    
    // Ensure assets directory exists
    await fs.ensureDir(this.assetsDirectory);
    
    // Create default categories if they don't exist
    for (const category of this.categories) {
      await fs.ensureDir(path.join(this.assetsDirectory, category));
    }
    
    // Scan icon directories
    await this.scanIconDirectories();
    
    console.log(`Icon Manager initialized with ${this.icons.size} icons in ${this.categories.size} categories`);
  }

  async unload(): Promise<void> {
    // Clear memory
    this.icons.clear();
    console.log('Icon Manager unloaded');
  }
}

export default new IconManagerPlugin();