const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const { loadConfig } = require("./configUtils");

/**
 * Generate a unique identifier for an email
 * @param {Object} email Email object
 * @returns {string} Unique identifier
 */
function generateEmailId(email) {
  // Use Message-ID if available, otherwise create hash from key fields
  if (email.id) {
    // Gmail message ID is already unique
    return email.id;
  }

  // Fallback: create hash from email metadata
  const emailString = `${email.from}|${email.subject}|${email.date}`;
  return crypto
    .createHash("sha256")
    .update(emailString)
    .digest("hex")
    .substring(0, 12);
}

/**
 * Load email ID mapping from cache
 * @returns {Promise<Object>} Email ID mapping
 */
async function loadEmailIdMapping() {
  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const mappingPath = path.join(tempDir, "email_id_mapping.json");

    if (await fs.pathExists(mappingPath)) {
      return await fs.readJson(mappingPath);
    }

    return { indexToId: {}, idToIndex: {}, nextIndex: 1 };
  } catch (error) {
    console.error("Error loading email ID mapping:", error);
    return { indexToId: {}, idToIndex: {}, nextIndex: 1 };
  }
}

/**
 * Save email ID mapping to cache
 * @param {Object} mapping Email ID mapping
 * @returns {Promise<void>}
 */
async function saveEmailIdMapping(mapping) {
  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const mappingPath = path.join(tempDir, "email_id_mapping.json");

    await fs.ensureDir(tempDir);
    await fs.writeJson(mappingPath, mapping, { spaces: 2 });
  } catch (error) {
    console.error("Error saving email ID mapping:", error);
    throw error;
  }
}

/**
 * Update email ID mapping with new emails
 * @param {Array} emails Array of email objects
 * @returns {Promise<Object>} Updated mapping with assigned indices
 */
async function updateEmailMapping(emails) {
  const mapping = await loadEmailIdMapping();
  const updatedEmails = [];

  emails.forEach((email) => {
    const emailId = generateEmailId(email);

    // Check if this email already has an assigned index
    if (mapping.idToIndex[emailId]) {
      // Email already exists, update with existing index
      updatedEmails.push({
        ...email,
        uniqueId: emailId,
        assignedIndex: mapping.idToIndex[emailId],
      });
    } else {
      // New email, assign next available index
      const newIndex = mapping.nextIndex;
      mapping.indexToId[newIndex] = emailId;
      mapping.idToIndex[emailId] = newIndex;
      mapping.nextIndex++;

      updatedEmails.push({
        ...email,
        uniqueId: emailId,
        assignedIndex: newIndex,
      });
    }
  });

  await saveEmailIdMapping(mapping);
  return { emails: updatedEmails, mapping };
}

/**
 * Find email by index or ID
 * @param {string|number} identifier Email index number or unique ID
 * @param {Array} emails Array of emails
 * @param {Object} mapping Email ID mapping
 * @returns {Object|null} Email object with index, or null if not found
 */
function findEmailByIdentifier(identifier, emails, mapping) {
  let targetIndex;

  // Check if identifier is a number (index)
  if (!isNaN(identifier) && Number.isInteger(Number(identifier))) {
    targetIndex = parseInt(identifier, 10);
  } else {
    // Identifier is a unique ID
    // First try exact match
    targetIndex = mapping.idToIndex[identifier];

    if (!targetIndex) {
      // Try partial match - find ID that starts with the identifier
      const matchingId = Object.keys(mapping.idToIndex).find(
        (id) => id.startsWith(identifier) && identifier.length >= 8 // Minimum 8 chars for safety
      );

      if (matchingId) {
        targetIndex = mapping.idToIndex[matchingId];
      }
    }

    if (!targetIndex) {
      return null; // ID not found
    }
  }

  // Find email by assigned index
  const email = emails.find((e) => e.assignedIndex === targetIndex);
  if (email) {
    return {
      email,
      index: targetIndex,
      uniqueId: email.uniqueId,
    };
  }

  return null;
}

/**
 * Get email reference display (both index and ID)
 * @param {Object} email Email object
 * @returns {string} Formatted reference string
 */
function getEmailReference(email) {
  if (email.assignedIndex && email.uniqueId) {
    return `#${email.assignedIndex} (ID: ${email.uniqueId.substring(0, 8)}...)`;
  }
  return "Unknown";
}

/**
 * Validate and resolve email identifier
 * @param {string} identifier User provided identifier
 * @returns {Object} Validation result with resolved info
 */
async function resolveEmailIdentifier(identifier) {
  try {
    const config = await loadConfig();
    const tempDir = path.join(process.cwd(), config.tempDir || "./temp");
    const emailsPath = path.join(tempDir, "emails.json");

    if (!(await fs.pathExists(emailsPath))) {
      return {
        success: false,
        error: 'No emails found. Run "emailmaster fetch" first.',
      };
    }

    const emails = await fs.readJson(emailsPath);
    const mapping = await loadEmailIdMapping();

    const result = findEmailByIdentifier(identifier, emails, mapping);

    if (!result) {
      return {
        success: false,
        error: `Email not found: ${identifier}. Use "emailmaster list" to see available emails.`,
      };
    }

    return {
      success: true,
      email: result.email,
      index: result.index,
      uniqueId: result.uniqueId,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error resolving email identifier: ${error.message}`,
    };
  }
}

module.exports = {
  generateEmailId,
  loadEmailIdMapping,
  saveEmailIdMapping,
  updateEmailMapping,
  findEmailByIdentifier,
  getEmailReference,
  resolveEmailIdentifier,
};
