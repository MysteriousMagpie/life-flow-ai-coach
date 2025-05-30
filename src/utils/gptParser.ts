
import { intentDetector } from './planning/intentDetector';
import { actionParser } from './parsing/actionParser';
import { moduleDetector } from './parsing/moduleDetector';

export interface ParsedResponse {
  message: string;
  actions: GPTAction[];
  activeModule: string | null;
  data: any;
  functionResults?: any[];
}

export interface GPTAction {
  type: 'create' | 'update' | 'delete' | 'list' | 'complete' | 'incomplete' | 'analyze' | 'optimize' | 'suggest';
  module: 'meals' | 'tasks' | 'workouts' | 'reminders' | 'time_blocks' | 'analysis';
  data?: any;
  id?: string;
  functionName?: string;
}

export class GPTParser {
  async processInput(input: string): Promise<ParsedResponse> {
    try {
      const response = await fetch('http://localhost:5000/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Parse function calls from GPT response
      const actions = actionParser.parseFunctionCalls(json.function_calls || []);
      
      return {
        message: json.message || "I'm here to help you plan your life better!",
        actions,
        activeModule: moduleDetector.determineActiveModule(actions),
        data: json.data || {},
        functionResults: json.function_results || []
      };
    } catch (error) {
      console.error('GPT Parser Error:', error);
      return {
        message: "I'm having trouble connecting to my AI services. Please try again.",
        actions: [],
        activeModule: null,
        data: {},
        functionResults: []
      };
    }
  }

  // Enhanced planning input detection
  detectPlanningIntent(input: string) {
    return intentDetector.detectPlanningIntent(input);
  }
}

export const gptParser = new GPTParser();
