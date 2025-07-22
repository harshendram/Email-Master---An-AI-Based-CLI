const chalk = require("chalk");
const Table = require("cli-table3");
const notifier = require("node-notifier");
const readline = require("readline");

// Instagram-inspired color palette
const instagramColors = {
  purple: "#833AB4",
  pink: "#FD1D1D",
  orange: "#F77737",
  yellow: "#FCAF45",
  blue: "#405DE6",
};

// Create gradient-like effects using chalk hex colors (ESM-free solution)
const instagramGradient = (text) => {
  const colors = [
    instagramColors.purple,
    instagramColors.pink,
    instagramColors.orange,
    instagramColors.yellow,
  ];
  return text
    .split("")
    .map((char, i) => chalk.hex(colors[i % colors.length])(char))
    .join("");
};

const purpleGradient = (text) => chalk.hex(instagramColors.purple)(text);

const pinkGradient = (text) => chalk.hex(instagramColors.pink)(text);

/**
 * Format priority with color and icon
 * @param {string} priority Email priority
 * @returns {string} Colored priority string with icon
 */
function formatPriority(priority) {
  switch (priority) {
    case "Urgent":
      return pinkGradient("🔴 " + priority);
    case "Important":
      return chalk.hex(instagramColors.orange).bold("🟡 " + priority);
    case "Normal":
      return chalk.hex(instagramColors.blue)("🟢 " + priority);
    default:
      return chalk.gray(priority);
  }
}

/**
 * Format confidence score with color
 * @param {number} score Confidence score (0-100)
 * @returns {string} Colored confidence score
 */
function formatConfidence(score) {
  if (score >= 80) {
    return chalk.hex(instagramColors.yellow).bold(`${score}%`);
  } else if (score >= 50) {
    return chalk.hex(instagramColors.orange)(`${score}%`);
  } else {
    return chalk.hex(instagramColors.pink)(`${score}%`);
  }
}

/**
 * Create a modern box with title using Instagram colors
 * @param {string} title Box title
 * @returns {string} Modern styled box with title
 */
function createTitleBox(title) {
  const width = Math.max(title.length + 6, 30);
  const topLine = "╔" + "═".repeat(width) + "╗";
  const bottomLine = "╚" + "═".repeat(width) + "╝";
  const titleLine = `║ ${instagramGradient(title.padEnd(width - 2))} ║`;

  return `\n${purpleGradient(topLine)}\n${titleLine}\n${purpleGradient(
    bottomLine
  )}\n`;
}

/**
 * Create a success message with modern styling
 * @param {string} message Success message
 * @returns {string} Formatted success message
 */
function createSuccessMessage(message) {
  return chalk.hex(instagramColors.yellow).bold(`✅ ${message}`);
}

/**
 * Create an error message with modern styling
 * @param {string} message Error message
 * @returns {string} Formatted error message
 */
function createErrorMessage(message) {
  return pinkGradient(`🚨 ${message}`);
}

/**
 * Create a warning message with modern styling
 * @param {string} message Warning message
 * @returns {string} Formatted warning message
 */
function createWarningMessage(message) {
  return chalk.hex(instagramColors.orange).bold(`⚠️  ${message}`);
}

/**
 * Create an info message with modern styling
 * @param {string} message Info message
 * @returns {string} Formatted info message
 */
function createInfoMessage(message) {
  return chalk.hex(instagramColors.blue)(`ℹ️  ${message}`);
}

/**
 * Create a loading spinner message with gradient
 * @param {string} message Loading message
 * @returns {string} Formatted loading message
 */
function createLoadingMessage(message) {
  return purpleGradient(`⏳ ${message}`);
}

/**
 * Create a modern separator line
 * @returns {string} Gradient separator
 */
function createSeparator() {
  return instagramGradient("═".repeat(50));
}

/**
 * Create a modern help table for commands
 * @param {Array} headers Array of header strings
 * @param {Array} data Array of data rows
 * @returns {Table} Formatted table object
 */
function createModernTable(headers, data) {
  const table = new Table({
    head: headers.map((header) =>
      chalk.hex(instagramColors.purple).bold(header)
    ),
    style: {
      head: [],
      border: [chalk.hex(instagramColors.blue)],
      "padding-left": 2,
      "padding-right": 2,
    },
    colWidths: [40, 30, 100],
    chars: {
      top: "═",
      "top-mid": "╤",
      "top-left": "╔",
      "top-right": "╗",
      bottom: "═",
      "bottom-mid": "╧",
      "bottom-left": "╚",
      "bottom-right": "╝",
      left: "║",
      "left-mid": "╟",
      mid: "─",
      "mid-mid": "┼",
      right: "║",
      "right-mid": "╢",
      middle: "│",
    },
  });

  // Handle both array data and object data
  if (data && data.length > 0) {
    data.forEach((row) => {
      if (Array.isArray(row)) {
        // Array format: [command, description, icon]
        table.push([
          chalk.hex(instagramColors.yellow).bold(row[0] || ""),
          chalk.hex(instagramColors.blue)(row[1] || ""),
          chalk.gray(row[2] || ""),
        ]);
      } else if (typeof row === "object" && row.command) {
        // Object format: {command, description, example}
        table.push([
          chalk.hex(instagramColors.yellow).bold(row.command),
          chalk.hex(instagramColors.blue)(row.description),
          chalk.gray(row.example),
        ]);
      }
    });
  }

  return table;
}

/**
 * Create modern ASCII art with Instagram gradient
 * @returns {string} Colored ASCII art
 */
function createModernAsciiArt() {
  const art = `
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║    ███████╗███╗   ███╗ █████╗ ██╗██╗         ███╗   ███╗ █████╗     ║
║    ██╔════╝████╗ ████║██╔══██╗██║██║         ████╗ ████║██╔══██╗    ║
║    █████╗  ██╔████╔██║███████║██║██║         ██╔████╔██║███████║    ║
║    ██╔══╝  ██║╚██╔╝██║██╔══██║██║██║         ██║╚██╔╝██║██╔══██║    ║
║    ███████╗██║ ╚═╝ ██║██║  ██║██║███████╗    ██║ ╚═╝ ██║██║  ██║    ║
║    ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝    ╚═╝     ╚═╝╚═╝  ╚═╝    ║
║                                                                      ║
║    ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗              ║
║    ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗             ║
║    ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝             ║
║    ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗             ║
║    ██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║             ║
║    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝             ║
║                                                                      ║
║              🚀 AI-Powered Gmail Management CLI 🚀                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝`;

  return instagramGradient(art);
}

/**
 * Create a separator line
 * @returns {string} Separator line
 */
function createSeparator() {
  return chalk.dim("━".repeat(50));
}

/**
 * Create a section title
 * @param {string} title Section title
 * @returns {string} Formatted section title
 */
function createSectionTitle(title) {
  return chalk.bold(title);
}

/**
 * Simulate typing effect
 * @param {string} text Text to display with typing effect
 * @param {number} speed Typing speed in milliseconds
 */
async function typeText(text, speed = 10) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      process.stdout.write(text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        process.stdout.write("\n");
        rl.close();
        resolve();
      }
    }, speed);
  });
}

/**
 * Show loading animation
 * @param {string} message Loading message
 * @param {number} duration Duration in milliseconds
 */
async function showLoading(message, duration = 1500) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  process.stdout.write(message);

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      process.stdout.write(`\r${message} ${frames[i]} `);
      i = (i + 1) % frames.length;
    }, 80);

    setTimeout(() => {
      clearInterval(timer);
      process.stdout.write(`\r${message} ${chalk.green("✓")}\n`);
      resolve();
    }, duration);
  });
}

/**
 * Display email in CLI
 * @param {Object} email Analyzed email object
 * @param {number} index Email index number
 * @param {string} uniqueId Email unique identifier
 */
function displayEmail(email, index, uniqueId) {
  const emailRef =
    index && uniqueId
      ? ` (#${index} | ID: ${uniqueId.substring(0, 8)}...)`
      : "";
  const title = `📄 Email${emailRef}: ${email.subject}`;
  console.log(createTitleBox(title));

  // Email header
  console.log(`🔹 ${chalk.dim("From:")} ${email.from}`);
  console.log(
    `🔹 ${chalk.dim("Date:")} ${
      typeof email.date === "string" ? email.date : email.date.toLocaleString()
    }`
  );

  // Show reference information
  if (index && uniqueId) {
    console.log(
      `🔹 ${chalk.dim("Reference:")} #${index} (ID: ${chalk.cyan(
        uniqueId.substring(0, 12)
      )})`
    );
  }

  // Only show classification if it exists (analyzed emails)
  if (email.classification && email.classification.priority) {
    console.log(
      `🔹 ${chalk.dim("Priority:")} ${formatPriority(
        email.classification.priority
      )}`
    );

    console.log(createSeparator());

    // Classification
    console.log(createSectionTitle("Classification:"));
    console.log(
      `${chalk.dim("Type:")} ${chalk.cyan(email.classification.type)}`
    );
    console.log(
      `${chalk.dim("Action Required:")} ${
        email.classification.actionRequired
          ? chalk.yellow.bold("Yes")
          : chalk.green("No")
      } (${formatConfidence(email.classification.actionConfidence)})`
    );

    // Action items
    if (
      email.classification.actionItems &&
      email.classification.actionItems.length > 0
    ) {
      console.log("\n" + createSectionTitle("Action Items:"));
      email.classification.actionItems.forEach((item, index) => {
        console.log(`${["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][index] || "•"} ${item}`);
      });
    }

    console.log(createSeparator());
  } else {
    console.log(
      chalk.dim(
        'ℹ️ Run "emailmaster analyze" to see AI classification for this email.'
      )
    );
    console.log(createSeparator());
  }

  // Summary
  console.log(createSectionTitle("Summary:"));

  if (email.summary && email.summary.summary) {
    if (Array.isArray(email.summary.summary)) {
      email.summary.summary.forEach((point) => {
        console.log(`${chalk.blue(">")} ${point}`);
      });
    } else {
      console.log(`${chalk.blue(">")} ${email.summary.summary}`);
    }

    // Key points
    if (email.summary.keyPoints && email.summary.keyPoints.length > 0) {
      console.log("\n" + createSectionTitle("Key Points:"));
      email.summary.keyPoints.forEach((point) => {
        console.log(`${chalk.green("•")} ${point}`);
      });
    }

    // Deadlines
    if (email.summary.deadlines && email.summary.deadlines.length > 0) {
      console.log("\n" + createSectionTitle("Deadlines:"));
      email.summary.deadlines.forEach((deadline) => {
        console.log(`${chalk.red("•")} ${deadline}`);
      });
    }

    if (email.summary.estimatedReadingTime) {
      console.log(
        `\n${chalk.dim("Estimated Reading Time:")} ${chalk.cyan(
          email.summary.estimatedReadingTime
        )} minute(s)`
      );
    }
  } else {
    // Fallback to email snippet or basic info
    const snippet = email.snippet || email.body || "No summary available";
    console.log(
      `${chalk.blue(">")} ${snippet.substring(0, 200)}${
        snippet.length > 200 ? "..." : ""
      }`
    );
    console.log(
      chalk.dim('ℹ️ Run "emailmaster analyze" to generate AI summary.')
    );
  }

  console.log(createSeparator());

  // Suggested response
  if (email.suggestedResponse && email.suggestedResponse !== "undefined") {
    console.log(createSectionTitle("Suggested Response:"));
    console.log(chalk.dim("───────────────────────────────────────"));
    console.log(chalk.italic(email.suggestedResponse));
    console.log(chalk.dim("───────────────────────────────────────"));
  } else {
    console.log(createSectionTitle("Suggested Response:"));
    console.log(chalk.dim("───────────────────────────────────────"));
    console.log(
      chalk.italic(
        "No suggested response available. Run 'emailmaster analyze' to generate AI insights."
      )
    );
    console.log(chalk.dim("───────────────────────────────────────"));
  }
}

/**
 * Display dashboard of analyzed emails
 * @param {Array} emails Array of analyzed emails
 */
function displayDashboard(emails) {
  console.log(createTitleBox("📊 Inbox Health Dashboard"));

  // Create table for email summary
  const table = new Table({
    head: [
      chalk.bold("Priority"),
      chalk.bold("Subject"),
      chalk.bold("From"),
      chalk.bold("Action Required"),
      chalk.bold("Reading Time"),
    ],
    style: {
      head: [], // Disable colors in header
      border: [], // Disable colors for borders
    },
  });

  // Add emails to table
  emails.forEach((email) => {
    table.push([
      formatPriority(email.classification.priority),
      email.subject.length > 27
        ? email.subject.substring(0, 24) + "..."
        : email.subject,
      email.from.length > 22 ? email.from.substring(0, 19) + "..." : email.from,
      email.classification.actionRequired
        ? chalk.yellow("Yes ✓")
        : chalk.green("No"),
      `${email.summary.estimatedReadingTime} min`,
    ]);
  });

  console.log(table.toString());

  // Display counts by priority
  const priorityCounts = {
    Urgent: 0,
    Important: 0,
    Normal: 0,
  };

  emails.forEach((email) => {
    priorityCounts[email.classification.priority]++;
  });

  console.log("\n" + createSectionTitle("Email Counts:"));
  console.log(`${chalk.red("Urgent:")} ${priorityCounts.Urgent}`);
  console.log(`${chalk.yellow("Important:")} ${priorityCounts.Important}`);
  console.log(`${chalk.green("Normal:")} ${priorityCounts.Normal}`);
  console.log(`${chalk.blue("Total:")} ${emails.length}`);
}

/**
 * Display daily summary report
 * @param {Object} summary Daily summary report
 */
function displayDailySummary(summary) {
  console.log(createTitleBox("📅 Daily Email Summary"));

  console.log(`${chalk.dim("Date:")} ${summary.date.toLocaleDateString()}`);
  console.log(`${chalk.dim("Total Emails:")} ${summary.totalEmails}`);

  // Display priority counts
  console.log("\n" + createSectionTitle("Email Counts:"));
  console.log(`${chalk.red("Urgent:")} ${summary.priorityCounts.Urgent}`);
  console.log(
    `${chalk.yellow("Important:")} ${summary.priorityCounts.Important}`
  );
  console.log(`${chalk.green("Normal:")} ${summary.priorityCounts.Normal}`);

  // Display actionable emails
  if (summary.actionableEmails.length > 0) {
    console.log("\n" + createSectionTitle("Actionable Emails:"));
    const actionTable = new Table({
      head: [
        chalk.bold("Priority"),
        chalk.bold("Subject"),
        chalk.bold("From"),
        chalk.bold("Action Items"),
      ],
      style: {
        head: [], // Disable colors in header
        border: [], // Disable colors for borders
      },
    });

    summary.actionableEmails.forEach((email) => {
      actionTable.push([
        formatPriority(email.priority),
        email.subject.length > 22
          ? email.subject.substring(0, 19) + "..."
          : email.subject,
        email.from.length > 17
          ? email.from.substring(0, 14) + "..."
          : email.from,
        email.actionItems.join(", ").length > 27
          ? email.actionItems.join(", ").substring(0, 24) + "..."
          : email.actionItems.join(", "),
      ]);
    });

    console.log(actionTable.toString());
  }

  // Display time-sensitive emails
  if (summary.timeSensitiveEmails.length > 0) {
    console.log("\n" + createSectionTitle("Time-Sensitive Emails:"));
    const timeTable = new Table({
      head: [
        chalk.bold("Priority"),
        chalk.bold("Subject"),
        chalk.bold("From"),
        chalk.bold("Deadlines"),
      ],
      style: {
        head: [], // Disable colors in header
        border: [], // Disable colors for borders
      },
    });

    summary.timeSensitiveEmails.forEach((email) => {
      timeTable.push([
        formatPriority(email.priority),
        email.subject.length > 22
          ? email.subject.substring(0, 19) + "..."
          : email.subject,
        email.from.length > 17
          ? email.from.substring(0, 14) + "..."
          : email.from,
        email.deadlines.join(", ").length > 27
          ? email.deadlines.join(", ").substring(0, 24) + "..."
          : email.deadlines.join(", "),
      ]);
    });

    console.log(timeTable.toString());
  }
}

/**
 * Send desktop notification for urgent emails
 * @param {Array} emails Array of analyzed emails
 */
function sendNotifications(emails) {
  // Check if notifications are enabled in .env
  const notificationsEnabled = process.env.NOTIFICATIONS_ENABLED !== "false";

  if (!notificationsEnabled) {
    return;
  }

  const urgentEmails = emails.filter(
    (email) => email.classification.priority === "Urgent"
  );

  if (urgentEmails.length > 0) {
    notifier.notify({
      title: `📬 ${urgentEmails.length} Urgent Email${
        urgentEmails.length > 1 ? "s" : ""
      }`,
      message: urgentEmails.map((email) => email.subject).join("\n"),
      icon: null,
      sound: true,
    });
  }
}

module.exports = {
  displayEmail,
  displayDashboard,
  displayDailySummary,
  sendNotifications,
  showLoading,
  typeText,
  createTitleBox,
  createSeparator,
  formatPriority,
  formatConfidence,
  createSuccessMessage,
  createErrorMessage,
  createWarningMessage,
  createInfoMessage,
  createLoadingMessage,
  createModernTable,
  createModernAsciiArt,
  instagramGradient,
  purpleGradient,
  pinkGradient,
};
