/**
 * Gmail Authentication Module
 * Handles OAuth2 authentication with Gmail API
 */
const fs = require('fs-extra');
const path = require('path');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');
const chalk = require('chalk');
const open = require('open');
require('dotenv').config();

// Define scopes for Gmail API
// Include both readonly and modify scopes to support email sending
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];

// Path to credentials file
const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH || path.join(process.cwd(), 'credentials.json');
const TOKENS_DIR = path.join(process.cwd(), 'tokens');

/**
 * Load client credentials from file or environment variables
 * @returns {Promise<Object>} OAuth client credentials
 */
async function loadCredentials() {
  try {
    // Try to load from credentials file first
    if (await fs.pathExists(CREDENTIALS_PATH)) {
      const content = await fs.readFile(CREDENTIALS_PATH);
      const credentials = JSON.parse(content);
      return credentials.installed || credentials.web;
    }
    
    // Fall back to environment variables
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
      return {
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        redirect_uris: [process.env.GMAIL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob']
      };
    }
    
    throw new Error('No credentials found');
  } catch (error) {
    console.error('Error loading credentials:', error);
    throw new Error('Failed to load OAuth credentials. Please ensure credentials.json exists or environment variables are set.');
  }
}

/**
 * Get and store new token after prompting for user authorization
 * @param {OAuth2Client} oAuth2Client The OAuth2 client to get token for
 * @param {string} tokenPath Path to store the token
 * @returns {Promise<OAuth2Client>} Authenticated OAuth2 client
 */
async function getNewToken(oAuth2Client, tokenPath) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force to show the consent screen
    scope: SCOPES,
  });
  
  console.log(chalk.blue('\n🔐 Authorization Required'));
  console.log(chalk.yellow('Please authorize this app by visiting this URL:'));
  console.log(chalk.cyan(authUrl));
  console.log(chalk.yellow('\nThis will allow EmailMaster to access your Gmail account.'));
  
  // Try to open the URL in the default browser
  try {
    await open(authUrl);
    console.log(chalk.green('✓ Opened the authorization URL in your browser.'));
  } catch (err) {
    console.log(chalk.yellow('Could not open the browser automatically. Please open the URL manually.'));
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve, reject) => {
    rl.question(chalk.blue('\nEnter the code from that page here: '), async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        // Ensure directory exists
        await fs.ensureDir(path.dirname(tokenPath));
        
        // Store the token to disk for later program executions
        await fs.writeJson(tokenPath, tokens, { spaces: 2 });
        console.log(chalk.green(`✓ Authentication successful! Token stored to ${tokenPath}`));
        resolve(oAuth2Client);
      } catch (err) {
        console.error(chalk.red('Error retrieving access token:'), err.message);
        reject(err);
      }
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials
 * @param {string} tokenPath Path to token file
 * @param {boolean} forceNew Force new authentication even if token exists
 * @returns {Promise<OAuth2Client>} Authenticated OAuth2 client
 */
async function authenticate(tokenPath, forceNew = false) {
  try {
    // Load client credentials
    const credentials = await loadCredentials();
    
    // Create OAuth client
    const { client_id, client_secret, redirect_uris } = credentials;
    const oAuth2Client = new OAuth2Client(
      client_id, 
      client_secret, 
      redirect_uris[0] || 'urn:ietf:wg:oauth:2.0:oob'
    );

    // If forceNew is true, skip token check and get a new one
    if (forceNew) {
      return getNewToken(oAuth2Client, tokenPath);
    }
    
    try {
      // Check if we have previously stored a token
      const token = await fs.readJson(tokenPath);
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch (err) {
      // Token doesn't exist or is invalid, get a new one
      return getNewToken(oAuth2Client, tokenPath);
    }
  } catch (error) {
    console.error(chalk.red('Authentication error:'), error.message);
    throw error;
  }
}

/**
 * Get authenticated Gmail client
 * @param {string} tokenPath Path to token file
 * @returns {Promise<Object>} Gmail API client
 */
async function getGmailClient(tokenPath) {
  try {
    // Ensure tokens directory exists
    await fs.ensureDir(TOKENS_DIR);
    
    // If no specific token path is provided, use the default
    const actualTokenPath = tokenPath || path.join(TOKENS_DIR, 'default_token.json');
    
    // Authenticate with the token
    const auth = await authenticate(actualTokenPath);
    
    // Return Gmail client
    return google.gmail({ version: 'v1', auth });
  } catch (err) {
    console.error(chalk.red('Error getting Gmail client:'), err.message);
    throw err;
  }
}

/**
 * Get user profile information
 * @param {Object} gmail Gmail API client
 * @returns {Promise<Object>} User profile information
 */
async function getUserProfile(gmail) {
  try {
    const response = await gmail.users.getProfile({ userId: 'me' });
    return response.data;
  } catch (error) {
    console.error(chalk.red('Error getting user profile:'), error.message);
    throw error;
  }
}

module.exports = {
  authenticate,
  getGmailClient,
  getUserProfile,
  loadCredentials,
  TOKENS_DIR
};
