const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

// Get reports directory from env or use default
const REPORTS_DIR = process.env.REPORTS_DIR || path.join(__dirname, '../../reports');

/**
 * Ensure reports directory exists
 */
async function ensureReportsDir() {
  await fs.ensureDir(REPORTS_DIR);
}

/**
 * Generate filename with timestamp
 * @param {string} prefix Filename prefix
 * @param {string} extension File extension
 * @returns {string} Filename with timestamp
 */
function generateFilename(prefix, extension) {
  const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Export emails to JSON file
 * @param {Array} emails Array of analyzed emails
 * @returns {Promise<string>} Path to exported file
 */
async function exportToJson(emails) {
  await ensureReportsDir();
  
  const filename = generateFilename('emails', 'json');
  const filePath = path.join(REPORTS_DIR, filename);
  
  // Clean up emails for export (remove raw data)
  const cleanEmails = emails.map(email => {
    const { raw, ...cleanEmail } = email;
    return cleanEmail;
  });
  
  await fs.writeJson(filePath, cleanEmails, { spaces: 2 });
  return filePath;
}

/**
 * Export emails to Markdown file
 * @param {Array} emails Array of analyzed emails
 * @returns {Promise<string>} Path to exported file
 */
async function exportToMarkdown(emails) {
  await ensureReportsDir();
  
  const filename = generateFilename('emails', 'md');
  const filePath = path.join(REPORTS_DIR, filename);
  
  let markdown = `# Email Analysis Report\n\n`;
  markdown += `Generated: ${moment().format('MMMM D, YYYY [at] h:mm A')}\n\n`;
  
  // Add summary table
  markdown += `## Summary\n\n`;
  markdown += `| Priority | Count |\n`;
  markdown += `| -------- | ----- |\n`;
  
  const priorityCounts = {
    Urgent: 0,
    Important: 0,
    Normal: 0
  };
  
  emails.forEach(email => {
    priorityCounts[email.classification.priority]++;
  });
  
  markdown += `| Urgent | ${priorityCounts.Urgent} |\n`;
  markdown += `| Important | ${priorityCounts.Important} |\n`;
  markdown += `| Normal | ${priorityCounts.Normal} |\n`;
  markdown += `| **Total** | **${emails.length}** |\n\n`;
  
  // Add emails by priority
  ['Urgent', 'Important', 'Normal'].forEach(priority => {
    const priorityEmails = emails.filter(email => email.classification.priority === priority);
    
    if (priorityEmails.length > 0) {
      markdown += `## ${priority} Emails (${priorityEmails.length})\n\n`;
      
      priorityEmails.forEach((email, index) => {
        markdown += `### ${index + 1}. ${email.subject}\n\n`;
        markdown += `- **From:** ${email.from}\n`;
        markdown += `- **Date:** ${email.date.toLocaleString()}\n`;
        markdown += `- **Type:** ${email.classification.type}\n`;
        markdown += `- **Action Required:** ${email.classification.actionRequired ? 'Yes' : 'No'}\n\n`;
        
        if (email.classification.actionItems && email.classification.actionItems.length > 0) {
          markdown += `#### Action Items\n\n`;
          email.classification.actionItems.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += '\n';
        }
        
        markdown += `#### Summary\n\n`;
        email.summary.summary.forEach(point => {
          markdown += `- ${point}\n`;
        });
        markdown += '\n';
        
        if (email.summary.keyPoints && email.summary.keyPoints.length > 0) {
          markdown += `#### Key Points\n\n`;
          email.summary.keyPoints.forEach(point => {
            markdown += `- ${point}\n`;
          });
          markdown += '\n';
        }
        
        if (email.summary.deadlines && email.summary.deadlines.length > 0) {
          markdown += `#### Deadlines\n\n`;
          email.summary.deadlines.forEach(deadline => {
            markdown += `- ${deadline}\n`;
          });
          markdown += '\n';
        }
        
        markdown += `#### Suggested Response\n\n`;
        markdown += '```\n';
        markdown += email.suggestedResponse;
        markdown += '\n```\n\n';
        
        markdown += '---\n\n';
      });
    }
  });
  
  await fs.writeFile(filePath, markdown);
  return filePath;
}

/**
 * Export daily summary to Markdown file
 * @param {Object} summary Daily summary object
 * @returns {Promise<string>} Path to exported file
 */
async function exportDailySummary(summary) {
  await ensureReportsDir();
  
  const filename = generateFilename('daily_summary', 'md');
  const filePath = path.join(REPORTS_DIR, filename);
  
  let markdown = `# Daily Email Summary\n\n`;
  markdown += `Date: ${summary.date.toLocaleDateString()}\n\n`;
  
  markdown += `## Email Counts\n\n`;
  markdown += `- Urgent: ${summary.priorityCounts.Urgent}\n`;
  markdown += `- Important: ${summary.priorityCounts.Important}\n`;
  markdown += `- Normal: ${summary.priorityCounts.Normal}\n`;
  markdown += `- **Total: ${summary.totalEmails}**\n\n`;
  
  if (summary.actionableEmails.length > 0) {
    markdown += `## Actionable Emails\n\n`;
    markdown += `| Priority | Subject | From | Action Items |\n`;
    markdown += `| -------- | ------- | ---- | ------------ |\n`;
    
    summary.actionableEmails.forEach(email => {
      markdown += `| ${email.priority} | ${email.subject} | ${email.from} | ${email.actionItems.join(', ')} |\n`;
    });
    
    markdown += '\n';
  }
  
  if (summary.timeSensitiveEmails.length > 0) {
    markdown += `## Time-Sensitive Emails\n\n`;
    markdown += `| Priority | Subject | From | Deadlines |\n`;
    markdown += `| -------- | ------- | ---- | --------- |\n`;
    
    summary.timeSensitiveEmails.forEach(email => {
      markdown += `| ${email.priority} | ${email.subject} | ${email.from} | ${email.deadlines.join(', ')} |\n`;
    });
  }
  
  await fs.writeFile(filePath, markdown);
  return filePath;
}

module.exports = {
  exportToJson,
  exportToMarkdown,
  exportDailySummary
};
