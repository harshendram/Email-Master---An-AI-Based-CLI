#!/usr/bin/env node

/**
 * EmailMaster CLI
 * A modern CLI tool for managing Gmail emails with AI capabilities
 */
const { program } = require("commander");
const { fetchEmails } = require("./src/fetcher/emailFetcher");
const { getGmailClient } = require("./src/auth/gmailAuth");
const {
  analyzeEmails,
  generateDailySummary,
} = require("./src/analyzer/emailAnalyzer");
const {
  displayEmail,
  displayDashboard,
  displayDailySummary,
  sendNotifications,
  showLoading,
  typeText,
  createTitleBox,
  createSuccessMessage,
  createErrorMessage,
  createWarningMessage,
  createInfoMessage,
  createLoadingMessage,
  createModernAsciiArt,
  createSectionTitle,
  instagramGradient,
} = require("./src/ui/cliOutput");
const {
  exportToJson,
  exportToMarkdown,
  exportDailySummary,
} = require("./src/utils/exportUtils");
const {
  analyzeEmails: analyzeEmailsAI,
  extractCalendarEventsFromEmails,
  searchEmailsWithNLP,
  autoTagEmails,
  analyzeEmailSentiment,
  checkNeedsFollowUp,
  generateFullReplyDraft,
  getConfig,
  updateConfig,
} = require("./src/ai/geminiAI");
const {
  generateICSFile,
  generatePlainTextCalendar,
} = require("./src/utils/calendarUtils");
const {
  generateMoodTrendReport,
  exportMoodTrendReport,
} = require("./src/utils/sentimentUtils");
const {
  addAccount,
  removeAccount,
  switchAccount,
  displayAccounts,
  ensureAccount,
  getCurrentAccount,
} = require("./src/utils/accountManager");
const {
  loadConfig,
  saveConfig,
  updateConfig: updateConfigUtils,
} = require("./src/utils/configUtils");
const { replyToEmail } = require("./src/utils/replyUtils");
const {
  fetchAttachments,
  syncAttachments,
  getAttachmentStats,
  formatFileSize,
} = require("./src/attachments/attachmentFetcher");
const {
  resolveEmailIdentifier,
  getEmailReference,
} = require("./src/utils/emailIdManager");
const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const axios = require("axios");
const chalk = require("chalk");
const moment = require("moment");
const {
  generateMainHelp,
  generateCommandHelp,
} = require("./src/ui/helpSystem");
require("dotenv").config();

// Define directories
const REPORTS_DIR = path.join(__dirname, "reports");

/**
 * Display modern ASCII art only for authentication success
 * This function is now only called from account management
 */
async function showAuthenticationSuccessArt() {
  console.log(createModernAsciiArt());
  console.log(
    instagramGradient(
      "🎉 Welcome to EmailMaster CLI! You're all set to manage your emails with AI power! 🚀"
    )
  );
}

// Set up program
program
  .name("emailmaster")
  .version("1.0.0")
  .description("AI-powered Gmail management CLI");

// Help command
program
  .command("help [command]")
  .description("Show help for a specific command")
  .action((commandName) => {
    if (commandName) {
      console.log(generateCommandHelp(commandName));
    } else {
      console.log(generateMainHelp());
    }
  });

// Override the default help
program.addHelpText("beforeAll", generateMainHelp());

// Configuration command
program
  .command("config")
  .description("Configure EmailMaster settings")
  .option("--batch-size <number>", "Set batch size for API calls", parseInt)
  .option(
    "--model <model>",
    "Set AI model (gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash)"
  )
  .option("--temp-dir <path>", "Set temporary directory path")
  .option("--show", "Show current configuration")
  .option("--list-models", "List available AI models")
  .action(async (options) => {
    try {
      if (options.listModels) {
        console.log(createTitleBox("🤖 Available AI Models"));
        console.log(chalk.bold("Google Gemini Models:"));
        console.log("  • gemini-2.0-flash (Default - Fastest)");
        console.log("  • gemini-1.5-pro (Most capable)");
        console.log("  • gemini-1.5-flash (Balanced speed/quality)");
        console.log(
          chalk.gray("\nNote: Claude and OpenAI support coming soon")
        );
        return;
      }

      if (options.show) {
        const config = await loadConfig();
        console.log(createTitleBox("⚙️ EmailMaster Configuration"));
        console.log(chalk.bold("Current Configuration:"));
        console.log(JSON.stringify(config, null, 2));
        return;
      }

      const updates = {};
      if (options.batchSize) updates.batchSize = options.batchSize;
      if (options.model) updates.model = options.model;
      if (options.tempDir) updates.tempDir = options.tempDir;

      if (Object.keys(updates).length === 0) {
        console.log(
          chalk.yellow(
            "No configuration changes specified. Use --help to see available options."
          )
        );
        return;
      }

      await showLoading("Updating configuration", 800);
      const updatedConfig = await updateConfigUtils(updates);
      await updateConfig(updates);

      console.log(chalk.green("✓ Configuration updated successfully:"));
      console.log(JSON.stringify(updatedConfig, null, 2));
    } catch (error) {
      console.error(
        chalk.red("🚨 Error updating configuration:"),
        error.message
      );
      process.exit(1);
    }
  });

// Account management commands
program
  .command("accounts")
  .description("List configured Gmail accounts")
  .action(async () => {
    try {
      await displayAccounts();
    } catch (error) {
      console.error(chalk.red("🚨 Error listing accounts:"), error.message);
      process.exit(1);
    }
  });

program
  .command("account-add")
  .description("Add a new Gmail account via OAuth")
  .option("-n, --name <name>", "Nickname for the account (optional)")
  .action(async (options) => {
    try {
      console.log(createTitleBox("🔑 Add Gmail Account"));

      const account = await addAccount(options.name);

      // Show success ASCII art after successful authentication
      await showAuthenticationSuccessArt();

      console.log(
        chalk.green(
          `✓ Successfully added account: ${account.name} (${account.email})`
        )
      );
      console.log(chalk.blue(`This account is now set as the active account.`));
    } catch (error) {
      console.error(chalk.red("🚨 Error adding account:"), error.message);
      process.exit(1);
    }
  });

program
  .command("account-remove")
  .description("Remove a Gmail account")
  .argument("<name-or-email>", "Account name or email to remove")
  .action(async (nameOrEmail) => {
    try {
      console.log(createTitleBox("❌ Remove Gmail Account"));

      await showLoading("Removing account", 800);
      await removeAccount(nameOrEmail);
      console.log(
        chalk.green(`✓ Successfully removed account: ${nameOrEmail}`)
      );

      // Display remaining accounts
      await displayAccounts();
    } catch (error) {
      console.error(chalk.red("🚨 Error removing account:"), error.message);
      process.exit(1);
    }
  });

program
  .command("account-switch")
  .description("Switch active Gmail account")
  .argument("<name-or-email>", "Account name or email to switch to")
  .action(async (nameOrEmail) => {
    try {
      console.log(createTitleBox("🔄 Switch Gmail Account"));

      await showLoading("Switching account", 800);
      const account = await switchAccount(nameOrEmail);
      console.log(
        chalk.green(`✓ Switched to account: ${account.name} (${account.email})`)
      );
    } catch (error) {
      console.error(chalk.red("🚨 Error switching account:"), error.message);
      process.exit(1);
    }
  });

// Fetch command
program
  .command("fetch")
  .description("Fetch emails from Gmail")
  .option(
    "-m, --max <number>",
    "Maximum number of emails to fetch",
    parseInt,
    10
  )
  .action(async (options) => {
    try {
      console.log(createTitleBox("📥 Fetching Emails"));

      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      await fs.ensureDir(tempDir);

      // Load cached emails to compare count before and after
      const cachedEmailsPath = path.join(tempDir, "emails.json");
      let cachedEmailsCount = 0;
      if (await fs.pathExists(cachedEmailsPath)) {
        const cachedEmails = await fs.readJson(cachedEmailsPath);
        cachedEmailsCount = cachedEmails.length;
      }

      await showLoading("Connecting to Gmail", 1000);
      const emails = await fetchEmails(options.max);

      // Calculate how many new emails were fetched
      const newEmailsCount = emails.length - cachedEmailsCount;

      if (newEmailsCount > 0) {
        console.log(
          chalk.green(`✓ ${newEmailsCount} new emails fetched successfully.`)
        );
      } else {
        console.log(chalk.blue("✓ No new emails found since last fetch."));
      }

      console.log(chalk.gray(`Total emails in cache: ${emails.length}`));

      // Save fetched emails to temporary file
      await showLoading("Saving emails", 800);
      const tempEmailsPath = path.join(tempDir, "emails.json");
      await fs.writeJson(tempEmailsPath, emails, { spaces: 2 });
      console.log(chalk.green("✓ Emails saved to temporary storage."));
      console.log(
        chalk.blue('\nRun "emailmaster analyze" to analyze these emails.')
      );
    } catch (error) {
      console.error(chalk.red("🚨 Error fetching emails:"), error.message);
      process.exit(1);
    }
  });

// Analyze command
program
  .command("analyze")
  .description("Analyze fetched emails")
  .option("-n, --notify", "Send desktop notifications for urgent emails")
  .action(async (options) => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const tempEmailsPath = path.join(tempDir, "emails.json");
      const tempAnalyzedPath = path.join(tempDir, "analyzed_emails.json");

      // Check if emails.json exists
      if (!(await fs.pathExists(tempEmailsPath))) {
        console.error(
          chalk.red('🚨 No emails found. Run "emailmaster fetch" first.')
        );
        process.exit(1);
      }

      console.log(createTitleBox("🔍 Analyzing Emails"));

      // Load emails
      const emails = await fs.readJson(tempEmailsPath);
      console.log(chalk.blue(`Analyzing ${emails.length} emails...`));

      // Analyze emails
      await showLoading("Running AI analysis", 1500);
      const analyzedEmails = await analyzeEmails(emails);

      // Save analyzed emails
      await fs.writeJson(tempAnalyzedPath, analyzedEmails, { spaces: 2 });
      console.log(chalk.green("✓ Analysis complete. Results saved."));

      // Send notifications if requested
      if (options.notify) {
        await showLoading("Sending notifications", 800);
        const urgentEmails = analyzedEmails.filter(
          (email) => email.priority === "high"
        );
        if (urgentEmails.length > 0) {
          await sendNotifications(urgentEmails);
          console.log(
            chalk.yellow(
              `⚠️ Sent notifications for ${urgentEmails.length} urgent emails.`
            )
          );
        } else {
          console.log(chalk.blue("No urgent emails found."));
        }
      }

      console.log(
        chalk.blue('\nRun "emailmaster dashboard" to view email insights.')
      );
    } catch (error) {
      console.error(chalk.red("🚨 Error analyzing emails:"), error.message);
      process.exit(1);
    }
  });

// Dashboard command
program
  .command("dashboard")
  .description("View email dashboard")
  .action(async () => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const tempAnalyzedPath = path.join(tempDir, "analyzed_emails.json");

      // Check if analyzed_emails.json exists
      if (!(await fs.pathExists(tempAnalyzedPath))) {
        console.error(
          chalk.red(
            '🚨 No analyzed emails found. Run "emailmaster analyze" first.'
          )
        );
        process.exit(1);
      }

      console.log(createTitleBox("📊 Email Dashboard"));

      // Load analyzed emails
      const analyzedEmails = await fs.readJson(tempAnalyzedPath);

      // Display dashboard
      await displayDashboard(analyzedEmails);
    } catch (error) {
      console.error(chalk.red("🚨 Error displaying dashboard:"), error.message);
      process.exit(1);
    }
  });

// View email command
program
  .command("view [identifier]")
  .description("View details of a specific email (by number or unique ID)")
  .option("--id <uniqueId>", "View email by unique ID")
  .action(async (identifier, options) => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Use --id option if provided, otherwise use the positional argument
      const emailIdentifier = options.id || identifier;

      if (!emailIdentifier) {
        console.error(
          chalk.red(
            "🚨 Please provide an email identifier. Use: emailmaster view <number> or emailmaster view --id <uniqueId>"
          )
        );
        process.exit(1);
      }

      // Resolve email identifier (supports both index and unique ID)
      const result = await resolveEmailIdentifier(emailIdentifier);

      if (!result.success) {
        console.error(chalk.red(`🚨 ${result.error}`));
        process.exit(1);
      }

      // Display email with both index and unique ID
      await displayEmail(result.email, result.index, result.uniqueId);

      // Auto-generate suggested response if not available
      if (
        !result.email.suggestedResponse ||
        result.email.suggestedResponse === "undefined"
      ) {
        try {
          console.log(chalk.cyan("\n🤖 Generating AI insights..."));
          const {
            analyzeEmails: analyzeEmailsAI,
          } = require("./src/ai/geminiAI");
          const analyzedEmails = await analyzeEmailsAI([result.email]);

          if (
            analyzedEmails &&
            analyzedEmails[0] &&
            analyzedEmails[0].suggestedResponse
          ) {
            console.log(createSectionTitle("✨ AI-Generated Response:"));
            console.log(chalk.dim("───────────────────────────────────────"));
            console.log(chalk.italic(analyzedEmails[0].suggestedResponse));
            console.log(chalk.dim("───────────────────────────────────────"));
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              "\n⚠️ Could not generate AI response. Run 'emailmaster analyze' for full analysis."
            )
          );
        }
      }
    } catch (error) {
      console.error(chalk.red("🚨 Error viewing email:"), error.message);
      process.exit(1);
    }
  });

// List emails command
program
  .command("list")
  .description("List all emails with their indices and unique IDs")
  .option("--limit <number>", "Limit number of emails to display", parseInt, 20)
  .action(async (options) => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const emailsPath = path.join(tempDir, "emails.json");

      // Check if emails.json exists
      if (!(await fs.pathExists(emailsPath))) {
        console.error(
          chalk.red('🚨 No emails found. Run "emailmaster fetch" first.')
        );
        process.exit(1);
      }

      // Load emails
      const emails = await fs.readJson(emailsPath);

      if (emails.length === 0) {
        console.log(chalk.yellow("📭 No emails found."));
        return;
      }

      console.log(createTitleBox(`📋 Email List (${emails.length} total)`));

      // Display emails with limit
      const displayEmails = emails.slice(0, options.limit);

      displayEmails.forEach((email, arrayIndex) => {
        const index = email.assignedIndex || arrayIndex + 1;
        const uniqueId = email.uniqueId || "N/A";
        const date =
          typeof email.date === "string"
            ? email.date
            : email.date.toLocaleString();
        const shortDate = new Date(date).toLocaleDateString();

        console.log(
          `${chalk.cyan(`#${index}`)} ${chalk.gray(
            `(${uniqueId.substring(0, 8)})`
          )} ${chalk.yellow(shortDate)} ${email.subject.substring(0, 60)}${
            email.subject.length > 60 ? "..." : ""
          }`
        );
        console.log(
          `    ${chalk.dim("From:")} ${email.from.substring(0, 50)}${
            email.from.length > 50 ? "..." : ""
          }\n`
        );
      });

      if (emails.length > options.limit) {
        console.log(
          chalk.gray(
            `... and ${
              emails.length - options.limit
            } more emails. Use --limit to see more.`
          )
        );
      }

      console.log(
        chalk.dim(
          `\nℹ️ Use "emailmaster view <number>" or "emailmaster view --id <uniqueId>" to view details.`
        )
      );
    } catch (error) {
      console.error(chalk.red("🚨 Error listing emails:"), error.message);
      process.exit(1);
    }
  });

// Summary command
program
  .command("summary")
  .description("Generate daily email summary")
  .action(async () => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const tempAnalyzedPath = path.join(tempDir, "analyzed_emails.json");

      // Check if analyzed_emails.json exists
      if (!(await fs.pathExists(tempAnalyzedPath))) {
        console.error(
          chalk.red(
            '🚨 No analyzed emails found. Run "emailmaster analyze" first.'
          )
        );
        process.exit(1);
      }

      console.log(createTitleBox("📋 Daily Email Summary"));

      // Load analyzed emails
      const analyzedEmails = await fs.readJson(tempAnalyzedPath);

      // Generate summary
      await showLoading("Generating summary", 1200);
      const summary = await generateDailySummary(analyzedEmails);

      // Display summary
      await displayDailySummary(summary);

      // Save summary to file
      const timestamp = moment().format("YYYY-MM-DD");
      const summaryPath = path.join(REPORTS_DIR, `summary_${timestamp}.txt`);
      await fs.ensureDir(REPORTS_DIR);
      await exportDailySummary(summary, summaryPath);

      console.log(chalk.green(`\n✓ Summary saved to: ${summaryPath}`));
    } catch (error) {
      console.error(chalk.red("🚨 Error generating summary:"), error.message);
      process.exit(1);
    }
  });

// Export command
program
  .command("export")
  .description("Export analyzed emails")
  .option("--format <format>", "Export format (json or markdown)", "json")
  .action(async (options) => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const tempAnalyzedPath = path.join(tempDir, "analyzed_emails.json");

      // Check if analyzed_emails.json exists
      if (!(await fs.pathExists(tempAnalyzedPath))) {
        console.error(
          chalk.red(
            '🚨 No analyzed emails found. Run "emailmaster analyze" first.'
          )
        );
        process.exit(1);
      }

      console.log(
        createTitleBox(`📤 Exporting Emails (${options.format.toUpperCase()})`)
      );

      // Load analyzed emails
      const analyzedEmails = await fs.readJson(tempAnalyzedPath);

      // Export emails
      await showLoading(`Exporting to ${options.format}`, 800);

      // Ensure reports directory exists
      await fs.ensureDir(REPORTS_DIR);

      const timestamp = moment().format("YYYY-MM-DD");
      let exportPath;

      if (options.format.toLowerCase() === "markdown") {
        exportPath = path.join(REPORTS_DIR, `emails_${timestamp}.md`);
        await exportToMarkdown(analyzedEmails, exportPath);
      } else {
        exportPath = path.join(REPORTS_DIR, `emails_${timestamp}.json`);
        await exportToJson(analyzedEmails, exportPath);
      }

      console.log(chalk.green(`✓ Exported to: ${exportPath}`));
    } catch (error) {
      console.error(chalk.red("🚨 Error exporting emails:"), error.message);
      process.exit(1);
    }
  });

// Calendar export command
program
  .command("calendar-export")
  .description("Extract calendar events from emails and export as ICS file")
  .option("--email <number>", "Extract from specific email number")
  .option("--file <path>", "Output ICS file path", "events.ics")
  .option("--all", "Extract from all analyzed emails")
  .action(async (options) => {
    try {
      console.log(createTitleBox("📅 Calendar Export"));

      // Ensure account exists
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");

      let emails = [];

      if (options.email) {
        // Load single email
        const emailsPath = path.join(tempDir, "emails.json");
        if (!(await fs.pathExists(emailsPath))) {
          console.error(
            chalk.red('🚨 No emails found. Run "emailmaster fetch" first.')
          );
          process.exit(1);
        }
        const allEmails = await fs.readJson(emailsPath);
        const emailIndex = parseInt(options.email, 10) - 1;
        if (emailIndex < 0 || emailIndex >= allEmails.length) {
          console.error(chalk.red(`🚨 Email #${options.email} not found.`));
          process.exit(1);
        }
        emails = [allEmails[emailIndex]];
      } else {
        // Load analyzed emails
        const analyzedPath = path.join(tempDir, "analyzed_emails.json");
        if (!(await fs.pathExists(analyzedPath))) {
          console.error(
            chalk.red(
              '🚨 No analyzed emails found. Run "emailmaster analyze" first.'
            )
          );
          process.exit(1);
        }
        emails = await fs.readJson(analyzedPath);
      }

      await showLoading("Extracting calendar events", 1000);
      const calendarEvents = await extractCalendarEventsFromEmails(emails);

      if (calendarEvents.length === 0) {
        console.log(chalk.yellow("No calendar events found in the emails."));
        return;
      }

      // Generate ICS file
      const icsContent = await generateICSFile(calendarEvents);

      // Save to file
      await fs.writeFile(options.file, icsContent);

      console.log(
        createSuccessMessage(
          `Exported ${calendarEvents.length} calendar events to: ${options.file}`
        )
      );
      console.log(
        createInfoMessage(
          "You can now import this file into Google Calendar, Outlook, or any calendar app."
        )
      );

      // Display events summary
      console.log(chalk.bold("\n📅 Extracted Events:"));
      calendarEvents.forEach((event, index) => {
        console.log(
          `${index + 1}. ${chalk.cyan(event.summary)} - ${event.start}`
        );
      });
    } catch (error) {
      console.error(
        createErrorMessage(`Error exporting calendar: ${error.message}`)
      );
      console.log(
        createWarningMessage(
          "Calendar export failed. Please check the error details above."
        )
      );
      process.exit(1);
    }
  });

// Smart sweep command for inbox zero
program
  .command("sweep")
  .description(
    "Smart sweep to achieve inbox zero by archiving low-value emails"
  )
  .option(
    "--type <type>",
    "Type of emails to sweep (newsletters, promotions, notifications)",
    "newsletters"
  )
  .option("--older-than <days>", "Sweep emails older than specified days", "30")
  .option("--auto-archive", "Automatically archive without confirmation")
  .option("--dry-run", "Show what would be swept without actually doing it")
  .action(async (options) => {
    try {
      console.log(createTitleBox("🧹 Inbox Zero Smart Sweep"));

      // Ensure account exists
      await ensureAccount();

      console.log(
        createLoadingMessage("Scanning inbox for low-value emails...")
      );

      // Get current account and Gmail client
      const account = await getCurrentAccount();
      const tokenPath = path.join(process.cwd(), account.tokenPath);
      const gmail = await getGmailClient(tokenPath);

      // Build query based on type and age
      const daysAgo = parseInt(options.olderThan, 10);
      const beforeDate = new Date();
      beforeDate.setDate(beforeDate.getDate() - daysAgo);
      const beforeTimestamp = Math.floor(beforeDate.getTime() / 1000);

      let query = `before:${beforeTimestamp}`;

      switch (options.type) {
        case "newsletters":
          query += ' (unsubscribe OR newsletter OR "mailing list")';
          break;
        case "promotions":
          query += " category:promotions";
          break;
        case "notifications":
          query += ' (notification OR alert OR "do not reply")';
          break;
      }

      // Search for emails
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 100,
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        console.log(
          createSuccessMessage("No emails found matching the sweep criteria.")
        );
        return;
      }

      console.log(
        createInfoMessage(
          `Found ${messages.length} emails matching sweep criteria.`
        )
      );

      if (options.dryRun) {
        console.log(
          createWarningMessage(
            "DRY RUN - The following emails would be archived:"
          )
        );

        // Get details for first few emails to show what would be swept
        const sampleEmails = await Promise.all(
          messages.slice(0, 5).map(async (msg) => {
            const email = await gmail.users.messages.get({
              userId: "me",
              id: msg.id,
              format: "metadata",
              metadataHeaders: ["Subject", "From", "Date"],
            });

            const headers = email.data.payload.headers;
            const subject =
              headers.find((h) => h.name === "Subject")?.value || "No Subject";
            const from =
              headers.find((h) => h.name === "From")?.value || "Unknown";

            return { subject, from };
          })
        );

        sampleEmails.forEach((email, index) => {
          console.log(
            `${index + 1}. ${chalk.cyan(email.subject)} - ${chalk.gray(
              email.from
            )}`
          );
        });

        if (messages.length > 5) {
          console.log(chalk.gray(`... and ${messages.length - 5} more emails`));
        }

        console.log(
          chalk.blue(
            `\nTo actually sweep these emails, run: emailmaster sweep --type ${options.type} --older-than ${options.olderThan} --auto-archive`
          )
        );
        return;
      }

      // Confirm before archiving (unless auto-archive is set)
      if (!options.autoArchive) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        const answer = await new Promise((resolve) => {
          rl.question(
            chalk.yellow(`Archive ${messages.length} emails? (y/N): `),
            resolve
          );
        });
        rl.close();

        if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
          console.log(chalk.blue("Sweep cancelled."));
          return;
        }
      }

      // Archive emails in batches
      await showLoading("Archiving emails", 2000);

      const messageIds = messages.map((msg) => msg.id);

      // Gmail API batch modify (archive = remove inbox label)
      await gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: messageIds,
          removeLabelIds: ["INBOX"],
        },
      });

      console.log(
        createSuccessMessage(`Successfully archived ${messages.length} emails!`)
      );
      console.log(
        createInfoMessage(
          "🎉 Your inbox is now cleaner and closer to Inbox Zero!"
        )
      );
    } catch (error) {
      console.error(createErrorMessage(`Error during sweep: ${error.message}`));
      process.exit(1);
    }
  });

// Unsubscribe command
program
  .command("unsubscribe")
  .description("Manage email unsubscriptions")
  .option("--list", "List all detected mailing lists")
  .option(
    "--send <number>",
    "Send unsubscribe requests to first N mailing lists"
  )
  .option("--all", "Send unsubscribe requests to all detected lists")
  .action(async (options) => {
    try {
      console.log(createTitleBox("✉️ Unsubscribe Manager"));

      // Ensure account exists
      await ensureAccount();

      // Load analyzed emails to find unsubscribe links
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const analyzedPath = path.join(tempDir, "analyzed_emails.json");

      if (!(await fs.pathExists(analyzedPath))) {
        console.error(
          chalk.red(
            '🚨 No analyzed emails found. Run "emailmaster analyze" first.'
          )
        );
        process.exit(1);
      }

      const emails = await fs.readJson(analyzedPath);

      await showLoading("Scanning emails for unsubscribe links", 1500);

      // Extract unsubscribe links from email bodies
      const unsubscribeLinks = [];
      const emailRegex = /unsubscribe|opt.?out/i;
      const linkRegex = /https?:\/\/[^\s<>"]+/g;

      emails.forEach((email) => {
        if (email.body && emailRegex.test(email.body)) {
          const matches = email.body.match(linkRegex);
          if (matches) {
            matches.forEach((link) => {
              if (/unsubscribe|opt.?out/i.test(link)) {
                unsubscribeLinks.push({
                  from: email.from,
                  subject: email.subject,
                  link: link,
                  domain: new URL(link).hostname,
                });
              }
            });
          }
        }
      });

      // Remove duplicates by domain
      const uniqueLinks = unsubscribeLinks.reduce((acc, current) => {
        if (!acc.find((item) => item.domain === current.domain)) {
          acc.push(current);
        }
        return acc;
      }, []);

      if (uniqueLinks.length === 0) {
        console.log(
          chalk.yellow("No unsubscribe links found in analyzed emails.")
        );
        return;
      }

      if (options.list) {
        console.log(
          chalk.bold(`\n📋 Found ${uniqueLinks.length} mailing lists:`)
        );
        uniqueLinks.forEach((item, index) => {
          console.log(
            `${index + 1}. ${chalk.cyan(item.domain)} - ${chalk.gray(
              item.from
            )}`
          );
        });
        console.log(
          chalk.blue(`\nTo unsubscribe, run: emailmaster unsubscribe --send 5`)
        );
        return;
      }

      let linksToProcess = [];

      if (options.all) {
        linksToProcess = uniqueLinks;
      } else if (options.send) {
        const count = parseInt(options.send, 10);
        linksToProcess = uniqueLinks.slice(0, count);
      } else {
        console.log(
          chalk.yellow("Please specify --list, --send <number>, or --all")
        );
        return;
      }

      console.log(
        chalk.blue(
          `Processing unsubscribe requests for ${linksToProcess.length} mailing lists...`
        )
      );

      // Send unsubscribe requests
      let successCount = 0;
      let failCount = 0;

      for (const item of linksToProcess) {
        try {
          console.log(`Unsubscribing from ${chalk.cyan(item.domain)}...`);

          // Try to send GET request to unsubscribe link
          const response = await axios.get(item.link, {
            timeout: 10000,
            headers: {
              "User-Agent": "EmailMaster-CLI/1.0",
            },
          });

          if (response.status === 200) {
            console.log(chalk.green(`✓ Success: ${item.domain}`));
            successCount++;
          } else {
            console.log(
              chalk.yellow(
                `⚠️ Uncertain: ${item.domain} (status: ${response.status})`
              )
            );
          }
        } catch (error) {
          console.log(chalk.red(`✗ Failed: ${item.domain} - ${error.message}`));
          failCount++;
        }

        // Add delay between requests to be respectful
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(chalk.bold(`\n📊 Unsubscribe Summary:`));
      console.log(`${chalk.green("Success:")} ${successCount}`);
      console.log(`${chalk.red("Failed:")} ${failCount}`);
      console.log(
        chalk.blue(
          "Note: Some unsubscribe processes may require email confirmation."
        )
      );
    } catch (error) {
      console.error(
        chalk.red("🚨 Error managing unsubscriptions:"),
        error.message
      );
      process.exit(1);
    }
  });

// Search command
program
  .command("search <query>")
  .description("Search emails with natural language")
  .action(async (query) => {
    try {
      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Load configuration
      const config = await loadConfig();
      const tempDir = path.join(__dirname, config.tempDir || "./temp");
      const tempEmailsPath = path.join(tempDir, "emails.json");

      // Check if emails.json exists
      if (!(await fs.pathExists(tempEmailsPath))) {
        console.error(
          chalk.red('🚨 No emails found. Run "emailmaster fetch" first.')
        );
        process.exit(1);
      }

      console.log(createTitleBox("🔎 Searching Emails"));
      console.log(chalk.blue(`Query: "${query}"`));

      // Check AI configuration
      const { checkAIConfiguration } = require("./src/ai/geminiAI");
      const aiConfig = checkAIConfiguration();

      if (!aiConfig.configured) {
        console.log(
          chalk.yellow(
            "⚠️  Gemini AI not configured. Using simple text search."
          )
        );
        console.log(chalk.gray(`💡 Tip: ${aiConfig.setupInstructions}`));
      }

      // Load emails
      const emails = await fs.readJson(tempEmailsPath);

      // Search emails
      await showLoading("Searching with AI", 1500);
      const results = await searchEmailsWithNLP(emails, query);

      if (results.length === 0) {
        console.log(chalk.yellow("No matching emails found."));
        if (!aiConfig.configured) {
          console.log(
            chalk.gray(
              "💡 AI search might find more results with proper configuration."
            )
          );
        }
      } else {
        console.log(chalk.green(`✓ Found ${results.length} matching emails:`));

        results.forEach((email, index) => {
          console.log(
            `\n${chalk.bold(`#${index + 1}:`)} ${chalk.blue(email.subject)}`
          );
          console.log(`${chalk.gray("From:")} ${email.from}`);
          console.log(
            `${chalk.gray("Date:")} ${new Date(email.date).toLocaleString()}`
          );
          if (email.matchReason) {
            console.log(`${chalk.gray("Match:")} ${email.matchReason}`);
          }
        });
      }
    } catch (error) {
      console.error(chalk.red("🚨 Error searching emails:"), error.message);
      console.log(chalk.gray("💡 Search fell back to simple text matching."));
    }
  });

// Reply command
program
  .command("reply <email-number>")
  .description("Reply to a specific email")
  .option("-a, --ai", "Generate AI draft for the reply")
  .option("-s, --send", "Send the AI-generated reply immediately")
  .option("-m, --manual", "Compose manual reply via CLI prompt")
  .option("-d, --draft", "Save as draft instead of sending")
  .option("--message <message>", "Custom reply message content")
  .action(async (emailNumber, options) => {
    try {
      console.log(createTitleBox("📤 Replying to Email"));

      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Convert email number to integer
      const emailIndex = parseInt(emailNumber, 10);
      if (isNaN(emailIndex) || emailIndex <= 0) {
        console.error(
          chalk.red(
            "🚨 Invalid email number. Please provide a positive number."
          )
        );
        process.exit(1);
      }

      // Validate options
      if (!options.ai && !options.manual && !options.message) {
        console.error(
          chalk.red(
            '🚨 Please specify how to reply: --ai, --manual, or --message "Your reply"'
          )
        );
        process.exit(1);
      }

      await showLoading("Preparing reply", 800);

      // Send the reply
      const result = await replyToEmail(emailIndex, {
        ai: options.ai,
        manual: options.manual,
        message: options.message,
        draft: options.draft,
        send: options.send,
      });

      if (result.success) {
        if (result.type === "draft-preview") {
          // Just show the AI draft without sending
          console.log("\n" + chalk.bold.blue("📝 AI REPLY DRAFT") + "\n");
          console.log(chalk.bold(`To: ${result.email.from}`));
          console.log(chalk.bold(`Subject: Re: ${result.email.subject}`));
          console.log("\n" + result.message);

          // Save draft to file
          const timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
          const filename = `reply_draft_${timestamp}.txt`;
          const filePath = path.join(REPORTS_DIR, filename);

          await fs.ensureDir(REPORTS_DIR);
          await fs.writeFile(filePath, result.message);

          console.log(chalk.green(`\n✓ Reply draft saved to: ${filePath}`));
          console.log(
            chalk.blue(
              "\nTo send this reply, use: emailmaster reply " +
                emailNumber +
                " --ai --send"
            )
          );
        } else if (result.type === "draft") {
          console.log(
            chalk.green(
              `✓ Draft saved for email from ${result.email.from} on thread "${result.email.subject}"`
            )
          );
        } else {
          console.log(
            chalk.green(
              `✓ Replied successfully to email from ${result.email.from} on thread "${result.email.subject}"`
            )
          );
        }
      }
    } catch (error) {
      console.error(chalk.red("🚨 Error replying to email:"), error.message);
      process.exit(1);
    }
  });

// ============================================
// ATTACHMENT COMMANDS
// ============================================

program
  .command("attachments")
  .description("Manage email attachments")
  .action(() => {
    console.log(createTitleBox("📎 EmailMaster Attachments"));
    console.log(chalk.cyan("\nAvailable attachment commands:"));
    console.log(
      chalk.white(
        "  attachments fetch    - Download all attachments from emails"
      )
    );
    console.log(
      chalk.white("  attachments sync     - Sync new attachments only")
    );
    console.log(
      chalk.white("  attachments stats    - View attachment statistics")
    );
    console.log(
      chalk.yellow(
        "\nFor detailed help: emailmaster attachments <command> --help"
      )
    );
  });

program
  .command("attachments-fetch")
  .description("Download attachments from emails")
  .option("-d, --days <number>", "Days to fetch from (default: 30)", "30")
  .option("-o, --output <path>", "Output directory", "./attachments")
  .option(
    "--email <identifier>",
    "Download attachments from specific email (by number or ID)"
  )
  .option("--id <uniqueId>", "Download attachments from email by unique ID")
  .option(
    "--types <types>",
    "File types to download (comma-separated)",
    "pdf,doc,docx,xls,xlsx,jpg,png,zip"
  )
  .option("--max-size <size>", "Maximum file size in MB", "25")
  .option("--no-organize-date", "Don't organize files by date")
  .option("--no-organize-type", "Don't organize files by type")
  .action(async (options) => {
    try {
      console.log(createTitleBox("📎 Fetching Email Attachments"));

      // Ensure account exists, prompt for auth if needed
      await ensureAccount();

      // Get current account to use the correct token
      const currentAccount = await getCurrentAccount();
      const tokenPath = path.join(process.cwd(), currentAccount.tokenPath);

      const gmail = await getGmailClient(tokenPath);
      if (!gmail) {
        console.error(
          createErrorMessage(
            "Authentication required. Please run: emailmaster account-add"
          )
        );
        process.exit(1);
      }

      let emails = [];

      // Check if specific email is requested
      if (options.email || options.id) {
        const emailIdentifier = options.id || options.email;
        const result = await resolveEmailIdentifier(emailIdentifier);

        if (!result.success) {
          console.error(chalk.red(`🚨 ${result.error}`));
          process.exit(1);
        }

        emails = [result.email];
        console.log(
          createInfoMessage(
            `Downloading attachments from email #${
              result.index
            } (ID: ${result.uniqueId.substring(0, 8)})`
          )
        );
      } else {
        // Show loading
        const loadingInterval = showLoading("Fetching emails and attachments");

        try {
          // Fetch emails using the fetchEmails function
          emails = await fetchEmails(parseInt(options.days));
          clearInterval(loadingInterval);
          console.log(
            createInfoMessage(`Found ${emails.length} emails to scan`)
          );
        } catch (error) {
          clearInterval(loadingInterval);
          throw error;
        }
      }

      if (emails.length === 0) {
        console.log(
          createWarningMessage("No emails found in the specified time range")
        );
        return;
      }

      // Prepare options
      const fetchOptions = {
        outputDir: options.output,
        fileTypes: options.types
          ? options.types.split(",").map((t) => t.trim())
          : [],
        maxFileSize: parseInt(options.maxSize) * 1024 * 1024,
        organizeByDate: !options.noOrganizeDate,
        organizeByType: !options.noOrganizeType,
      };

      // Download attachments
      const results = await fetchAttachments(gmail, emails, fetchOptions);

      // Display results only if files were downloaded
      if (results.totalFiles > 0) {
        console.log(createSuccessMessage(`✨ Attachment Download Complete!`));
        console.log(chalk.cyan(`📁 Output Directory: ${options.output}`));
        console.log(
          chalk.green(
            `✅ Downloaded: ${results.totalFiles} files (${formatFileSize(
              results.totalSize
            )})`
          )
        );
      } else {
        console.log(chalk.yellow(`📎 No attachments found to download`));
      }

      if (results.skipped.length > 0) {
        console.log(
          chalk.yellow(`⏭️  Skipped: ${results.skipped.length} files`)
        );
      }

      if (results.errors.length > 0) {
        console.log(chalk.red(`❌ Errors: ${results.errors.length} files`));
      }

      // Show file type breakdown
      if (results.downloaded.length > 0) {
        const typeStats = {};
        results.downloaded.forEach((file) => {
          typeStats[file.type] = (typeStats[file.type] || 0) + 1;
        });

        console.log(chalk.cyan("\n📊 File Types Downloaded:"));
        Object.entries(typeStats).forEach(([type, count]) => {
          console.log(chalk.white(`  ${type.toUpperCase()}: ${count} files`));
        });
      }
    } catch (error) {
      console.error(
        createErrorMessage(`Error fetching attachments: ${error.message}`)
      );
      process.exit(1);
    }
  });

program
  .command("attachments-sync")
  .description("Sync new attachments only")
  .option("-o, --output <path>", "Output directory", "./attachments")
  .option(
    "--types <types>",
    "File types to download (comma-separated)",
    "pdf,doc,docx,xls,xlsx,jpg,png,zip"
  )
  .option("--max-size <size>", "Maximum file size in MB", "25")
  .option("--no-organize-date", "Don't organize files by date")
  .option("--no-organize-type", "Don't organize files by type")
  .action(async (options) => {
    try {
      console.log(createTitleBox("🔄 Syncing Email Attachments"));

      const auth = await getGmailClient();
      if (!auth) {
        console.error(
          createErrorMessage(
            "Authentication required. Please run: emailmaster account-add"
          )
        );
        process.exit(1);
      }

      // Show loading
      const loadingInterval = showLoading("Syncing attachments");

      try {
        // Fetch all emails (we'll filter by date in sync function)
        const emails = await fetchEmails(auth, 365); // Look back 1 year
        clearInterval(loadingInterval);

        // Prepare options
        const syncOptions = {
          outputDir: options.output,
          fileTypes: options.types
            ? options.types.split(",").map((t) => t.trim())
            : [],
          maxFileSize: parseInt(options.maxSize) * 1024 * 1024,
          organizeByDate: !options.noOrganizeDate,
          organizeByType: !options.noOrganizeType,
        };

        // Sync attachments
        const results = await syncAttachments(auth, emails, syncOptions);

        // Display results
        if (results.totalFiles === 0) {
          console.log(createInfoMessage("✅ No new attachments to sync"));
        } else {
          console.log(createSuccessMessage(`✨ Attachment Sync Complete!`));
          console.log(chalk.cyan(`📁 Output Directory: ${options.output}`));
          console.log(
            chalk.green(
              `✅ Synced: ${results.totalFiles} new files (${formatFileSize(
                results.totalSize
              )})`
            )
          );

          if (results.skipped.length > 0) {
            console.log(
              chalk.yellow(`⏭️  Skipped: ${results.skipped.length} files`)
            );
          }

          if (results.errors.length > 0) {
            console.log(chalk.red(`❌ Errors: ${results.errors.length} files`));
          }
        }
      } catch (error) {
        clearInterval(loadingInterval);
        throw error;
      }
    } catch (error) {
      console.error(
        createErrorMessage(`Error syncing attachments: ${error.message}`)
      );
      process.exit(1);
    }
  });

program
  .command("attachments-stats")
  .description("View attachment statistics")
  .option("-o, --output <path>", "Attachments directory", "./attachments")
  .action(async (options) => {
    try {
      console.log(createTitleBox("📊 Attachment Statistics"));

      const stats = await getAttachmentStats(options.output);

      if (stats.error) {
        console.log(
          createWarningMessage(`No attachment data found in ${options.output}`)
        );
        console.log(
          chalk.yellow(
            "Run 'emailmaster attachments-fetch' or 'emailmaster attachments-sync' first"
          )
        );
        return;
      }

      if (stats.totalFiles === 0) {
        console.log(createInfoMessage("No attachments found"));
        return;
      }

      // Overall stats
      console.log(chalk.cyan("📈 Overall Statistics:"));
      console.log(
        chalk.white(`  Total Files: ${stats.totalFiles.toLocaleString()}`)
      );
      console.log(
        chalk.white(`  Total Size: ${formatFileSize(stats.totalSize)}`)
      );
      console.log(
        chalk.white(
          `  Last Sync: ${
            stats.lastSync ? new Date(stats.lastSync).toLocaleString() : "Never"
          }`
        )
      );

      // File types
      if (Object.keys(stats.fileTypes).length > 0) {
        console.log(chalk.cyan("\n🗂️  File Types:"));
        const sortedTypes = Object.entries(stats.fileTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);

        sortedTypes.forEach(([type, count]) => {
          const percentage = ((count / stats.totalFiles) * 100).toFixed(1);
          console.log(
            chalk.white(
              `  ${type.toUpperCase()}: ${count} files (${percentage}%)`
            )
          );
        });
      }

      // By month
      if (Object.keys(stats.byMonth).length > 0) {
        console.log(chalk.cyan("\n📅 By Month (Last 6 months):"));
        const sortedMonths = Object.entries(stats.byMonth)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 6);

        sortedMonths.forEach(([month, count]) => {
          console.log(chalk.white(`  ${month}: ${count} files`));
        });
      }

      // Top senders
      if (Object.keys(stats.byEmailSender).length > 0) {
        console.log(chalk.cyan("\n👥 Top Senders (with attachments):"));
        const sortedSenders = Object.entries(stats.byEmailSender)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        sortedSenders.forEach(([sender, count]) => {
          console.log(chalk.white(`  ${sender}: ${count} files`));
        });
      }
    } catch (error) {
      console.error(
        createErrorMessage(
          `Error getting attachment statistics: ${error.message}`
        )
      );
      process.exit(1);
    }
  });

// Custom error handling for unknown commands
program.on("command:*", function () {
  console.error(
    "Unknown command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  );
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
