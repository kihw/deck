/**
 * Tests for the Icon Manager Plugin
 * 
 * These tests verify that the Icon Manager plugin correctly handles icon operations
 * including uploading, retrieving, listing, and deleting icons.
 */

import fs from 'fs-extra';
import path from 'path';
import IconManagerPlugin from '../../src/plugins/icon-manager';

// Setup test directory
const TEST_ASSETS_DIR = path.resolve(__dirname, '../temp/assets/icons');

// Mock base64 image data
const TEST_ICON_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('Icon Manager Plugin', () => {
  beforeAll(async () => {
    // Ensure test directory exists
    await fs.ensureDir(TEST_ASSETS_DIR);
    
    // Initialize plugin with test directory
    await IconManagerPlugin.initialize({ assetsDirectory: TEST_ASSETS_DIR });
  });
  
  afterAll(async () => {
    await IconManagerPlugin.unload();
    // Clean up test directory
    await fs.remove(path.resolve(__dirname, '../temp'));
  });
  
  it('should create categories', async () => {
    const result = await IconManagerPlugin.actions.createCategory.execute({ category: 'test-category' });
    
    expect(result.success).toBe(true);
    expect(result.category).toBe('test-category');
    
    // Verify directory was created
    const categoryPath = path.join(TEST_ASSETS_DIR, 'test-category');
    const exists = await fs.pathExists(categoryPath);
    expect(exists).toBe(true);
  });
  
  it('should upload an icon', async () => {
    const result = await IconManagerPlugin.actions.uploadIcon.execute({
      name: 'Test Icon',
      category: 'test-category',
      data: TEST_ICON_DATA,
      mimeType: 'image/png'
    });
    
    expect(result.success).toBe(true);
    expect(result.icon).toBeDefined();
    expect(result.icon.name).toBe('Test Icon');
    expect(result.icon.category).toBe('test-category');
    
    // Save the icon ID for later tests
    const iconId = result.icon.id;
    
    // Verify file was created
    const iconFiles = await fs.readdir(path.join(TEST_ASSETS_DIR, 'test-category'));
    expect(iconFiles.length).toBeGreaterThan(0);
    expect(iconFiles.some(file => file.startsWith(iconId))).toBe(true);
  });
  
  it('should get icon details', async () => {
    // First upload an icon to get its ID
    const uploadResult = await IconManagerPlugin.actions.uploadIcon.execute({
      name: 'Get Test Icon',
      category: 'test-category',
      data: TEST_ICON_DATA,
      mimeType: 'image/png'
    });
    
    const iconId = uploadResult.icon.id;
    
    // Now get the icon details
    const result = await IconManagerPlugin.actions.getIcon.execute({
      iconId,
      includeData: true
    });
    
    expect(result.id).toBe(iconId);
    expect(result.name).toBe('Get Test Icon');
    expect(result.category).toBe('test-category');
    expect(result.mimeType).toBe('image/png');
    expect(result.base64).toBeDefined();
  });
  
  it('should list icons by category', async () => {
    // Create a new category
    await IconManagerPlugin.actions.createCategory.execute({ category: 'list-test' });
    
    // Upload a few icons
    await IconManagerPlugin.actions.uploadIcon.execute({
      name: 'List Icon 1',
      category: 'list-test',
      data: TEST_ICON_DATA,
      mimeType: 'image/png'
    });
    
    await IconManagerPlugin.actions.uploadIcon.execute({
      name: 'List Icon 2',
      category: 'list-test',
      data: TEST_ICON_DATA,
      mimeType: 'image/png'
    });
    
    // List all icons in the category
    const result = await IconManagerPlugin.actions.listIcons.execute({
      category: 'list-test'
    });
    
    expect(result.success).toBe(true);
    expect(Array.isArray(result.icons)).toBe(true);
    expect(result.icons.length).toBe(2);
    expect(result.icons.some(icon => icon.name === 'List Icon 1')).toBe(true);
    expect(result.icons.some(icon => icon.name === 'List Icon 2')).toBe(true);
  });
  
  it('should list all categories', async () => {
    // Create a few categories
    await IconManagerPlugin.actions.createCategory.execute({ category: 'category-test-1' });
    await IconManagerPlugin.actions.createCategory.execute({ category: 'category-test-2' });
    
    // Get all categories
    const result = await IconManagerPlugin.actions.getCategories.execute();
    
    expect(result.success).toBe(true);
    expect(Array.isArray(result.categories)).toBe(true);
    expect(result.categories.includes('category-test-1')).toBe(true);
    expect(result.categories.includes('category-test-2')).toBe(true);
  });
  
  it('should delete an icon', async () => {
    // Upload an icon to delete
    const uploadResult = await IconManagerPlugin.actions.uploadIcon.execute({
      name: 'Delete Test Icon',
      category: 'test-category',
      data: TEST_ICON_DATA,
      mimeType: 'image/png'
    });
    
    const iconId = uploadResult.icon.id;
    
    // Delete the icon
    const deleteResult = await IconManagerPlugin.actions.deleteIcon.execute({
      iconId
    });
    
    expect(deleteResult.success).toBe(true);
    
    // Try to get the deleted icon
    try {
      await IconManagerPlugin.actions.getIcon.execute({ iconId });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('not found');
    }
  });
  
  it('should handle invalid inputs', async () => {
    // Try to create a category with invalid name
    try {
      await IconManagerPlugin.actions.createCategory.execute({
        category: 'invalid/category@name'
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('Category name must contain only');
    }
    
    // Try to upload an icon with missing data
    try {
      await IconManagerPlugin.actions.uploadIcon.execute({
        name: 'Invalid Icon'
        // Missing data and mimeType
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain('Missing required parameters');
    }
  });
});
