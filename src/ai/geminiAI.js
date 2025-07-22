const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

// Load configuration dynamically
function loadConfig() {
  const configPath = path.join(__dirname, "../../config.json");
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  // Return default config if no config file exists
  return {
    batchSize: 20,
    model: "gemini-2.0-flash-exp",
    tempDir: "./temp",
  };
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get model instance with current configuration
function getModel() {
  const config = loadConfig();
  const modelName = config.model || "gemini-2.0-flash-exp";
  return genAI.getGenerativeModel({
    model: modelName,
  });
}

// Enhanced JSON parsing with better error handling
function parseAIResponse(response) {
  try {
    // Extract JSON from response - try arrays first, then objects
    let jsonMatch = response.match(/\[[\s\S]*?\]/);

    if (!jsonMatch) {
      // Try to find JSON within code blocks
      jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }

    if (!jsonMatch) {
      // Try to find single object and wrap in array
      jsonMatch = response.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        jsonMatch[0] = `[${jsonMatch[0]}]`;
      }
    }

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    let jsonStr = jsonMatch[0];

    // Clean up common issues with AI responses
    jsonStr = jsonStr
      .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
      .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .trim();

    // Try to parse the cleaned JSON
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("Failed to parse AI response:", error.message);
    return null;
  }
}

/**
 * Check if Gemini AI is properly configured
 * @returns {Object} Configuration status
 */
function checkAIConfiguration() {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  return {
    configured: hasApiKey,
    apiKey: hasApiKey ? "✓ Set" : "✗ Missing",
    setupInstructions: hasApiKey
      ? null
      : "Set GEMINI_API_KEY environment variable or create .env file",
  };
}

/**
 * Process emails in batches
 * @param {Array} emails Array of email objects
 * @param {Function} processFn Function to process each batch
 * @param {Function} progressCallback Optional callback for progress updates
 * @returns {Promise<Array>} Array of processed results
 */
async function processBatches(emails, processFn, progressCallback = null) {
  const config = loadConfig();
  const batchSize = config.batchSize;
  const results = [];
  const batches = [];

  // Create batches
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    if (progressCallback) {
      progressCallback(i + 1, batches.length);
    }

    const batchResults = await processFn(batches[i]);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Classify email priority for a batch of emails
 * @param {Array} emailBatch Batch of email objects
 * @returns {Promise<Array>} Array of classification results
 */
async function classifyEmailPriorityBatch(emailBatch) {
  try {
    // Prepare batch data for the prompt
    const emailsData = emailBatch.map((email) => {
      let dateString;
      try {
        if (email.date instanceof Date) {
          dateString = email.date.toISOString();
        } else if (typeof email.date === "string") {
          dateString = email.date;
        } else {
          dateString = new Date(email.date).toISOString();
        }
      } catch (error) {
        dateString = new Date().toISOString(); // fallback to current date
      }

      return {
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: dateString,
        content: email.body || email.snippet,
      };
    });

    const prompt = `
      Analyze these emails and classify each one's priority as either "Urgent", "Important", or "Normal".
      Also determine if each contains any action items that require a response or action.
      
      Emails:
      ${JSON.stringify(emailsData, null, 2)}
      
      Respond in JSON format only with an array of results, one for each email:
      [
        {
          "id": "email_id_1",
          "priority": "Urgent|Important|Normal",
          "priorityConfidence": <number between 0-100>,
          "type": "Personal|Work|Marketing|Updates|Others",
          "actionRequired": true|false,
          "actionConfidence": <number between 0-100>,
          "actionItems": ["list", "of", "action", "items"]
        },
        {
          "id": "email_id_2",
          ...
        }
      ]
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("AI Classification Response:", text); // Debug log

    // Use enhanced JSON parsing
    const classifications = parseAIResponse(text);

    if (classifications && Array.isArray(classifications)) {
      // Map results back to emails by ID
      return emailBatch.map((email) => {
        const classification = classifications.find(
          (c) => c.id === email.id
        ) || {
          priority: "Normal",
          priorityConfidence: 50,
          type: "Others",
          actionRequired: false,
          actionConfidence: 50,
          actionItems: [],
        };

        return {
          ...email,
          classification,
        };
      });
    }

    // If JSON parsing fails, provide default classification
    console.warn("Could not parse AI response, using default classification");
    return emailBatch.map((email) => ({
      ...email,
      classification: {
        priority: "Normal",
        priorityConfidence: 50,
        type: "Others",
        typeConfidence: 50,
        requiresAction: false,
        actionConfidence: 50,
        actionItems: [],
      },
    }));
  } catch (error) {
    console.error("Error classifying emails batch:", error);
    // Return default classification on error
    return emailBatch.map((email) => ({
      ...email,
      classification: {
        priority: "Normal",
        priorityConfidence: 50,
        type: "Others",
        actionRequired: false,
        actionConfidence: 50,
        actionItems: [],
      },
    }));
  }
}

/**
 * Generate email summaries for a batch of emails
 * @param {Array} emailBatch Batch of email objects
 * @returns {Promise<Array>} Array of email objects with summaries
 */
async function generateEmailSummaryBatch(emailBatch) {
  try {
    // Prepare batch data for the prompt
    const emailsData = emailBatch.map((email) => {
      let dateString;
      try {
        if (email.date instanceof Date) {
          dateString = email.date.toISOString();
        } else if (typeof email.date === "string") {
          dateString = email.date;
        } else {
          dateString = new Date(email.date).toISOString();
        }
      } catch (error) {
        dateString = new Date().toISOString(); // fallback to current date
      }

      return {
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: dateString,
        content: email.body || email.snippet,
      };
    });

    const prompt = `
      Summarize each of these emails in bullet points. Extract key points, deadlines, and important information.
      
      Emails:
      ${JSON.stringify(emailsData, null, 2)}
      
      Respond in JSON format only with an array of results, one for each email:
      [
        {
          "id": "email_id_1",
          "summary": ["bullet point 1", "bullet point 2", ...],
          "keyPoints": ["key point 1", "key point 2", ...],
          "deadlines": ["deadline 1", "deadline 2", ...],
          "estimatedReadingTime": <number in minutes>
        },
        {
          "id": "email_id_2",
          ...
        }
      ]
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("AI Summary Response:", text); // Debug log

    // Use enhanced JSON parsing
    const summaries = parseAIResponse(text);

    if (summaries && Array.isArray(summaries)) {
      // Map results back to emails by ID
      return emailBatch.map((email) => {
        const summary = summaries.find((s) => s.id === email.id) || {
          summary: ["Failed to generate summary"],
          keyPoints: [],
          deadlines: [],
          estimatedReadingTime: 1,
        };

        return {
          ...email,
          summary,
        };
      });
    }

    // If all parsing attempts fail, use default summaries
    console.warn("Could not parse AI response, using default summaries");
    return emailBatch.map((email) => ({
      ...email,
      summary: {
        summary: email.snippet || "No summary available",
        keyPoints: [],
        actionRequired: false,
      },
    }));
  } catch (error) {
    console.error("Error generating summaries batch:", error);
    // Return default summary on error
    return emailBatch.map((email) => ({
      ...email,
      summary: {
        summary: ["Failed to generate summary"],
        keyPoints: [],
        deadlines: [],
        estimatedReadingTime: 1,
      },
    }));
  }
}

/**
 * Generate suggested responses for a batch of emails
 * @param {Array} emailBatch Batch of email objects
 * @returns {Promise<Array>} Array of email objects with suggested responses
 */
async function generateSuggestedResponseBatch(emailBatch) {
  try {
    // Prepare batch data for the prompt
    const emailsData = emailBatch.map((email) => {
      let dateString;
      try {
        if (email.date instanceof Date) {
          dateString = email.date.toISOString();
        } else if (typeof email.date === "string") {
          dateString = email.date;
        } else {
          dateString = new Date(email.date).toISOString();
        }
      } catch (error) {
        dateString = new Date().toISOString(); // fallback to current date
      }

      return {
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: dateString,
        content: email.body || email.snippet,
      };
    });

    const prompt = `
      Generate professional responses to each of these emails. The responses should be concise, address any questions or action items,
      and maintain a professional tone.
      
      Emails:
      ${JSON.stringify(emailsData, null, 2)}
      
      Respond in JSON format only with an array of results, one for each email:
      [
        {
          "id": "email_id_1",
          "suggestedResponse": "Response text here..."
        },
        {
          "id": "email_id_2",
          ...
        }
      ]
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[\s*\{\s*[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const responses = JSON.parse(jsonMatch[0]);

      // Map results back to emails by ID
      return emailBatch.map((email) => {
        const responseObj = responses.find((r) => r.id === email.id) || {
          suggestedResponse: "Failed to generate a suggested response.",
        };

        return {
          ...email,
          suggestedResponse: responseObj.suggestedResponse,
        };
      });
    }

    // If all parsing attempts fail, use default responses
    console.warn("Could not parse AI response, using default responses");
    return emailBatch.map((email) => ({
      ...email,
      suggestedResponse: "Unable to generate response at this time.",
    }));
  } catch (error) {
    console.error("Error generating responses batch:", error);
    // Return default response on error
    return emailBatch.map((email) => ({
      ...email,
      suggestedResponse: "Failed to generate a suggested response.",
    }));
  }
}

/**
 * Analyze emails with batching
 * @param {Array} emails Array of email objects
 * @param {Function} progressCallback Optional callback for progress updates
 * @returns {Promise<Array>} Array of analyzed emails
 */
async function analyzeEmails(emails, progressCallback = null) {
  try {
    // Check if emails have already been analyzed
    const config = loadConfig();
    const tempDir = path.join(__dirname, "../../", config.tempDir || "./temp");
    await fs.ensureDir(tempDir);

    const cacheFile = path.join(tempDir, "analyzed_cache.json");
    let cache = {};

    if (await fs.pathExists(cacheFile)) {
      cache = await fs.readJson(cacheFile);
    }

    // Filter out emails that have already been analyzed
    const emailsToAnalyze = emails.filter((email) => !cache[email.id]);
    const cachedEmails = emails
      .filter((email) => cache[email.id])
      .map((email) => cache[email.id]);

    if (emailsToAnalyze.length === 0) {
      return cachedEmails;
    }

    // Step 1: Classify emails
    const classifiedEmails = await processBatches(
      emailsToAnalyze,
      classifyEmailPriorityBatch,
      (batchNum, totalBatches) => {
        if (progressCallback) {
          progressCallback("classification", batchNum, totalBatches);
        }
      }
    );

    // Step 2: Generate summaries
    const summarizedEmails = await processBatches(
      classifiedEmails,
      generateEmailSummaryBatch,
      (batchNum, totalBatches) => {
        if (progressCallback) {
          progressCallback("summarization", batchNum, totalBatches);
        }
      }
    );

    // Step 3: Generate suggested responses
    const analyzedEmails = await processBatches(
      summarizedEmails,
      generateSuggestedResponseBatch,
      (batchNum, totalBatches) => {
        if (progressCallback) {
          progressCallback("response generation", batchNum, totalBatches);
        }
      }
    );

    // Update cache
    analyzedEmails.forEach((email) => {
      cache[email.id] = email;
    });

    await fs.writeJson(cacheFile, cache);

    // Combine with cached emails and return
    return [...analyzedEmails, ...cachedEmails];
  } catch (error) {
    console.error("Error analyzing emails:", error);
    throw error;
  }
}

/**
 * Extract calendar events from email
 * @param {Object} email Email object
 * @returns {Promise<Array>} Array of calendar events
 */
async function extractCalendarEvents(email) {
  try {
    const prompt = `
      Extract any date/time-based tasks or meetings from this email. Only extract important dates, not every date mentioned.
      Name the events properly based on context.
      
      Email Subject: ${email.subject}
      From: ${email.from}
      Date: ${email.date}
      Content: ${email.body || email.snippet}
      
      Respond in JSON format only:
      {
        "events": [
          {
            "title": "Event title",
            "date": "YYYY-MM-DD",
            "time": "HH:MM" (optional),
            "endTime": "HH:MM" (optional),
            "description": "Brief description of the event"
          }
        ]
      }
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).events || [];
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error extracting calendar events:", error);
    return [];
  }
}

/**
 * Extract calendar events from multiple emails
 * @param {Array} emails Array of email objects
 * @param {Function} progressCallback Optional callback for progress updates
 * @returns {Promise<Array>} Array of calendar events
 */
async function extractCalendarEventsFromEmails(
  emails,
  progressCallback = null
) {
  try {
    const config = loadConfig();
    // Prepare batch data for the prompt with robust date handling
    const emailsData = emails.map((email) => {
      let dateString;
      if (email.date) {
        if (typeof email.date === "string") {
          dateString = email.date;
        } else if (email.date.toISOString) {
          dateString = email.date.toISOString();
        } else if (email.date.toString) {
          dateString = new Date(email.date.toString()).toISOString();
        } else {
          dateString = new Date().toISOString(); // fallback
        }
      } else {
        dateString = new Date().toISOString(); // fallback
      }

      return {
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: dateString,
        content: email.body || email.snippet,
      };
    });

    const batchSize = config.batchSize;
    const allEvents = [];
    const batches = [];

    // Create batches
    for (let i = 0; i < emailsData.length; i += batchSize) {
      batches.push(emailsData.slice(i, i + batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      if (progressCallback) {
        progressCallback(i + 1, batches.length);
      }

      const batch = batches[i];
      const prompt = `
        Extract any date/time-based tasks or meetings from these emails. Only extract important dates, not every date mentioned.
        Name the events properly based on context.
        
        Emails:
        ${JSON.stringify(batch, null, 2)}
        
        Respond in JSON format only with an array of results, one for each email:
        [
          {
            "id": "email_id_1",
            "events": [
              {
                "title": "Event title",
                "date": "YYYY-MM-DD",
                "time": "HH:MM" (optional),
                "endTime": "HH:MM" (optional),
                "description": "Brief description of the event"
              }
            ]
          },
          {
            "id": "email_id_2",
            ...
          }
        ]
      `;

      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
      if (jsonMatch) {
        const batchResults = JSON.parse(jsonMatch[0]);

        // Collect all events
        batchResults.forEach((item) => {
          if (item.events && item.events.length > 0) {
            allEvents.push(...item.events);
          }
        });
      }
    }

    return allEvents;
  } catch (error) {
    console.error("Error extracting calendar events from emails:", error);
    return [];
  }
}

/**
 * Search emails with natural language query
 * @param {Array} emails Array of email objects
 * @param {string} query Natural language query
 * @returns {Promise<Array>} Array of matching emails
 */
async function searchEmailsWithNLP(emails, query) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log(
        "⚠️  No Gemini API key found. Using simple text search instead."
      );
      const lowerQuery = query.toLowerCase();
      return emails.filter(
        (email) =>
          email.subject.toLowerCase().includes(lowerQuery) ||
          email.from.toLowerCase().includes(lowerQuery) ||
          (email.snippet && email.snippet.toLowerCase().includes(lowerQuery))
      );
    }

    const emailsJson = JSON.stringify(
      emails.map((email) => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        date:
          email.date instanceof Date ? email.date.toISOString() : email.date,
        snippet: email.snippet,
      }))
    );

    const prompt = `
      I have a list of emails and a search query. Find emails that match the query.
      
      Search query: "${query}"
      
      Emails:
      ${emailsJson}
      
      Return the IDs of matching emails in JSON format:
      {
        "matchingIds": ["id1", "id2", ...]
      }
      
      Be flexible in interpreting the query. For example, "last month" should match emails from the previous month,
      "urgent" should match emails that seem urgent even if they don't contain that exact word.
    `;

    const model = getModel();

    // Retry logic for temporary failures
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log("AI Search Response:", text); // Debug log

        // Try to extract JSON from response with better regex
        let jsonMatch = text.match(/\{[^{}]*"matchingIds"[^{}]*\}/);

        if (!jsonMatch) {
          // Try alternative patterns
          jsonMatch = text.match(/\{[\s\S]*?\}/);
        }

        if (jsonMatch) {
          try {
            const parsedResponse = JSON.parse(jsonMatch[0]);
            const matchingIds = parsedResponse.matchingIds || [];
            return emails.filter((email) => matchingIds.includes(email.id));
          } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw JSON:", jsonMatch[0]);

            // Fallback: simple text search if AI parsing fails
            const lowerQuery = query.toLowerCase();
            return emails.filter(
              (email) =>
                email.subject.toLowerCase().includes(lowerQuery) ||
                email.from.toLowerCase().includes(lowerQuery) ||
                (email.snippet &&
                  email.snippet.toLowerCase().includes(lowerQuery))
            );
          }
        }

        // Fallback: simple text search if no JSON found
        console.log("No JSON found in AI response, using fallback search");
        const lowerQuery = query.toLowerCase();
        return emails.filter(
          (email) =>
            email.subject.toLowerCase().includes(lowerQuery) ||
            email.from.toLowerCase().includes(lowerQuery) ||
            (email.snippet && email.snippet.toLowerCase().includes(lowerQuery))
        );
      } catch (error) {
        lastError = error;

        if (error.status === 503 && attempt < 3) {
          console.log(
            `🔄 API overloaded, retrying in ${
              attempt * 2
            } seconds... (attempt ${attempt}/3)`
          );
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }

        // If not a retry-able error or max attempts reached, break
        break;
      }
    }

    // If we get here, all attempts failed
    throw lastError;
  } catch (error) {
    console.error("Error searching emails:", error);

    // Provide more specific error messages
    if (error.message.includes("fetch failed")) {
      console.log(
        "🌐 Network error: Unable to connect to Gemini AI. Using text search fallback."
      );
    } else if (error.message.includes("API key")) {
      console.log(
        "🔑 API key error: Invalid or missing Gemini API key. Using text search fallback."
      );
    } else if (error.message.includes("quota")) {
      console.log(
        "📊 Quota exceeded: Gemini API quota limit reached. Using text search fallback."
      );
    } else {
      console.log("⚠️  AI search failed. Using simple text search fallback.");
    }

    // Final fallback: simple text search
    const lowerQuery = query.toLowerCase();
    return emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(lowerQuery) ||
        email.from.toLowerCase().includes(lowerQuery) ||
        (email.snippet && email.snippet.toLowerCase().includes(lowerQuery))
    );
  }
}

/**
 * Auto-tag emails with custom labels
 * @param {Array} emails Array of email objects
 * @param {Function} progressCallback Optional callback for progress updates
 * @returns {Promise<Array>} Array of emails with tags
 */
async function autoTagEmails(emails, progressCallback = null) {
  try {
    const batchSize = config.batchSize;
    const taggedEmails = [];
    const batches = [];

    // Create batches
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      if (progressCallback) {
        progressCallback(i + 1, batches.length);
      }

      const batch = batches[i];
      const emailsData = batch.map((email) => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: email.date.toISOString(),
        content: email.body || email.snippet,
      }));

      const prompt = `
        Based on the content of these emails, suggest appropriate labels/tags from the following options:
        - Invoices
        - Leads
        - Personal
        - Projects
        - Follow-up
        
        You can suggest multiple labels if appropriate.
        
        Emails:
        ${JSON.stringify(emailsData, null, 2)}
        
        Respond in JSON format only with an array of results, one for each email:
        [
          {
            "id": "email_id_1",
            "tags": ["tag1", "tag2", ...],
            "confidence": <number between 0-100>
          },
          {
            "id": "email_id_2",
            ...
          }
        ]
      `;

      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
      if (jsonMatch) {
        const tagsResults = JSON.parse(jsonMatch[0]);

        // Map results back to emails by ID
        batch.forEach((email) => {
          const tagsResult = tagsResults.find((t) => t.id === email.id) || {
            tags: [],
            confidence: 0,
          };

          taggedEmails.push({
            ...email,
            tags: tagsResult,
          });
        });
      } else {
        // Return default tags on error
        batch.forEach((email) => {
          taggedEmails.push({
            ...email,
            tags: {
              tags: [],
              confidence: 0,
            },
          });
        });
      }
    }

    return taggedEmails;
  } catch (error) {
    console.error("Error auto-tagging emails:", error);
    // Return default tags on error
    return emails.map((email) => ({
      ...email,
      tags: {
        tags: [],
        confidence: 0,
      },
    }));
  }
}

/**
 * Generate email sentiment analysis
 * @param {Array} emails Array of email objects
 * @param {Function} progressCallback Optional callback for progress updates
 * @returns {Promise<Array>} Array of sentiment analysis results
 */
async function analyzeEmailSentiment(emails, progressCallback = null) {
  try {
    const batchSize = config.batchSize;
    const sentimentResults = [];
    const batches = [];

    // Create batches
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      if (progressCallback) {
        progressCallback(i + 1, batches.length);
      }

      const batch = batches[i];
      const emailsData = batch.map((email) => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: email.date.toISOString(),
        content: email.body || email.snippet,
      }));

      const prompt = `
        Analyze the sentiment of these emails. Determine if each is positive, negative, or neutral.
        Also identify if each is an appreciation, complaint, or request.
        
        Emails:
        ${JSON.stringify(emailsData, null, 2)}
        
        Respond in JSON format only with an array of results, one for each email:
        [
          {
            "id": "email_id_1",
            "sentiment": "positive|negative|neutral",
            "sentimentScore": <number between -1 and 1>,
            "type": "appreciation|complaint|request|information|other",
            "stressLevel": <number between 0-10>
          },
          {
            "id": "email_id_2",
            ...
          }
        ]
      `;

      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
      if (jsonMatch) {
        const batchResults = JSON.parse(jsonMatch[0]);
        sentimentResults.push(...batchResults);
      }
    }

    return sentimentResults;
  } catch (error) {
    console.error("Error analyzing email sentiment:", error);
    return emails.map((email) => ({
      id: email.id,
      sentiment: "neutral",
      sentimentScore: 0,
      type: "other",
      stressLevel: 5,
    }));
  }
}

/**
 * Check if emails need follow-up
 * @param {Array} emails Array of email objects
 * @param {Function} progressCallback Optional callback for progress updates
 * @returns {Promise<Array>} Array of emails with follow-up information
 */
async function checkNeedsFollowUp(emails, progressCallback = null) {
  try {
    const batchSize = config.batchSize;
    const followUpResults = [];
    const batches = [];

    // Create batches
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      if (progressCallback) {
        progressCallback(i + 1, batches.length);
      }

      const batch = batches[i];
      const emailsData = batch.map((email) => ({
        id: email.id,
        subject: email.subject,
        from: email.from,
        date: email.date.toISOString(),
        content: email.body || email.snippet,
      }));

      const prompt = `
        Analyze these emails and determine if each requires a follow-up response.
        Consider factors like:
        - Does it contain questions that need answers?
        - Does it request information or action?
        - Does the tone suggest an expectation of response?
        
        Emails:
        ${JSON.stringify(emailsData, null, 2)}
        
        Respond in JSON format only with an array of results, one for each email:
        [
          {
            "id": "email_id_1",
            "needsFollowUp": true|false,
            "confidence": <number between 0-100>,
            "reason": "brief explanation",
            "suggestedFollowUp": "suggested follow-up message"
          },
          {
            "id": "email_id_2",
            ...
          }
        ]
      `;

      const model = getModel();
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
      if (jsonMatch) {
        const batchResults = JSON.parse(jsonMatch[0]);

        // Map results back to emails
        batch.forEach((email) => {
          const followUpResult = batchResults.find(
            (r) => r.id === email.id
          ) || {
            needsFollowUp: false,
            confidence: 0,
            reason: "Error analyzing email",
            suggestedFollowUp: "",
          };

          followUpResults.push({
            ...email,
            followUp: followUpResult,
          });
        });
      } else {
        // Return default follow-up info on error
        batch.forEach((email) => {
          followUpResults.push({
            ...email,
            followUp: {
              needsFollowUp: false,
              confidence: 0,
              reason: "Error analyzing email",
              suggestedFollowUp: "",
            },
          });
        });
      }
    }

    return followUpResults;
  } catch (error) {
    console.error("Error checking follow-up need:", error);
    return emails.map((email) => ({
      ...email,
      followUp: {
        needsFollowUp: false,
        confidence: 0,
        reason: "Error analyzing email",
        suggestedFollowUp: "",
      },
    }));
  }
}

/**
 * Generate full email reply draft
 * @param {Object} email Email object
 * @returns {Promise<string>} Full email reply draft
 */
async function generateFullReplyDraft(email) {
  try {
    const prompt = `
      Generate a full professional reply draft for this email, including greeting, body, and closing.
      The reply should reflect the appropriate urgency, tone (friendly or formal based on context),
      and address all questions or expected outcomes mentioned.
      
      Email Subject: ${email.subject}
      From: ${email.from}
      Date: ${email.date}
      Content: ${email.body || email.snippet}
      
      Generate only the reply text, without any additional formatting or explanation.
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating reply draft:", error);
    return "Failed to generate a reply draft.";
  }
}

/**
 * Update configuration
 * @param {Object} newConfig New configuration object
 * @returns {Promise<Object>} Updated configuration
 */
async function updateConfig(newConfig) {
  try {
    const configPath = path.join(__dirname, "../../config.json");
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    await fs.writeJson(configPath, updatedConfig, { spaces: 2 });

    return updatedConfig;
  } catch (error) {
    console.error("Error updating configuration:", error);
    throw error;
  }
}

/**
 * Get current configuration
 * @returns {Object} Current configuration
 */
function getConfig() {
  return loadConfig();
}

module.exports = {
  analyzeEmails,
  extractCalendarEvents,
  extractCalendarEventsFromEmails,
  searchEmailsWithNLP,
  autoTagEmails,
  analyzeEmailSentiment,
  checkNeedsFollowUp,
  generateFullReplyDraft,
  updateConfig,
  getConfig,
  checkAIConfiguration,
  parseAIResponse,
  classifyEmailPriorityBatch,
  generateEmailSummaryBatch,
};
