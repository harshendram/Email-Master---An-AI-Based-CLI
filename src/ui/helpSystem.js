const chalk = require("chalk");
const {
  createTitleBox,
  instagramGradient,
  purpleGradient,
  pinkGradient,
  createModernTable,
} = require("./cliOutput");

/**
 * Advanced help system for EmailMaster CLI
 * Features Instagram-inspired styling and comprehensive command documentation
 */

/**
 * Generate main help content
 * @returns {string} Formatted help content
 */
function generateMainHelp() {
  const content = [];

  // Header
  content.push(
    createTitleBox("📧 EmailMaster CLI - AI-Powered Email Management")
  );
  content.push(
    instagramGradient(
      "✨ Transform your Gmail workflow with cutting-edge AI technology ✨\n"
    )
  );

  // Quick Start
  content.push(chalk.cyan.bold("🚀 QUICK START"));
  content.push(
    chalk.white("  1. Add your Gmail account:    ") +
      chalk.yellow("emailmaster account-add")
  );
  content.push(
    chalk.white("  2. Fetch your emails:        ") +
      chalk.yellow("emailmaster fetch")
  );
  content.push(
    chalk.white("  3. View your dashboard:      ") +
      chalk.yellow("emailmaster dashboard")
  );
  content.push(
    chalk.white("  4. Analyze with AI:          ") +
      chalk.yellow("emailmaster analyze")
  );
  content.push("");

  // Core Commands
  content.push(purpleGradient("💎 CORE COMMANDS"));
  content.push(
    chalk.cyan("┌─ emailmaster fetch") +
      chalk.gray("                     ") +
      chalk.white("Download emails from Gmail")
  );
  content.push(chalk.gray("│  Options: ") + chalk.yellow("--max <number>"));
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster analyze") +
      chalk.gray("                   ") +
      chalk.white("AI-powered email analysis")
  );
  content.push(chalk.gray("│  Options: ") + chalk.yellow("--notify"));
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster dashboard") +
      chalk.gray("                 ") +
      chalk.white("Interactive email dashboard")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster summary") +
      chalk.gray("                   ") +
      chalk.white("Generate daily email summary")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster view <id>") +
      chalk.gray("               ") +
      chalk.white("Display email by number or unique ID")
  );
  content.push(
    chalk.gray("│  Examples: ") + chalk.yellow("emailmaster view 3")
  );
  content.push(
    chalk.gray("│            ") + chalk.yellow("emailmaster view --id abcd1234")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster list") +
      chalk.gray("                   ") +
      chalk.white("List all emails with IDs")
  );
  content.push(chalk.gray("│  Options: ") + chalk.yellow("--limit <number>"));
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster search <query>") +
      chalk.gray("           ") +
      chalk.white("Smart email search")
  );
  content.push("");

  // Account Management
  content.push(chalk.green.bold("🔐 ACCOUNT MANAGEMENT"));
  content.push(
    chalk.cyan("┌─ emailmaster account-add") +
      chalk.gray("              ") +
      chalk.white("Add new Gmail account")
  );
  content.push(chalk.gray("│  Options: ") + chalk.yellow("--name <account>"));
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster account-remove <n>") +
      chalk.gray("       ") +
      chalk.white("Remove Gmail account")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster account-switch <n>") +
      chalk.gray("       ") +
      chalk.white("Switch between accounts")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster accounts") +
      chalk.gray("                ") +
      chalk.white("List all accounts")
  );
  content.push("");

  // Export & Calendar
  content.push(chalk.blue.bold("📤 EXPORT & PRODUCTIVITY"));
  content.push(
    chalk.cyan("┌─ emailmaster export") +
      chalk.gray("                   ") +
      chalk.white("Export emails to JSON/Markdown")
  );
  content.push(chalk.gray("│  Options: ") + chalk.yellow("--format <format>"));
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster calendar-export") +
      chalk.gray("          ") +
      chalk.white("Extract calendar events")
  );
  content.push(
    chalk.gray("│  Options: ") +
      chalk.yellow("--email <number>, --file <path>, --all")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster reply <number>") +
      chalk.gray("            ") +
      chalk.white("AI-powered email replies")
  );
  content.push(
    chalk.gray("│  Options: ") +
      chalk.yellow("--ai, --send, --manual, --draft, --message <msg>")
  );
  content.push("");

  // Attachment Management
  content.push(pinkGradient("📎 ATTACHMENT VAULT"));
  content.push(
    chalk.cyan("┌─ emailmaster attachments") +
      chalk.gray("              ") +
      chalk.white("View attachment commands")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster attachments-fetch") +
      chalk.gray("        ") +
      chalk.white("Download all attachments")
  );
  content.push(
    chalk.gray("│  Options: ") +
      chalk.yellow("--days <number>, --output <path>, --types <types>")
  );
  content.push(
    chalk.gray("│           ") +
      chalk.yellow("--max-size <size>, --no-organize-date, --no-organize-type")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster attachments-sync") +
      chalk.gray("         ") +
      chalk.white("Sync new attachments only")
  );
  content.push(
    chalk.gray("│  Options: ") +
      chalk.yellow("--output <path>, --types <types>, --max-size <size>")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster attachments-stats") +
      chalk.gray("        ") +
      chalk.white("View attachment statistics")
  );
  content.push(chalk.gray("│  Options: ") + chalk.yellow("--output <path>"));
  content.push("");

  // Advanced Features
  content.push(chalk.yellow.bold("🔧 ADVANCED FEATURES"));
  content.push(
    chalk.cyan("┌─ emailmaster sweep") +
      chalk.gray("                    ") +
      chalk.white("Bulk email management")
  );
  content.push(
    chalk.gray("│  Options: ") +
      chalk.yellow(
        "--type <type>, --older-than <days>, --auto-archive, --dry-run"
      )
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster unsubscribe") +
      chalk.gray("             ") +
      chalk.white("Smart unsubscribe assistant")
  );
  content.push(
    chalk.gray("│  Options: ") + chalk.yellow("--list, --send <number>, --all")
  );
  content.push("");
  content.push(
    chalk.cyan("┌─ emailmaster config") +
      chalk.gray("                  ") +
      chalk.white("Configure AI settings")
  );
  content.push(
    chalk.gray("│  Options: ") +
      chalk.yellow(
        "--batch-size <number>, --model <model>, --temp-dir <path>, --show, --list-models"
      )
  );
  content.push("");

  // Global Options
  content.push(chalk.cyan.bold("🌐 GLOBAL OPTIONS"));
  content.push(chalk.white("  --help, -h           Show command help"));
  content.push(chalk.white("  --version, -v        Display version"));
  content.push(chalk.white("  --verbose            Detailed output"));
  content.push(chalk.white("  --no-color           Disable colored output"));
  content.push("");

  // Examples
  content.push(instagramGradient("💡 EXAMPLES"));
  content.push(chalk.gray("  # Fetch last 10 emails"));
  content.push(chalk.white("  emailmaster fetch --max 10"));
  content.push("");
  content.push(chalk.gray("  # Analyze emails with notifications"));
  content.push(chalk.white("  emailmaster analyze --notify"));
  content.push("");
  content.push(chalk.gray("  # Export calendar events to ICS"));
  content.push(
    chalk.white("  emailmaster calendar-export --all --file events.ics")
  );
  content.push("");
  content.push(chalk.gray("  # Download PDF attachments only"));
  content.push(chalk.white("  emailmaster attachments-fetch --types pdf"));
  content.push("");

  // Footer
  content.push(
    chalk.hex("#833AB4").bold("🚀 Professional Email Management Made Simple ✨")
  );

  return content.join("\n");
}

/**
 * Generate help for specific command
 * @param {string} command - Command name
 * @returns {string} Formatted help content
 */
function generateCommandHelp(command) {
  const content = [];

  switch (command) {
    case "fetch":
      content.push(createTitleBox("📥 Fetch Command Help"));
      content.push(
        chalk.white("Retrieve emails from Gmail with smart caching\n")
      );
      content.push(chalk.cyan.bold("USAGE:"));
      content.push(chalk.white("  emailmaster fetch [options]\n"));
      content.push(chalk.cyan.bold("OPTIONS:"));
      content.push(
        chalk.white(
          "  --max <number>       Maximum emails to fetch (default: 10)"
        )
      );
      content.push(chalk.white("  --help, -h           Show command help\n"));
      content.push(chalk.cyan.bold("EXAMPLES:"));
      content.push(chalk.gray("  # Fetch default 10 emails"));
      content.push(chalk.white("  emailmaster fetch"));
      content.push(chalk.gray("  # Fetch last 50 emails"));
      content.push(chalk.white("  emailmaster fetch --max 50"));
      break;

    case "analyze":
      content.push(createTitleBox("🧠 Analyze Command Help"));
      content.push(
        chalk.white("AI-powered email analysis and classification\n")
      );
      content.push(chalk.cyan.bold("USAGE:"));
      content.push(chalk.white("  emailmaster analyze [options]\n"));
      content.push(chalk.cyan.bold("OPTIONS:"));
      content.push(
        chalk.white(
          "  --notify             Send desktop notifications for urgent emails"
        )
      );
      content.push(chalk.white("  --help, -h           Show command help\n"));
      content.push(chalk.cyan.bold("EXAMPLES:"));
      content.push(chalk.gray("  # Analyze emails"));
      content.push(chalk.white("  emailmaster analyze"));
      content.push(chalk.gray("  # Analyze with notifications"));
      content.push(chalk.white("  emailmaster analyze --notify"));
      break;

    case "commands":
      content.push(createTitleBox("📋 Available Commands"));
      content.push(
        chalk.white(
          "Complete list of EmailMaster CLI commands with descriptions\n"
        )
      );

      content.push(chalk.cyan.bold("🚀 CORE COMMANDS:"));
      content.push(chalk.white("  Command                    Description"));
      content.push(chalk.white("  ──────────────────────────────────────"));
      content.push(
        chalk.white("  fetch                      Download emails from Gmail")
      );
      content.push(
        chalk.white("  analyze                    AI-powered email analysis")
      );
      content.push(
        chalk.white("  dashboard                  Interactive email dashboard")
      );
      content.push(
        chalk.white("  summary                    Generate daily email summary")
      );
      content.push(
        chalk.white(
          "  view <id>                  Display email by number or unique ID"
        )
      );
      content.push(
        chalk.white(
          "  list                       List all emails with indices and IDs"
        )
      );
      content.push(
        chalk.white("  search <query>             Smart email search\n")
      );

      content.push(chalk.cyan.bold("🔐 ACCOUNT MANAGEMENT:"));
      content.push(chalk.white("  Command                    Description"));
      content.push(chalk.white("  ──────────────────────────────────────"));
      content.push(
        chalk.white("  account-add                Add new Gmail account")
      );
      content.push(
        chalk.white("  account-remove <n>         Remove Gmail account")
      );
      content.push(
        chalk.white("  account-switch <n>         Switch between accounts")
      );
      content.push(
        chalk.white("  accounts                   List all accounts\n")
      );

      content.push(chalk.cyan.bold("📤 EXPORT & PRODUCTIVITY:"));
      content.push(chalk.white("  Command                    Description"));
      content.push(chalk.white("  ──────────────────────────────────────"));
      content.push(
        chalk.white(
          "  export                     Export emails to JSON/Markdown"
        )
      );
      content.push(
        chalk.white("  calendar-export            Extract calendar events")
      );
      content.push(
        chalk.white("  reply <number>             AI-powered email replies\n")
      );

      content.push(chalk.cyan.bold("📎 ATTACHMENT MANAGEMENT:"));
      content.push(chalk.white("  Command                    Description"));
      content.push(chalk.white("  ──────────────────────────────────────"));
      content.push(
        chalk.white("  attachments                View attachment commands")
      );
      content.push(
        chalk.white("  attachments-fetch          Download all attachments")
      );
      content.push(
        chalk.white("  attachments-sync           Sync new attachments only")
      );
      content.push(
        chalk.white("  attachments-stats          View attachment statistics\n")
      );

      content.push(chalk.cyan.bold("🔧 ADVANCED:"));
      content.push(chalk.white("  Command                    Description"));
      content.push(chalk.white("  ──────────────────────────────────────"));
      content.push(
        chalk.white("  sweep                      Bulk email management")
      );
      content.push(
        chalk.white("  unsubscribe                Smart unsubscribe assistant")
      );
      content.push(
        chalk.white("  config                     Configure AI settings\n")
      );

      content.push(
        chalk.gray(
          "Run 'emailmaster help <command>' for detailed help on any command"
        )
      );
      break;

    case "calendar-export":
      content.push(createTitleBox("📅 Calendar Export Help"));
      content.push(
        chalk.white(
          "Extract calendar events from emails and export to ICS format\n"
        )
      );

      content.push(chalk.cyan.bold("USAGE:"));
      content.push(chalk.white("  emailmaster calendar-export [options]\n"));

      content.push(chalk.cyan.bold("OPTIONS:"));
      content.push(
        chalk.white("  --email <number>     Extract from specific email")
      );
      content.push(
        chalk.white(
          "  --file <path>        Output file path (default: events.ics)"
        )
      );
      content.push(
        chalk.white("  --all                Extract from all emails")
      );
      content.push(chalk.white("  --help, -h           Show command help\n"));

      content.push(chalk.cyan.bold("EXAMPLES:"));
      content.push(chalk.gray("  # Extract from all emails"));
      content.push(chalk.white("  emailmaster calendar-export --all"));
      content.push(chalk.gray("  # Extract from specific email"));
      content.push(chalk.white("  emailmaster calendar-export --email 5"));
      content.push(chalk.gray("  # Export to custom file"));
      content.push(
        chalk.white("  emailmaster calendar-export --all --file my-events.ics")
      );
      break;

    case "attachments":
      content.push(createTitleBox("📎 Attachments Command Help"));
      content.push(chalk.white("Manage email attachments efficiently\n"));
      content.push(chalk.cyan.bold("AVAILABLE COMMANDS:"));
      content.push(
        chalk.white("  attachments-fetch    Download all attachments")
      );
      content.push(
        chalk.white("  attachments-sync     Sync new attachments only")
      );
      content.push(
        chalk.white("  attachments-stats    View attachment statistics\n")
      );
      content.push(chalk.cyan.bold("EXAMPLES:"));
      content.push(chalk.gray("  # Download all attachments"));
      content.push(chalk.white("  emailmaster attachments-fetch"));
      content.push(chalk.gray("  # Sync only new attachments"));
      content.push(chalk.white("  emailmaster attachments-sync"));
      break;

    case "view":
      content.push(createTitleBox("👁️ View Command Help"));
      content.push(
        chalk.white(
          "Display detailed email content with unique identifier support\n"
        )
      );
      content.push(chalk.cyan.bold("USAGE:"));
      content.push(chalk.white("  emailmaster view <identifier>"));
      content.push(chalk.white("  emailmaster view --id <uniqueId>\n"));
      content.push(chalk.cyan.bold("PARAMETERS:"));
      content.push(
        chalk.white(
          "  <identifier>         Email number (e.g., 1, 2, 3) or unique ID"
        )
      );
      content.push(
        chalk.white("  --id <uniqueId>      View by specific unique ID\n")
      );
      content.push(chalk.cyan.bold("FEATURES:"));
      content.push(
        chalk.white("  • Support for both index numbers and unique IDs")
      );
      content.push(
        chalk.white("  • Persistent email references across fetches")
      );
      content.push(chalk.white("  • AI analysis integration when available"));
      content.push(chalk.white("  • Suggested response generation\n"));
      content.push(chalk.cyan.bold("EXAMPLES:"));
      content.push(chalk.gray("  # View email by number"));
      content.push(chalk.white("  emailmaster view 3"));
      content.push(chalk.gray("  # View email by unique ID"));
      content.push(chalk.white("  emailmaster view --id abcdef123456"));
      content.push(chalk.gray("  # View email by ID directly"));
      content.push(chalk.white("  emailmaster view 1m8g9jk2l"));
      break;

    case "list":
      content.push(createTitleBox("📋 List Command Help"));
      content.push(
        chalk.white(
          "Display all emails with persistent indices and unique IDs\n"
        )
      );
      content.push(chalk.cyan.bold("USAGE:"));
      content.push(chalk.white("  emailmaster list [options]\n"));
      content.push(chalk.cyan.bold("OPTIONS:"));
      content.push(
        chalk.white(
          "  --limit <number>     Maximum emails to display (default: 20)"
        )
      );
      content.push(chalk.white("  --help, -h           Show command help\n"));
      content.push(chalk.cyan.bold("FEATURES:"));
      content.push(chalk.white("  • Persistent email numbering"));
      content.push(chalk.white("  • Unique ID display for each email"));
      content.push(chalk.white("  • Subject and sender preview"));
      content.push(chalk.white("  • Date formatting for easy scanning\n"));
      content.push(chalk.cyan.bold("EXAMPLES:"));
      content.push(chalk.gray("  # List default 20 emails"));
      content.push(chalk.white("  emailmaster list"));
      content.push(chalk.gray("  # List first 50 emails"));
      content.push(chalk.white("  emailmaster list --limit 50"));
      break;

    default:
      content.push(createTitleBox("❓ Command Not Found"));
      content.push(chalk.red(`No help available for command: ${command}\n`));
      content.push(chalk.white("Run 'emailmaster help' to see all commands"));
  }

  return content.join("\n");
}

/**
 * Display help content
 * @param {string} command - Optional specific command
 */
function displayHelp(command = null) {
  if (command) {
    console.log(generateCommandHelp(command));
  } else {
    console.log(generateMainHelp());
  }
}

module.exports = {
  displayHelp,
  generateMainHelp,
  generateCommandHelp,
};
