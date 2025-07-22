const fs = require('fs-extra');
const path = require('path');

// Default configuration
const DEFAULT_CONFIG = {
  batchSize: 20,
  model: 'gemini-2.0-flash',
  tempDir: './temp'
};

// Configuration file path
const CONFIG_PATH = path.join(__dirname, '../../config.json');

/**
 * Load configuration
 * @returns {Promise<Object>} Configuration object
 */
async function loadConfig() {
  try {
    await fs.ensureFile(CONFIG_PATH);
    const configData = await fs.readFile(CONFIG_PATH, 'utf8');
    
    if (!configData || configData.trim() === '') {
      // Initialize with default configuration if file is empty
      await fs.writeJson(CONFIG_PATH, DEFAULT_CONFIG, { spaces: 2 });
      return DEFAULT_CONFIG;
    }
    
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading configuration:', error);
    // Return default configuration on error
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Save configuration
 * @param {Object} config Configuration object
 * @returns {Promise<Object>} Saved configuration
 */
async function saveConfig(config) {
  try {
    const updatedConfig = { ...await loadConfig(), ...config };
    await fs.writeJson(CONFIG_PATH, updatedConfig, { spaces: 2 });
    return updatedConfig;
  } catch (error) {
    console.error('Error saving configuration:', error);
    throw error;
  }
}

/**
 * Update configuration
 * @param {Object} updates Configuration updates
 * @returns {Promise<Object>} Updated configuration
 */
async function updateConfig(updates) {
  try {
    const currentConfig = await loadConfig();
    const updatedConfig = { ...currentConfig, ...updates };
    return await saveConfig(updatedConfig);
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}

/**
 * Get configuration value
 * @param {string} key Configuration key
 * @param {*} defaultValue Default value if key doesn't exist
 * @returns {Promise<*>} Configuration value
 */
async function getConfigValue(key, defaultValue = null) {
  try {
    const config = await loadConfig();
    return config[key] !== undefined ? config[key] : defaultValue;
  } catch (error) {
    console.error(`Error getting configuration value for ${key}:`, error);
    return defaultValue;
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  updateConfig,
  getConfigValue,
  DEFAULT_CONFIG
};
