const { analyzeEmails: analyzeEmailsAI } = require("../ai/geminiAI");

/**
 * Analyze a single email
 * @param {Object} email Email object
 * @returns {Promise<Object>} Analyzed email with classification, summary, and suggested response
 */
async function analyzeEmail(email) {
  try {
    // For single email, use the batch function with array of one email
    const results = await analyzeEmailsAI([email]);
    return results[0];
  } catch (error) {
    console.error(`Error analyzing email "${email.subject}":`, error.message);
    // Return email with basic analysis if AI fails
    return {
      ...email,
      classification: {
        priority: "medium",
        priorityConfidence: 0,
        type: "general",
        actionRequired: false,
        actionConfidence: 0,
        actionItems: [],
      },
      summary: {
        summary: ["Unable to generate summary"],
        keyPoints: [],
        deadlines: [],
        estimatedReadingTime: 1,
      },
      suggestedResponse: "Unable to generate response.",
    };
  }
}

/**
 * Analyze multiple emails
 * @param {Array} emails Array of email objects
 * @returns {Promise<Array>} Array of analyzed emails
 */
async function analyzeEmails(emails) {
  console.log(`Analyzing ${emails.length} emails...`);

  // Process emails in batches to avoid overwhelming the AI service
  const batchSize = 3;
  const analyzedEmails = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(analyzeEmail));
    analyzedEmails.push(...batchResults);

    console.log(
      `Analyzed ${Math.min(i + batchSize, emails.length)} of ${
        emails.length
      } emails`
    );
  }

  // Sort emails by priority
  return analyzedEmails.sort((a, b) => {
    const priorityOrder = { Urgent: 0, Important: 1, Normal: 2 };
    return (
      priorityOrder[a.classification.priority] -
      priorityOrder[b.classification.priority]
    );
  });
}

/**
 * Generate daily summary report
 * @param {Array} analyzedEmails Array of analyzed emails
 * @returns {Object} Daily summary report
 */
function generateDailySummary(analyzedEmails) {
  // Count emails by priority
  const priorityCounts = {
    Urgent: 0,
    Important: 0,
    Normal: 0,
  };

  // Find actionable emails
  const actionableEmails = [];

  // Find time-sensitive emails
  const timeSensitiveEmails = [];

  analyzedEmails.forEach((email) => {
    const priority = email.classification.priority;
    priorityCounts[priority]++;

    if (email.classification.actionRequired) {
      actionableEmails.push({
        subject: email.subject,
        from: email.from,
        priority,
        actionItems: email.classification.actionItems,
      });
    }

    if (email.summary.deadlines && email.summary.deadlines.length > 0) {
      timeSensitiveEmails.push({
        subject: email.subject,
        from: email.from,
        priority,
        deadlines: email.summary.deadlines,
      });
    }
  });

  return {
    date: new Date(),
    totalEmails: analyzedEmails.length,
    priorityCounts,
    actionableEmails,
    timeSensitiveEmails,
  };
}

module.exports = {
  analyzeEmail,
  analyzeEmails,
  generateDailySummary,
};
