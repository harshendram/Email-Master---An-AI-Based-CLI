# 📧 EmailMaster CLI

<div align="center">

<img src="assets/screenshots/banner.png" alt="EmailMaster CLI Banner" width="100%"/>

![EmailMaster CLI](https://img.shields.io/badge/EmailMaster-CLI-blueviolet?style=for-the-badge&logo=gmail)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge&logo=openai)
![Node.js](https://img.shield<td align="center">
<strong>📈 Email Analytics</strong>## 🙏 Acknowledgments

- 🤖 **Amazon Q Developer** - AI-powered development assistance ([See full development journey](AMAZON_Q_DEVELOPMENT.md))
- 🧠 **Google Gemini AI** - Intelligent email processing and analysis
- 📧 **Gmail API** - Secure email access and management foundation
- 🎨 **Instagram** - Color palette and design inspiration
- 🔧 **Commander.js** - Powerful CLI framework and argument parsing
- ⚡ **Node.js Community** - Amazing ecosystem and toolsm>Advanced metrics & insights dashboard</em><br>
  <img src="assets/screenshots/image17.png" alt="Analytics Dashboard" width="250"/>

</td>badge/Node.js-16+-green?style=for-the-badge&logo=node.js)
![Gmail API](https://img.shields.io/badge/Gmail-API-red?style=for-the-badge&logo=gmail)

**🤖 AI-Powered Gmail Management Tool with Unique Email Identifiers**

_Transform your inbox into an intelligent, organized workspace with cutting-edge AI technology and persistent email references_

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [🆔 Unique IDs](#-unique-email-identifiers) • [📸 Screenshots](#-screenshots) • [⭐ Star this repo](#)

---

</div>

## 🎯 Project Overview

EmailMaster CLI is a next-generation command-line interface that revolutionizes Gmail management through AI integration. Built with modern Node.js technologies and powered by Google's Gemini AI, it transforms the traditional email workflow into an intelligent, automated experience.

**Why EmailMaster CLI?**

- 🧠 **AI-First Design**: Every feature is enhanced with intelligent automation
- ⚡ **Lightning Fast**: Batch processing and smart caching for optimal performance
- 🎨 **Beautiful Interface**: Instagram-inspired gradient designs with modern styling
- 🔧 **Developer Friendly**: Comprehensive CLI with intuitive commands
- 🚀 **Productivity Focused**: Achieve Inbox Zero with intelligent email categorization
- 📎 **Attachment Management**: Advanced file organization and bulk operations
- 🆔 **Unique Email IDs**: Persistent references that never change across sessions

## 🆔 Unique Email Identifiers

**Revolutionary Email Reference System** - Say goodbye to changing email numbers!

<div align="center">

| 🔢 **Traditional Problem**                  | ✨ **EmailMaster Solution**                  |
| ------------------------------------------- | -------------------------------------------- |
| Email #5 becomes #3 when emails are deleted | Email keeps same ID: `1982dc4f474312c3`      |
| Scripts break when inbox changes            | Stable references across all sessions        |
| Hard to reference emails in automation      | Use partial IDs: `emailmaster view 1982dc4f` |
| Workflow disrupted by new emails            | Dual access: by number OR unique ID          |

</div>

### 🎯 How It Works

```bash
# Every email gets a permanent unique identifier
emailmaster list
# Output:
# 1. [1982dc4f] Re: Project Meeting Tomorrow
# 2. [a7b3e9f2] Invoice #12345 - Payment Due
# 3. [c4d8f1a6] Welcome to Our Newsletter

# Access emails multiple ways:
emailmaster view 1                    # By number (traditional)
emailmaster view --id 1982dc4f474312c3  # By full unique ID
emailmaster view 1982dc4f             # By partial ID (8+ chars)

# IDs persist across sessions - email #1 today = same ID tomorrow!
```

### 🚀 Benefits

- **🔄 Persistent References**: Emails keep the same ID forever
- **📜 Script-Friendly**: Perfect for automation and batch processing
- **⚡ Quick Access**: Use short partial IDs for fast access
- **🔗 Link Sharing**: Share stable email references with team members
- **📊 Analytics**: Track specific emails across time without confusion

## ✨ Features

<table>
<tr>
<td width="50%">

### 📥 **Smart Email Management**

- **Intelligent Fetching** with customizable limits
- **AI-Powered Analysis** for priority classification
- **Batch Processing** for optimal performance
- **Multi-Account Support** with seamless switching
- **🆕 Unique Email IDs** with persistent references

### 🧠 **AI-Powered Intelligence**

- **Content Analysis** with sentiment detection
- **Priority Classification** (Urgent/Important/Normal)
- **Suggested Responses** with contextual AI
- **Natural Language Search** with semantic understanding

</td>
<td width="50%">

### 🎯 **Unique Email Identifiers**

- **Persistent References**: Emails keep same number across sessions
- **Unique IDs**: Each email gets permanent identifier (e.g., `1982dc4f474312c3`)
- **Dual Access**: Use both `emailmaster view 3` and `emailmaster view --id 1982dc4f`
- **Partial ID Support**: Use short IDs like `emailmaster view 1982dc4f`
- **Stable Workflow**: No more lost email references when new emails arrive

### 🤖 **AI-Powered Features**

- **Smart Analysis**: Priority classification and action item detection
- **Auto-Generated Responses**: Contextual reply suggestions on email view
- **Sentiment Analysis**: Emotion detection and response tone matching
- **Natural Language Search**: Semantic email search capabilities

### 📎 **Advanced Attachment Management**

- **Bulk Download** with smart filtering
- **ID-Based Access**: Download by email number or unique ID
- **File Organization** by date and type
- **Size Limits** and format filtering

</td>
</tr>
</table>
- **Smart Summarization** with key point extraction
- **Automated Response Generation**

</td>
<td width="50%">

### 🎯 **Productivity Tools**

- **Inbox Zero Automation** with smart sweeping
- **Calendar Event Extraction** from email content
- **Unsubscribe Management** with bulk operations
- **Advanced Search** with natural language queries

### 📎 **Attachment Vault**

- **Smart Download** with type and size filtering
- **Automatic Organization** by date and file type
- **Incremental Sync** for new attachments only
- **Statistics Dashboard** with file analytics

### 🎨 **Modern Interface**

- **Instagram-inspired** gradient color schemes
- **Beautiful Tables** with modern styling
- **Progress Indicators** with real-time feedback
- **Responsive Design** for all terminal sizes

</td>
</tr>
</table>

### 📋 Command Reference

<table>
<thead>
<tr>
<th width="30%">Command</th>
<th width="40%">Description</th>
<th width="30%">Common Options</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="3"><strong>🔐 Authentication & Account Management</strong></td>
</tr>
<tr>
<td><code>emailmaster accounts</code></td>
<td>List all configured accounts</td>
<td></td>
</tr>
<tr>
<td><code>emailmaster account-add</code></td>
<td>Add Gmail account with OAuth2 authentication</td>
<td><code>--name &lt;account&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster account-remove</code></td>
<td>Remove a configured account</td>
<td><code>&lt;name&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster account-switch</code></td>
<td>Switch between configured accounts</td>
<td><code>&lt;name&gt;</code></td>
</tr>
<tr>
<td colspan="3"><strong>� Core Email Operations</strong></td>
</tr>
<tr>
<td><code>emailmaster fetch</code></td>
<td>Retrieve emails from Gmail with smart caching</td>
<td><code>-m, --max &lt;number&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster list</code></td>
<td>Show all emails with indices and unique IDs</td>
<td><code>--limit &lt;number&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster view [identifier]</code></td>
<td>Display email by number or unique ID</td>
<td><code>--id &lt;uniqueId&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster analyze</code></td>
<td>AI-powered email analysis and classification</td>
<td><code>-n, --notify</code></td>
</tr>
<tr>
<td><code>emailmaster dashboard</code></td>
<td>Interactive inbox overview with insights</td>
<td></td>
</tr>
<tr>
<td><code>emailmaster search &lt;query&gt;</code></td>
<td>Search emails by query</td>
<td></td>
</tr>
<tr>
<td colspan="3"><strong>📤 Export & Productivity</strong></td>
</tr>
<tr>
<td><code>emailmaster export</code></td>
<td>Export emails to JSON/Markdown</td>
<td><code>--format &lt;format&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster calendar-export</code></td>
<td>Extract calendar events to ICS format</td>
<td><code>--email &lt;number&gt;<br>--file &lt;path&gt;<br>--all</code></td>
</tr>
<tr>
<td><code>emailmaster reply &lt;email-number&gt;</code></td>
<td>AI-powered email replies</td>
<td><code>-a, --ai<br>-s, --send<br>-m, --manual<br>-d, --draft<br>--message &lt;message&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster summary</code></td>
<td>Generate daily email summary report</td>
<td></td>
</tr>
<tr>
<td colspan="3"><strong>📎 Attachment Management</strong></td>
</tr>
<tr>
<td><code>emailmaster attachments</code></td>
<td>View attachment commands</td>
<td></td>
</tr>
<tr>
<td><code>emailmaster attachments-fetch</code></td>
<td>Download all attachments</td>
<td><code>--days &lt;number&gt;, --output &lt;path&gt;, --types &lt;types&gt;, --max-size &lt;size&gt;, --no-organize-date, --no-organize-type</code></td>
</tr>
<tr>
<td><code>emailmaster attachments-sync</code></td>
<td>Sync new attachments incrementally</td>
<td><code>-o, --output &lt;path&gt;<br>--types &lt;types&gt;<br>--max-size &lt;size&gt;</code></td>
</tr>
<tr>
<td><code>emailmaster attachments-stats</code></td>
<td>View attachment statistics</td>
<td><code>-o, --output &lt;path&gt;</code></td>
</tr>
<tr>
<td colspan="3"><strong>🔧 Advanced Features</strong></td>
</tr>
<tr>
<td><code>emailmaster sweep</code></td>
<td>Bulk email management</td>
<td><code>--type &lt;type&gt;, --older-than &lt;days&gt;, --auto-archive, --dry-run</code></td>
</tr>
<tr>
<td><code>emailmaster unsubscribe</code></td>
<td>Smart unsubscribe assistant</td>
<td><code>--list, --send &lt;number&gt;, --all</code></td>
</tr>
<tr>
<td><code>emailmaster config</code></td>
<td>Configure EmailMaster settings</td>
<td><code>--batch-size &lt;number&gt;<br>--model &lt;model&gt;<br>--temp-dir &lt;path&gt;<br>--show<br>--list-models</code></td>
</tr>
<tr>
<td><code>emailmaster help [command]</code></td>
<td>Display help information</td>
<td></td>
</tr>
</tbody>
</table>

#### Global Options

- `--help, -h` - Show command help
- `--version, -v` - Display version
- `--verbose` - Detailed output
- `--no-color` - Disable colored output

## 🚀 Quick Start

### Prerequisites

<table>
<tr>
<td width="20%"><strong>Node.js</strong></td>
<td width="30%">v16.0.0 or higher</td>
<td width="50%"><a href="https://nodejs.org/">Download from nodejs.org</a></td>
</tr>
<tr>
<td><strong>Gmail API</strong></td>
<td>OAuth2 Credentials</td>
<td><a href="https://console.cloud.google.com/">Google Cloud Console</a></td>
</tr>
<tr>
<td><strong>Gemini AI</strong></td>
<td>API Key</td>
<td><a href="https://ai.google.dev/">Google AI Studio</a></td>
</tr>
</table>

### 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/emailmaster-cli.git
cd emailmaster-cli

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.sample .env
# Edit .env file with your API keys

# 4. Install globally (optional)
npm install -g .
```

### 🔑 API Setup Guide

#### **Step 1: Gmail API Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Gmail API**
4. Create **OAuth 2.0 Client IDs** credentials
5. Select **Desktop Application** as application type
6. Download the JSON file and save as `credentials.json` in project root

![Gmail API Setup](placeholder-for-gmail-api-setup-screenshot)

#### **Step 2: Gemini AI API Setup**

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click **Get API Key** button
4. Copy the generated API key
5. Add to your `.env` file: `GEMINI_API_KEY=your_api_key_here`

![Gemini API Setup](placeholder-for-gemini-api-setup-screenshot)

### 🎯 First Run Authorization

When you run your first command, EmailMaster will guide you through OAuth setup:

```bash
# Start with account setup
emailmaster account-add --name "personal"

# The CLI will:
# 1. Open your browser automatically
# 2. Show Google OAuth consent screen
# 3. Ask for permission to access Gmail
# 4. Provide an authorization code
# 5. Paste the code back into CLI
# 6. Display beautiful welcome message with ASCII art
```

## 📸 Screenshots

<div align="center">

### 🎨 Beautiful CLI Interface

<table>
<tr>
<td width="50%" align="center">
<img src="assets/screenshots/image1.png" alt="Modern Help System" width="400"/>
<br><strong>🎯 Modern Help System</strong>
</td>
<td width="50%" align="center">
<img src="assets/screenshots/image2.png" alt="Instagram-Inspired Colors" width="400"/>
<br><strong>🌈 Instagram-Inspired Colors</strong>
</td>
</tr>
<tr>
<td align="center">
<img src="assets/screenshots/image3.png" alt="AI Analysis Dashboard" width="400"/>
<br><strong>🧠 AI Analysis Dashboard</strong>
</td>
<td align="center">
<img src="assets/screenshots/image4.png" alt="Smart Email Classification" width="400"/>
<br><strong>📊 Smart Email Classification</strong>
</td>
</tr>
<tr>
<td align="center">
<img src="assets/screenshots/image5.png" alt="Inbox Zero Automation" width="400"/>
<br><strong>🧹 Inbox Zero Automation</strong>
</td>
<td align="center">
<img src="assets/screenshots/image6.png" alt="Natural Language Search" width="400"/>
<br><strong>🔍 Natural Language Search</strong>
</td>
</tr>
</table>

### 🚀 Advanced Features

<table>
<tr>
<td width="50%" align="center">
<img src="assets/screenshots/image7.png" alt="Calendar Event Extraction" width="400"/>
<br><strong>📅 Calendar Event Extraction</strong>
</td>
<td width="50%" align="center">
<img src="assets/screenshots/image8.png" alt="AI-Powered Replies" width="400"/>
<br><strong>💬 AI-Powered Replies</strong>
</td>
</tr>
<tr>
<td align="center">
<img src="assets/screenshots/image9.png" alt="Multi-Account Management" width="400"/>
<br><strong>👥 Multi-Account Management</strong>
</td>
<td align="center">
<img src="assets/screenshots/image10.png" alt="Batch Email Processing" width="400"/>
<br><strong>⚡ Batch Email Processing</strong>
</td>
</tr>
<tr>
<td align="center">
<img src="assets/screenshots/image11.png" alt="Export & Backup" width="400"/>
<br><strong>📤 Export & Backup</strong>
</td>
<td align="center">
<img src="assets/screenshots/image12.png" alt="Real-time Notifications" width="400"/>
<br><strong>🔔 Real-time Notifications</strong>
</td>
</tr>
</table>

</div>

## 🎥 Videos

<div align="center">

### 🎬 Feature Demonstrations

<table>
<tr>
<td width="50%" align="center">
<strong>🚀 Getting Started Guide</strong><br>
<em>Complete setup walkthrough</em><br>
<img src="assets/screenshots/image1.png" alt="Getting Started" width="300"/>
</td>
<td width="50%" align="center">
<strong>🧠 AI Features Overview</strong><br>
<em>Smart analysis and automation</em><br>
<img src="assets/screenshots/image3.png" alt="AI Features" width="300"/>
</td>
</tr>
<tr>
<td align="center">
<strong>🧹 Inbox Zero Workflow</strong><br>
<em>Achieve email productivity</em><br>
<img src="assets/screenshots/image5.png" alt="Inbox Zero" width="300"/>
</td>
<td align="center">
<strong>⚡ Advanced Power User Tips</strong><br>
<em>Expert workflows and shortcuts</em><br>
<img src="assets/screenshots/image10.png" alt="Power User" width="300"/>
</td>
</tr>
</table>

### 🛠️ Advanced Features Gallery

<table>
<tr>
<td width="33%" align="center">
<strong>� Security & Privacy</strong><br>
<em>OAuth2 authentication & data protection</em><br>
<img src="assets/screenshots/image13.png" alt="Security Features" width="250"/>
</td>
<td width="33%" align="center">
<strong>⚡ Performance Optimization</strong><br>
<em>Smart caching & batch processing</em><br>
<img src="assets/screenshots/image14.png" alt="Performance" width="250"/>
</td>
<td width="33%" align="center">
<strong>🎨 Modern UI Design</strong><br>
<em>Instagram-inspired gradients & styling</em><br>
<img src="assets/screenshots/image15.png" alt="Modern UI" width="250"/>
</td>
</tr>
<tr>
<td align="center">
<strong>🔧 Developer Experience</strong><br>
<em>Comprehensive CLI with help system</em><br>
<img src="assets/screenshots/image16.png" alt="Developer Tools" width="250"/>
</td>
<td align="center">
<strong>� Email Analytics</strong><br>
<em>Advanced metrics & insights dashboard</em><br>
<img src="assets/screenshots/image17.png" alt="Analytics Dashboard" width="250"/>
</td>
<td align="center">
<strong>🌐 Cross-Platform Support</strong><br>
<em>Works on Windows, macOS, and Linux</em><br>
<img src="assets/screenshots/image18.png" alt="Cross Platform" width="250"/>
</td>
</tr>
</table>

</div>

## 🤝 Contributing

We welcome contributions! EmailMaster CLI is built with modern development practices and AI assistance.

### 🔧 Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/emailmaster-cli.git
cd emailmaster-cli

# Install dependencies
npm install

# Set up environment
cp .env.sample .env
# Add your API keys to .env

# Start developing
npm run dev
```

### 🚀 Tech Stack

- **Runtime**: Node.js 16+
- **CLI Framework**: Commander.js
- **AI Integration**: Google Gemini AI
- **Gmail API**: OAuth2 Authentication
- **Styling**: Chalk.js with custom gradients
- **File System**: fs-extra for robust operations

## 📄 License

MIT © [Your Name] - Built with ❤️ using modern JavaScript

## 🙏 Acknowledgments

- 🧠 **Google Gemini AI** - Intelligent email processing and analysis
- 📧 **Gmail API** - Secure email access and management foundation
- 🎨 **Instagram** - Color palette and design inspiration
- � **Commander.js** - Powerful CLI framework and argument parsing
- ⚡ **Node.js Community** - Amazing ecosystem and tools

---

<div align="center">

### ⭐ Star this repository if EmailMaster CLI helped boost your productivity!

<table>
<tr>
<td align="center">
<strong>🚀 Get Started</strong><br>
<a href="#-quick-start">Quick Setup Guide</a>
</td>
<td align="center">
<strong>🆔 Unique IDs</strong><br>
<a href="#-unique-email-identifiers">Learn More</a>
</td>
<td align="center">
<strong>📖 Commands</strong><br>
<a href="#-command-reference">Full Reference</a>
</td>
<td align="center">
<strong>🐛 Issues</strong><br>
<a href="https://github.com/yourusername/emailmaster-cli/issues">Report Bug</a>
</td>
</tr>
</table>

**Built for developers who value productivity, powered by AI that understands context**

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Powered by Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![Gmail API](https://img.shields.io/badge/Uses-Gmail%20API-red?style=flat-square&logo=gmail)](https://developers.google.com/gmail/api)

</div>
