/**
 * Reply Utilities Module
 * Handles email reply functionality
 */
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const { getCurrentAccount } = require('./accountManager');
const { getGmailClient } = require('../auth/gmailAuth');
const { generateFullReplyDraft } = require('../ai/geminiAI');
const { loadConfig } = require('./configUtils');

/**
 * Load cached emails
 * @returns {Promise<Array>} Cached emails
 */
async function loadCachedEmails() {
  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || './temp');
    const emailsPath = path.join(tempDir, 'emails.json');
    
    if (await fs.pathExists(emailsPath)) {
      return await fs.readJson(emailsPath);
    }
    
    return [];
  } catch (error) {
    console.error(chalk.red('Error loading cached emails:'), error.message);
    return [];
  }
}

/**
 * Create a reply email in RFC 2822 format
 * @param {Object} originalEmail The original email to reply to
 * @param {string} replyMessage The reply message content
 * @returns {string} The formatted email
 */
function createReplyEmail(originalEmail, replyMessage) {
  // Extract the sender's email address from the "from" field
  const fromMatch = originalEmail.from.match(/<([^>]+)>/) || [null, originalEmail.from];
  const toEmail = fromMatch[1];
  
  // Create reply subject (add Re: if not already present)
  const subject = originalEmail.subject.startsWith('Re:') 
    ? originalEmail.subject 
    : `Re: ${originalEmail.subject}`;
  
  // Format the date for the email header
  const date = new Date().toUTCString();
  
  // Create email headers
  const headers = [
    `From: ${process.env.USER_EMAIL || 'me'}`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${originalEmail.id}`,
    `References: ${originalEmail.id}`,
    `Date: ${date}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    replyMessage
  ].join('\r\n');
  
  return headers;
}

/**
 * Prompt user for manual reply input
 * @returns {Promise<string>} User's reply message
 */
async function promptForReply() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log(chalk.blue('\n📝 Enter your reply message (type "END" on a new line to finish):\n'));
  
  let message = '';
  let line = '';
  
  return new Promise((resolve) => {
    rl.on('line', (input) => {
      if (input === 'END') {
        rl.close();
        resolve(message);
      } else {
        message += (line ? '\n' : '') + input;
        line = input;
      }
    });
  });
}

/**
 * Generate AI reply draft for an email
 * @param {Object} email The email to reply to
 * @returns {Promise<string>} Generated reply draft
 */
async function generateAIReply(email) {
  try {
    console.log(chalk.blue('🤖 Generating AI reply draft...'));
    const replyDraft = await generateFullReplyDraft(email);
    return replyDraft;
  } catch (error) {
    console.error(chalk.red('Error generating AI reply:'), error.message);
    throw error;
  }
}

/**
 * Send a reply to an email
 * @param {number} emailNumber The index of the email to reply to (1-based)
 * @param {Object} options Reply options
 * @param {boolean} options.ai Whether to use AI to generate the reply
 * @param {boolean} options.send Whether to send the AI-generated reply
 * @param {boolean} options.manual Whether to manually compose the reply
 * @param {string} options.message Custom message for the reply
 * @param {boolean} options.draft Whether to save as draft instead of sending
 * @returns {Promise<Object>} Result of the operation
 */
async function replyToEmail(emailNumber, options = {}) {
  try {
    // Load cached emails
    const emails = await loadCachedEmails();
    
    // Check if email exists
    if (!emails || emails.length === 0) {
      throw new Error('No emails found. Run "emailmaster fetch" first.');
    }
    
    // Convert 1-based index to 0-based
    const index = emailNumber - 1;
    
    if (index < 0 || index >= emails.length) {
      throw new Error(`Email #${emailNumber} not found. Available range: 1-${emails.length}`);
    }
    
    const originalEmail = emails[index];
    let replyMessage = '';
    
    // Determine reply content based on options
    if (options.message) {
      // Use provided message
      replyMessage = options.message;
    } else if (options.ai) {
      // Generate AI reply
      replyMessage = await generateAIReply(originalEmail);
    } else if (options.manual) {
      // Prompt for manual reply
      replyMessage = await promptForReply();
    } else {
      throw new Error('No reply content specified. Use --ai, --manual, or --message options.');
    }
    
    // If we're just generating an AI draft without sending, return it
    if (options.ai && !options.send && !options.draft) {
      return {
        success: true,
        type: 'draft-preview',
        message: replyMessage,
        email: originalEmail
      };
    }
    
    // Create reply email
    const rawEmail = createReplyEmail(originalEmail, replyMessage);
    
    // Base64 encode the email
    const encodedEmail = Buffer.from(rawEmail).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Get current account
    const account = await getCurrentAccount();
    
    // Get token path for the current account
    const tokenPath = path.join(process.cwd(), account.tokenPath);
    
    // Get Gmail client
    const gmail = await getGmailClient(tokenPath);
    
    if (options.draft) {
      // Create a draft
      const response = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encodedEmail,
            threadId: originalEmail.threadId
          }
        }
      });
      
      return {
        success: true,
        type: 'draft',
        id: response.data.id,
        email: originalEmail
      };
    } else {
      // Send the email
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
          threadId: originalEmail.threadId
        }
      });
      
      return {
        success: true,
        type: 'sent',
        id: response.data.id,
        email: originalEmail
      };
    }
  } catch (error) {
    console.error(chalk.red('Error replying to email:'), error.message);
    throw error;
  }
}

module.exports = {
  replyToEmail,
  generateAIReply
};
