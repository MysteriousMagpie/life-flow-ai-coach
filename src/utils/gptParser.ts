// src/utils/gptParser.ts
import OpenAI from "openai";

export interface ParsedResponse {
  message: string;
  actions: string[];
  activeModule: string | null;
  data: Record<string, unknown>;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
});

export class GPTParser {
  /**
   * Send the user prompt to GPT-4o and return plain-text + routing hints.
   */
  async processInput(input: string): Promise<ParsedResponse> {
    // 1️⃣ – Build a chat completion request
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",          // or gpt-4o-mini / gpt-3.5-turbo
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are Life-Flow, an AI that helps users plan meals, " +
            "workouts, tasks and calendar events. " +
            "When useful, include an `activeModule` field in JSON to " +
            "tell the UI which module to open."
        },
        { role: "user", content: input }
      ],
      response_format: { type: "json_object" } // new structured-output helper
    });

    // 2️⃣ – The model now answers in JSON.  Parse it defensively.
    let parsed: ParsedResponse = {
      message: "Something went wrong.",
      actions: [],
      activeModule: null,
      data: {}
    };

    try {
      parsed = JSON.parse(
        completion.choices[0].message?.content ?? "{}"
      ) as ParsedResponse;
    } catch {
      // fallback: treat raw text as message only
      parsed.message =
        completion.choices[0].message?.content ??
        "I didn't understand that.";
    }

    return parsed;
  }
}

export const gptParser = new GPTParser();
