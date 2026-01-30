import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CalendarEvent, ParseResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const eventSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "The title or name of the event.",
    },
    location: {
      type: Type.STRING,
      description: "The physical location or address of the event.",
    },
    description: {
      type: Type.STRING,
      description: "Any additional notes, context, or details extracted from the text.",
    },
    startDate: {
      type: Type.STRING,
      description: "The start date and time in ISO 8601 format (e.g. 2025-12-15T17:00:00-05:00). Crucial: You must infer the timezone offset based on the location (e.g., UMass Amherst is US/Eastern).",
    },
    endDate: {
      type: Type.STRING,
      description: "The end date and time in ISO 8601 format. Calculate this based on duration or explicit end time.",
    },
    attendees: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of email addresses found in the text to be invited.",
    },
  },
  required: ["summary", "startDate", "endDate"],
};

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const parseEventFromText = async (text: string): Promise<ParseResult> => {
  const MAX_RETRIES = 3;
  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract calendar event details from the following text: "${text}". 
        
        Timezone Rules:
        1. Analyze the location to determine the Time Zone (e.g., 'UMass Amherst', 'Boston', 'NYC' = Eastern Time).
        2. If the location suggests a specific timezone, apply the correct UTC offset to the ISO 8601 dates (e.g., -05:00 or -04:00 depending on Daylight Savings).
        3. If no location context implies a timezone, assume the user's text implies local time and use the current UTC offset or default to UTC if completely ambiguous.
        4. Ensure startDate and endDate are full ISO 8601 strings including the offset.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: eventSchema,
          temperature: 0.1, // Low temperature for deterministic extraction
        },
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

      const eventData = JSON.parse(response.text) as CalendarEvent;
      
      // Basic validation to ensure dates are valid
      if (isNaN(new Date(eventData.startDate).getTime())) {
        throw new Error("Invalid start date parsed");
      }

      return {
        success: true,
        event: eventData,
      };

    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Check for Resource Exhausted (429) or Service Unavailable (503)
      // The error message or status code might vary depending on the exact SDK version/response
      const isQuotaError = error.message?.includes('429') || 
                           error.message?.toLowerCase().includes('resource exhausted') ||
                           error.status === 429 ||
                           error.status === 503;

      if (isQuotaError && attempt < MAX_RETRIES - 1) {
        const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
        console.warn(`Quota hit. Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      
      // If it's not a quota error, or we ran out of retries, stop trying.
      break;
    }
  }

  // Format the error message for the UI
  let errorMessage = lastError instanceof Error ? lastError.message : "Failed to parse event details.";
  
  if (errorMessage.toLowerCase().includes('resource exhausted') || errorMessage.includes('429')) {
    errorMessage = "We're receiving too many requests right now (Quota Limit). Please wait a moment and try again.";
  }

  return {
    success: false,
    error: errorMessage,
  };
};