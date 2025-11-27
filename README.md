# QuickCal - AI Calendar Generator

QuickCal is a web application that converts natural language text—such as emails, event flyers, or chat messages—into downloadable `.ics` calendar files. These files are compatible with Outlook, Apple Calendar, and Google Calendar.

It leverages **Google Gemini** to intelligently extract:
- Event Summaries
- Locations
- Dates & Times (with timezone inference)
- Descriptions
- Attendee emails

## Usage

1. Paste your text into the input box.
2. Click **Generate .ics**.
3. Review the extracted details.
4. Download the file and import it into your calendar.

## Development

To use this code, you must provide your own API Key.

1. Obtain an API Key from [Google AI Studio](https://aistudio.google.com/).
2. Ensure `process.env.API_KEY` is available in your build environment.

## Disclaimer

This tool uses generative AI to interpret text. It **may contain errors** or inaccuracies, specifically regarding complex timezone calculations. Please verify all details before relying on the calendar entry.

---

**Vibecoded by Egemen Okte**