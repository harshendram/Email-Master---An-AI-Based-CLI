const icalGenerator = require('ical-generator');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

// Get reports directory from env or use default
const REPORTS_DIR = process.env.REPORTS_DIR || path.join(__dirname, '../../reports');

/**
 * Generate ICS file from calendar events
 * @param {Array} events Array of calendar events
 * @returns {Promise<string>} Path to ICS file
 */
async function generateICSFile(events) {
  // Ensure reports directory exists
  await fs.ensureDir(REPORTS_DIR);
  
  // Create calendar
  const calendar = icalGenerator.default({ name: 'EmailMaster Calendar' });
  
  // Add events to calendar
  events.forEach(event => {
    const startDate = moment(`${event.date} ${event.time || '00:00'}`, 'YYYY-MM-DD HH:mm');
    let endDate;
    
    if (event.endTime) {
      endDate = moment(`${event.date} ${event.endTime}`, 'YYYY-MM-DD HH:mm');
    } else if (event.time) {
      // Default to 1 hour duration if only start time is provided
      endDate = moment(startDate).add(1, 'hour');
    } else {
      // All-day event
      endDate = moment(startDate).add(1, 'day');
    }
    
    calendar.createEvent({
      start: startDate.toDate(),
      end: endDate.toDate(),
      summary: event.title,
      description: event.description || '',
      allDay: !event.time
    });
  });
  
  // Generate filename with timestamp
  const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
  const filename = `calendar_events_${timestamp}.ics`;
  const filePath = path.join(REPORTS_DIR, filename);
  
  // Write ICS file
  await fs.writeFile(filePath, calendar.toString());
  
  return filePath;
}

/**
 * Generate plain text calendar snippet
 * @param {Array} events Array of calendar events
 * @returns {string} Plain text calendar snippet
 */
function generatePlainTextCalendar(events) {
  if (events.length === 0) {
    return 'No calendar events found.';
  }
  
  let text = 'Calendar Events:\n\n';
  
  events.forEach((event, index) => {
    text += `${index + 1}. ${event.title}\n`;
    text += `   Date: ${event.date}\n`;
    
    if (event.time) {
      text += `   Time: ${event.time}`;
      if (event.endTime) {
        text += ` - ${event.endTime}`;
      }
      text += '\n';
    } else {
      text += '   All day event\n';
    }
    
    if (event.description) {
      text += `   Description: ${event.description}\n`;
    }
    
    text += '\n';
  });
  
  text += 'To add these events to your calendar, use the generated ICS file or copy the details above.';
  
  return text;
}

module.exports = {
  generateICSFile,
  generatePlainTextCalendar
};
