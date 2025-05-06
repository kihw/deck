#!/usr/bin/env node

/**
 * Setup Icon Manager Plugin Directories
 * 
 * This script ensures that all required directories for the Icon Manager plugin exist
 * and initializes them with the default icon categories.
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Get project root directory
const rootDir = path.resolve(__dirname, '..');

// Define icon directories
const ICON_BASE_DIR = path.join(rootDir, 'assets', 'icons');
const DEFAULT_CATEGORIES = [
  'system',
  'streaming',
  'media',
  'social',
  'utilities',
  'custom'
];

async function setupIconManager() {
  console.log(chalk.blue('🖼️ Setting up Icon Manager directories...'));

  // Create base directory
  await fs.ensureDir(ICON_BASE_DIR);
  console.log(chalk.green('✅ Created base icons directory'));

  // Create category directories
  let createdCount = 0;
  let existingCount = 0;

  for (const category of DEFAULT_CATEGORIES) {
    const categoryPath = path.join(ICON_BASE_DIR, category);
    
    if (!await fs.pathExists(categoryPath)) {
      await fs.ensureDir(categoryPath);
      console.log(chalk.green(`✅ Created category directory: ${category}`));
      createdCount++;
    } else {
      console.log(chalk.yellow(`ℹ️ Category directory already exists: ${category}`));
      existingCount++;
    }
  }

  // Copy default icons if they exist in the source directory
  const defaultIconsDir = path.join(rootDir, 'src', 'assets', 'default-icons');
  if (await fs.pathExists(defaultIconsDir)) {
    const categories = await fs.readdir(defaultIconsDir);
    
    for (const category of categories) {
      const sourceCategoryPath = path.join(defaultIconsDir, category);
      const targetCategoryPath = path.join(ICON_BASE_DIR, category);
      
      // Check if it's a directory
      const stats = await fs.stat(sourceCategoryPath);
      if (stats.isDirectory()) {
        // Copy all icons from source to target
        const icons = await fs.readdir(sourceCategoryPath);
        for (const icon of icons) {
          const sourceIconPath = path.join(sourceCategoryPath, icon);
          const targetIconPath = path.join(targetCategoryPath, icon);
          
          // Only copy if target doesn't exist
          if (!await fs.pathExists(targetIconPath)) {
            await fs.copy(sourceIconPath, targetIconPath);
            console.log(chalk.green(`✅ Copied default icon: ${category}/${icon}`));
          }
        }
      }
    }
  }

  console.log(chalk.blue('\n🎉 Icon Manager setup complete!'));
  console.log(chalk.white(`📁 Created: ${createdCount} directories`));
  console.log(chalk.white(`📂 Already existed: ${existingCount} directories`));
}

// Run the setup function
setupIconManager().catch(err => {
  console.error(chalk.red('❌ Error setting up Icon Manager:'), err);
  process.exit(1);
});
