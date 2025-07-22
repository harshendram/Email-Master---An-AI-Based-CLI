const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

// Get reports directory from env or use default
const REPORTS_DIR = process.env.REPORTS_DIR || path.join(__dirname, '../../reports');

/**
 * Generate mood trend report
 * @param {Array} sentimentResults Array of email sentiment analysis results
 * @returns {Object} Mood trend report
 */
function generateMoodTrendReport(sentimentResults) {
  // Count sentiment types
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };
  
  // Count email types
  const typeCounts = {
    appreciation: 0,
    complaint: 0,
    request: 0,
    information: 0,
    other: 0
  };
  
  // Calculate average stress level
  let totalStressLevel = 0;
  
  sentimentResults.forEach(result => {
    sentimentCounts[result.sentiment]++;
    typeCounts[result.type]++;
    totalStressLevel += result.stressLevel;
  });
  
  const averageStressLevel = sentimentResults.length > 0 ? 
    totalStressLevel / sentimentResults.length : 0;
  
  // Determine overall trend
  let overallTrend;
  if (sentimentCounts.positive > sentimentCounts.negative && sentimentCounts.positive > sentimentCounts.neutral) {
    overallTrend = 'Positive';
  } else if (sentimentCounts.negative > sentimentCounts.positive && sentimentCounts.negative > sentimentCounts.neutral) {
    overallTrend = 'Negative';
  } else {
    overallTrend = 'Neutral';
  }
  
  // Determine stress level category
  let stressCategory;
  if (averageStressLevel < 3) {
    stressCategory = 'Low';
  } else if (averageStressLevel < 7) {
    stressCategory = 'Moderate';
  } else {
    stressCategory = 'High';
  }
  
  return {
    date: new Date(),
    totalEmails: sentimentResults.length,
    sentimentCounts,
    typeCounts,
    averageStressLevel,
    overallTrend,
    stressCategory
  };
}

/**
 * Export mood trend report to Markdown
 * @param {Object} report Mood trend report
 * @returns {Promise<string>} Path to exported file
 */
async function exportMoodTrendReport(report) {
  // Ensure reports directory exists
  await fs.ensureDir(REPORTS_DIR);
  
  // Generate filename with timestamp
  const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
  const filename = `mood_trend_${timestamp}.md`;
  const filePath = path.join(REPORTS_DIR, filename);
  
  let markdown = `# Email Mood Trend Report\n\n`;
  markdown += `Generated: ${moment().format('MMMM D, YYYY [at] h:mm A')}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Overall Trend:** ${report.overallTrend}\n`;
  markdown += `- **Stress Level:** ${report.stressCategory} (${report.averageStressLevel.toFixed(1)}/10)\n`;
  markdown += `- **Total Emails Analyzed:** ${report.totalEmails}\n\n`;
  
  markdown += `## Sentiment Distribution\n\n`;
  markdown += `- Positive: ${report.sentimentCounts.positive} (${((report.sentimentCounts.positive / report.totalEmails) * 100).toFixed(1)}%)\n`;
  markdown += `- Neutral: ${report.sentimentCounts.neutral} (${((report.sentimentCounts.neutral / report.totalEmails) * 100).toFixed(1)}%)\n`;
  markdown += `- Negative: ${report.sentimentCounts.negative} (${((report.sentimentCounts.negative / report.totalEmails) * 100).toFixed(1)}%)\n\n`;
  
  markdown += `## Email Type Distribution\n\n`;
  markdown += `- Appreciation: ${report.typeCounts.appreciation} (${((report.typeCounts.appreciation / report.totalEmails) * 100).toFixed(1)}%)\n`;
  markdown += `- Requests: ${report.typeCounts.request} (${((report.typeCounts.request / report.totalEmails) * 100).toFixed(1)}%)\n`;
  markdown += `- Complaints: ${report.typeCounts.complaint} (${((report.typeCounts.complaint / report.totalEmails) * 100).toFixed(1)}%)\n`;
  markdown += `- Information: ${report.typeCounts.information} (${((report.typeCounts.information / report.totalEmails) * 100).toFixed(1)}%)\n`;
  markdown += `- Other: ${report.typeCounts.other} (${((report.typeCounts.other / report.totalEmails) * 100).toFixed(1)}%)\n\n`;
  
  markdown += `## Insights\n\n`;
  
  // Add insights based on the data
  if (report.sentimentCounts.negative > report.sentimentCounts.positive) {
    markdown += `- Your inbox is trending more negative than positive. This might be contributing to stress.\n`;
  }
  
  if (report.typeCounts.request > report.typeCounts.appreciation) {
    markdown += `- You're receiving more requests than appreciation emails, which might increase your workload.\n`;
  }
  
  if (report.averageStressLevel > 6) {
    markdown += `- The high stress level in your emails suggests you might benefit from email management strategies.\n`;
  }
  
  if (report.typeCounts.complaint > (report.totalEmails * 0.3)) {
    markdown += `- You're receiving a significant number of complaints, which might require attention.\n`;
  }
  
  await fs.writeFile(filePath, markdown);
  return filePath;
}

module.exports = {
  generateMoodTrendReport,
  exportMoodTrendReport
};
