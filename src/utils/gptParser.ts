export interface ParsedResponse {
  message: string;
  actions: string[];
  activeModule: string | null;
  data: any;
}

export class GPTParser {
  async processInput(input: string): Promise<ParsedResponse> {
    const response = await fetch('http://localhost:5000/api/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });

    const json = await response.json();

    return {
      message: json.message,
      actions: [],
      activeModule: null,
      data: {}
    };
  }
}

export const gptParser = new GPTParser();
