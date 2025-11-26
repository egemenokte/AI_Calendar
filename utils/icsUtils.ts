import { CalendarEvent } from "../types";

/**
 * Formats a Date object to ICS date string format: YYYYMMDDTHHMMSSZ
 * Converts to UTC to ensure universal compatibility.
 */
const formatDateToICS = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates the content of an .ics file from a CalendarEvent object.
 */
export const generateICSFileContent = (event: CalendarEvent): string => {
  const { summary, description, location, startDate, endDate, attendees } = event;

  const now = formatDateToICS(new Date().toISOString());
  const start = formatDateToICS(startDate);
  const end = formatDateToICS(endDate);
  
  // Clean text to avoid breaking ICS format (newlines need escaping)
  const cleanSummary = summary.replace(/\n/g, '\\n');
  const cleanDesc = description ? description.replace(/\n/g, '\\n') : '';
  const cleanLoc = location ? location.replace(/\n/g, '\\n') : '';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QuickCal//AI Event Generator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST', // "REQUEST" works better for invites with attendees
    'BEGIN:VEVENT',
    `UID:${now}-${Math.random().toString(36).substr(2, 9)}@quickcal.ai`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLoc}`,
    `STATUS:CONFIRMED`,
  ];

  // Add attendees
  if (attendees && attendees.length > 0) {
    attendees.forEach(email => {
      // Basic attendee format. For better Outlook support, CN (Common Name) is nice but optional.
      icsContent.push(`ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:${email}`);
    });
  }

  icsContent.push('END:VEVENT');
  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n'); // CRLF is required by ICS spec
};

export const downloadICS = (event: CalendarEvent) => {
  const content = generateICSFileContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.summary.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};