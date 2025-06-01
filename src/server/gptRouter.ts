
import OpenAI from 'openai';
import { gptFunctions } from './gptFunctions';
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
    
    switch (functionName) {
      case 'createMeal':
        const meal = await mealsService.create({
          name: args.name,
          meal_type: args.meal_type,
          planned_date: args.planned_date,
          calories: args.calories,
          ingredients: args.ingredients ? JSON.stringify(args.ingredients) : null,
          instructions: args.instructions,
          user_id: 'temp-user' // TODO: Replace with actual user ID from auth
        });
        return { success: true, data: meal };

      case 'scheduleWorkout':
        const workout = await workoutsService.create({
          name: args.name,
          duration: args.duration,
          intensity: args.intensity,
          shceduled_date: args.shceduled_date,
          user_id: 'temp-user' // TODO: Replace with actual user ID from auth
        });
        return { success: true, data: workout };

      case 'addTask':
        const task = await tasksService.create({
          title: args.title,
          description: args.description,
          due_date: args.due_date,
          user_id: 'temp-user' // TODO: Replace with actual user ID from auth
        });
        return { success: true, data: task };

      case 'addReminder':
        const reminder = await remindersService.create({
          title: args.title,
          due_date: args.due_date,
          user_id: 'temp-user' // TODO: Replace with actual user ID from auth
        });
        return { success: true, data: reminder };

      case 'createTimeBlock':
        const timeBlock = await timeBlocksService.create({
          title: args.title,
          start_time: args.start_time,
          end_time: args.end_time,
          category: args.category,
          linked_task_id: args.linked_task_id,
          user_id: 'temp-user' // TODO: Replace with actual user ID from auth
        });
        return { success: true, data: timeBlock };

      default:
        return { success: false, error: `Unknown function: ${functionName}` };
    }
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
          content: "You are a helpful life planning assistant. Use the provided functions to help users organize their meals, workouts, tasks, reminders, and schedule."
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