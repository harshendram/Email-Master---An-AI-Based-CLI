const { getGmailClient } = require("../auth/gmailAuth");
const { getCurrentAccount } = require("../utils/accountManager");
const { updateEmailMapping } = require("../utils/emailIdManager");
const fs = require("fs-extra");
const path = require("path");

/**
 * Decode base64 encoded email content
 * @param {string} encodedBody Base64 encoded email body
 * @returns {string} Decoded email body
 */
function decodeBase64(encodedBody) {
  return Buffer.from(encodedBody, "base64").toString("utf-8");
}

/**
 * Extract email headers
 * @param {Object} headers Email headers array
 * @param {string} name Header name to extract
 * @returns {string} Header value or empty string
 */
function getHeader(headers, name) {
  const header = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header ? header.value : "";
}

/**
 * Parse email message
 * @param {Object} message Raw email message
 * @returns {Object} Parsed email object
 */
function parseMessage(message) {
  const payload = message.payload;
  const headers = payload.headers;

  // Extract email metadata
  const subject = getHeader(headers, "Subject");
  const from = getHeader(headers, "From");
  const to = getHeader(headers, "To");
  const date = getHeader(headers, "Date");

  // Extract email body
  let body = "";

  if (payload.parts) {
    // Multipart email
    const textPart = payload.parts.find(
      (part) => part.mimeType === "text/plain" || part.mimeType === "text/html"
    );

    if (textPart && textPart.body.data) {
      body = decodeBase64(textPart.body.data);
    }
  } else if (payload.body && payload.body.data) {
    // Simple email
    body = decodeBase64(payload.body.data);
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date: new Date(date),
    body,
    snippet: message.snippet,
    raw: message, // Keep raw message for reference
  };
}

/**
 * Load cache metadata
 * @returns {Promise<Object>} Cache metadata
 */
async function loadCacheMetadata() {
  const fs = require("fs-extra");
  const path = require("path");
  const { loadConfig } = require("../utils/configUtils");

  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const metadataPath = path.join(tempDir, "cache_metadata.json");

    if (await fs.pathExists(metadataPath)) {
      return await fs.readJson(metadataPath);
    }

    return { lastFetchedId: null, lastFetchedTimestamp: null };
  } catch (error) {
    console.error("Error loading cache metadata:", error);
    return { lastFetchedId: null, lastFetchedTimestamp: null };
  }
}

/**
 * Save cache metadata
 * @param {Object} metadata Cache metadata
 * @returns {Promise<void>}
 */
async function saveCacheMetadata(metadata) {
  const fs = require("fs-extra");
  const path = require("path");
  const { loadConfig } = require("../utils/configUtils");

  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const metadataPath = path.join(tempDir, "cache_metadata.json");

    await fs.ensureDir(tempDir);
    await fs.writeJson(metadataPath, metadata, { spaces: 2 });
  } catch (error) {
    console.error("Error saving cache metadata:", error);
    throw error;
  }
}

/**
 * Load cached emails
 * @returns {Promise<Array>} Cached emails
 */
async function loadCachedEmails() {
  const fs = require("fs-extra");
  const path = require("path");
  const { loadConfig } = require("../utils/configUtils");

  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const emailsPath = path.join(tempDir, "emails.json");

    if (await fs.pathExists(emailsPath)) {
      return await fs.readJson(emailsPath);
    }

    return [];
  } catch (error) {
    console.error("Error loading cached emails:", error);
    return [];
  }
}

/**
 * Save emails to cache
 * @param {Array} emails Emails to cache
 * @returns {Promise<void>}
 */
async function saveEmailsToCache(emails) {
  const fs = require("fs-extra");
  const path = require("path");
  const { loadConfig } = require("../utils/configUtils");

  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const emailsPath = path.join(tempDir, "emails.json");

    await fs.ensureDir(tempDir);
    await fs.writeJson(emailsPath, emails, { spaces: 2 });
  } catch (error) {
    console.error("Error saving emails to cache:", error);
    throw error;
  }
}

/**
 * Fetch emails from Gmail
 * @param {number} maxResults Maximum number of emails to fetch
 * @returns {Promise<Array>} Array of parsed email objects
 */
async function fetchEmails(maxResults = 10) {
  try {
    // Get current account to use the correct token
    const currentAccount = await getCurrentAccount();
    const tokenPath = path.join(process.cwd(), currentAccount.tokenPath);

    const gmail = await getGmailClient(tokenPath);
    const metadata = await loadCacheMetadata();
    const cachedEmails = await loadCachedEmails();

    // Build query to fetch only new emails
    let query = "in:inbox";
    if (metadata.lastFetchedTimestamp) {
      // Convert timestamp to seconds for Gmail API query
      const timestamp = Math.floor(
        new Date(metadata.lastFetchedTimestamp).getTime() / 1000
      );
      query += ` after:${timestamp}`;
    }

    // List messages in user's inbox
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: maxResults,
      q: query,
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      console.log("No new emails found since last fetch.");
      // Ensure cached emails have unique IDs and indices
      const { emails: emailsWithIds } = await updateEmailMapping(cachedEmails);
      await saveEmailsToCache(emailsWithIds);
      return emailsWithIds;
    }

    // Fetch full message details for each email
    const newEmails = await Promise.all(
      messages.map(async (message) => {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        return parseMessage(res.data);
      })
    );

    // Update cache metadata with the most recent email's ID and timestamp
    if (newEmails.length > 0) {
      // Sort emails by date (newest first)
      newEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

      const newestEmail = newEmails[0];
      await saveCacheMetadata({
        lastFetchedId: newestEmail.id,
        lastFetchedTimestamp: new Date(newestEmail.date).toISOString(),
      });
    }

    // Combine cached emails with new emails, avoiding duplicates
    const newEmailIds = new Set(newEmails.map((email) => email.id));
    const uniqueCachedEmails = cachedEmails.filter(
      (email) => !newEmailIds.has(email.id)
    );
    const allEmails = [...newEmails, ...uniqueCachedEmails];

    // Update email mapping with unique IDs and persistent indices
    const { emails: emailsWithIds } = await updateEmailMapping(allEmails);

    // Save all emails to cache
    await saveEmailsToCache(emailsWithIds);

    return emailsWithIds;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

module.exports = {
  fetchEmails,
};
