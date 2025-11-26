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

export const parseEventFromText = async (text: string): Promise<ParseResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

  } catch (error) {
    console.error("Error parsing event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse event details.",
    };
  }
};