/**
 * Account Manager Module
 * Handles Gmail account management
 */
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { google } = require("googleapis");
const {
  authenticate,
  getGmailClient,
  getUserProfile,
  TOKENS_DIR,
} = require("../auth/gmailAuth");
require("dotenv").config();

// Get accounts config path
const ACCOUNTS_CONFIG_PATH = path.join(process.cwd(), "accounts.json");

/**
 * Load accounts configuration
 * @returns {Promise<Object>} Accounts configuration
 */
async function loadAccountsConfig() {
  try {
    await fs.ensureFile(ACCOUNTS_CONFIG_PATH);
    const configData = await fs.readFile(ACCOUNTS_CONFIG_PATH, "utf8");

    if (!configData || configData.trim() === "") {
      // Initialize with default structure if file is empty
      const defaultConfig = {
        accounts: [],
        currentAccount: null,
      };
      await fs.writeJson(ACCOUNTS_CONFIG_PATH, defaultConfig, { spaces: 2 });
      return defaultConfig;
    }

    return JSON.parse(configData);
  } catch (error) {
    console.error(
      chalk.red("Error loading accounts configuration:"),
      error.message
    );
    // Return default configuration on error
    return {
      accounts: [],
      currentAccount: null,
    };
  }
}

/**
 * Save accounts configuration
 * @param {Object} config Accounts configuration
 */
async function saveAccountsConfig(config) {
  try {
    await fs.writeJson(ACCOUNTS_CONFIG_PATH, config, { spaces: 2 });
  } catch (error) {
    console.error(
      chalk.red("Error saving accounts configuration:"),
      error.message
    );
    throw error;
  }
}

/**
 * Add a new Gmail account via OAuth
 * @param {string} nickname Optional nickname for the account
 * @returns {Promise<Object>} Added account
 */
async function addAccount(nickname) {
  try {
    const config = await loadAccountsConfig();

    // Create tokens directory if it doesn't exist
    await fs.ensureDir(TOKENS_DIR);

    // Start OAuth flow to get user consent
    console.log(chalk.blue("\n🔄 Starting OAuth authentication flow..."));

    // Use a temporary token path for authentication
    const tempTokenPath = path.join(TOKENS_DIR, "temp_token.json");

    // Force new authentication
    const auth = await authenticate(tempTokenPath, true);

    // Get Gmail client
    const gmail = google.gmail({ version: "v1", auth });

    // Get user profile to determine email address
    const profile = await getUserProfile(gmail);
    const email = profile.emailAddress;

    // Use email as name if no nickname provided
    const accountName = nickname || email.split("@")[0];

    // Check if account with same name or email already exists
    if (config.accounts.some((account) => account.name === accountName)) {
      throw new Error(`Account with name "${accountName}" already exists`);
    }

    if (config.accounts.some((account) => account.email === email)) {
      throw new Error(`Account with email "${email}" already exists`);
    }

    // Move the temp token to a permanent location
    const tokenPath = path.join(TOKENS_DIR, `${accountName}.json`);
    await fs.move(tempTokenPath, tokenPath, { overwrite: true });

    // Add new account
    const newAccount = {
      name: accountName,
      email: email,
      tokenPath: path.relative(process.cwd(), tokenPath),
      addedAt: new Date().toISOString(),
    };

    config.accounts.push(newAccount);

    // Set as current account if it's the first one
    if (!config.currentAccount || config.accounts.length === 1) {
      config.currentAccount = accountName;
    }

    await saveAccountsConfig(config);

    return newAccount;
  } catch (error) {
    console.error(chalk.red("Error adding account:"), error.message);
    throw error;
  }
}

/**
 * Remove a Gmail account
 * @param {string} nameOrEmail Account name or email
 * @returns {Promise<boolean>} Success status
 */
async function removeAccount(nameOrEmail) {
  try {
    const config = await loadAccountsConfig();

    // Find account index by name or email
    const accountIndex = config.accounts.findIndex(
      (account) => account.name === nameOrEmail || account.email === nameOrEmail
    );

    if (accountIndex === -1) {
      throw new Error(`Account "${nameOrEmail}" not found`);
    }

    const account = config.accounts[accountIndex];

    // Remove account
    config.accounts.splice(accountIndex, 1);

    // Update current account if removed account was current
    if (config.currentAccount === account.name) {
      config.currentAccount =
        config.accounts.length > 0 ? config.accounts[0].name : null;
    }

    // Try to remove token file
    try {
      const tokenPath = path.join(process.cwd(), account.tokenPath);
      await fs.remove(tokenPath);
    } catch (err) {
      // Ignore error if token file doesn't exist
      console.log(
        chalk.yellow(`Note: Could not remove token file for ${account.name}`)
      );
    }

    await saveAccountsConfig(config);
    return true;
  } catch (error) {
    console.error(chalk.red("Error removing account:"), error.message);
    throw error;
  }
}

/**
 * Switch to a different Gmail account
 * @param {string} nameOrEmail Account name or email
 * @returns {Promise<Object>} Selected account
 */
async function switchAccount(nameOrEmail) {
  try {
    const config = await loadAccountsConfig();

    // Find account by name or email
    const account = config.accounts.find(
      (account) => account.name === nameOrEmail || account.email === nameOrEmail
    );

    if (!account) {
      throw new Error(`Account "${nameOrEmail}" not found`);
    }

    // Set as current account
    config.currentAccount = account.name;

    await saveAccountsConfig(config);
    return account;
  } catch (error) {
    console.error(chalk.red("Error switching account:"), error.message);
    throw error;
  }
}

/**
 * Get current Gmail account
 * @returns {Promise<Object>} Current account
 */
async function getCurrentAccount() {
  try {
    const config = await loadAccountsConfig();

    if (!config.currentAccount) {
      if (config.accounts.length > 0) {
        // Set first account as current if there's no current account but accounts exist
        config.currentAccount = config.accounts[0].name;
        await saveAccountsConfig(config);
        return config.accounts[0];
      }

      throw new Error(
        'No accounts configured. Please add an account first with "emailmaster account-add"'
      );
    }

    const account = config.accounts.find(
      (account) => account.name === config.currentAccount
    );
    if (!account) {
      throw new Error(`Current account "${config.currentAccount}" not found`);
    }

    return account;
  } catch (error) {
    console.error(chalk.red("Error getting current account:"), error.message);
    throw error;
  }
}

/**
 * Display accounts in CLI
 */
async function displayAccounts() {
  try {
    const config = await loadAccountsConfig();
    const accounts = config.accounts;

    if (accounts.length === 0) {
      console.log(chalk.yellow("No Gmail accounts configured."));
      console.log(
        chalk.yellow('Use "emailmaster account-add" to add an account.')
      );
      return;
    }

    console.log(chalk.bold.blue("\n📧 CONFIGURED GMAIL ACCOUNTS") + "\n");

    accounts.forEach((account, index) => {
      const isCurrent = account.name === config.currentAccount;
      const prefix = isCurrent ? chalk.green("* ") : "  ";

      console.log(`${prefix}${index + 1}. ${chalk.bold(account.name)}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Added: ${new Date(account.addedAt).toLocaleString()}`);
      console.log();
    });

    console.log(
      `Current account: ${chalk.green(config.currentAccount || "None")}`
    );
  } catch (error) {
    console.error(chalk.red("Error displaying accounts:"), error.message);
  }
}

/**
 * Ensure an account exists, prompting for authentication if needed
 * @returns {Promise<Object>} Current account
 */
async function ensureAccount() {
  try {
    const config = await loadAccountsConfig();

    // If no accounts exist, prompt to add one
    if (config.accounts.length === 0) {
      console.log(
        chalk.yellow("No accounts configured. Setting up authentication...")
      );
      await addAccount();
      return getCurrentAccount();
    }

    return getCurrentAccount();
  } catch (error) {
    console.error(chalk.red("Error ensuring account:"), error.message);
    throw error;
  }
}

module.exports = {
  loadAccountsConfig,
  saveAccountsConfig,
  addAccount,
  removeAccount,
  switchAccount,
  getCurrentAccount,
  displayAccounts,
  ensureAccount,
};
