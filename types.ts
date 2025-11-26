export interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  startDate: string; // ISO 8601 string
  endDate: string;   // ISO 8601 string
  attendees: string[];
}

export interface ParseResult {
  success: boolean;
  event?: CalendarEvent;
  error?: string;
}