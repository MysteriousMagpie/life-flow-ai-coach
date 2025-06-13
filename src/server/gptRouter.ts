
import OpenAI from 'openai';
import { gptFunctions, executeFunctionCall } from './gptFunctions';
import { mealsService } from '../services/mealsService';
import { workoutsService } from '../services/workoutsService';
import { tasksService } from '../services/tasksService';
import { remindersService } from '../services/remindersService';
import { timeBlocksService } from '../services/timeBlocksService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface FunctionCallResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function parseFunctionCall(functionName: string, args: any): Promise<FunctionCallResult> {
  try {
    console.log(`[FUNCTION CALL] ${functionName}`, args);
    
    // Use the centralized function executor
    const result = await executeFunctionCall(functionName, args);
    return result;
  } catch (error) {
    console.error(`[FUNCTION CALL ERROR] ${functionName}:`, error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    } else {
    return { success: false, error: 'An unknown error occurred' };
    }
  } 
}

export async function getGptResponseWithFunctions(input: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful life planning assistant. Use the provided functions to help users organize their meals, workouts, tasks, reminders, and schedule. When users mention adding meals to their planner, use the addMeal function."
        },
        { role: "user", content: input }
      ],
      functions: gptFunctions.map(func => ({
        name: func.name,
        description: func.description,
        parameters: func.parameters
      })),
      function_call: "auto",
      temperature: 0.7
    });

    const message = completion.choices[0].message;
    const content = message.content || "I'm here to help you plan your life better!";

    // Handle function calls
    const functionResults = [];
    if (message.function_call) {
      try {
        const functionName = message.function_call.name;
        const args = JSON.parse(message.function_call.arguments || '{}');
        const result = await parseFunctionCall(functionName, args);
        functionResults.push({
          function: functionName,
          ...result
        });
      } catch (parseError) {
        console.error('[FUNCTION PARSE ERROR]', parseError);
        functionResults.push({
          function: message.function_call.name,
          success: false,
          error: 'Failed to parse function arguments'
        });
      }
    }

    return {
      message: content,
      function_calls: message.function_call ? [{
        name: message.function_call.name,
        arguments: JSON.parse(message.function_call.arguments || '{}')
      }] : [],
      function_results: functionResults,
      data: functionResults.length > 0 ? functionResults[0].data : null
    };
  } catch (error) {
    console.error('[GPT ERROR]', error);
    throw error;
  }
}