import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { gptFunctions } from './src/server/gptFunctions';
import { parseFunctionCall } from './src/server/gptRouter';
import { gptParser } from './src/utils/gptParser';
import { ActionExecutor } from './src/utils/actionExecutor';
import { mealsService } from './src/services/mealsService';
import { tasksService } from './src/services/tasksService';
import { workoutsService } from './src/services/workoutsService';
import { remindersService } from './src/services/remindersService';
import { timeBlocksService } from './src/services/timeBlocksService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to execute addMeal
async function addMeal(args: any, userId: string) {
  try {
    console.log('[ADD MEAL] Executing with args:', args);
    
    const mealData = {
      user_id: userId,
      name: args.name,
      meal_type: args.meal_type || 'breakfast',
      planned_date: args.planned_date,
      calories: args.calories || null,
      ingredients: args.ingredients ? JSON.stringify(args.ingredients) : null,
      instructions: args.instructions || null
    };

    const meal = await mealsService.create(mealData);
    console.log('[ADD MEAL] Successfully created meal:', meal);

    // Create time block for the meal
    if (args.meal_type && args.planned_date) {
      const mealTimes = {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '18:30',
        snack: '15:00'
      };

      const mealTime = mealTimes[args.meal_type] || '12:00';
      const [hours, minutes] = mealTime.split(':').map(Number);
      
      const startTime = new Date(args.planned_date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 30);

      const timeBlockData = {
        user_id: userId,
        title: `${args.meal_type.charAt(0).toUpperCase() + args.meal_type.slice(1)}: ${args.name}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category: 'meal'
      };

      await timeBlocksService.create(timeBlockData);
      console.log('[ADD MEAL] Successfully created time block');
    }

    return { success: true, meal };
  } catch (error) {
    console.error('[ADD MEAL] Error:', error);
    throw error;
  }
}

// Backend action executor that uses services directly
const backendActionExecutor = {
  async executeActions(actions: any[], userId: string) {
    const results = [];
    
    for (const action of actions) {
      try {
        const result = await this.executeAction(action, userId);
        results.push(result);
      } catch (error) {
        console.error('Action execution error:', error);
        results.push({
          success: false,
          message: `Failed to execute ${action.functionName || action.type} ${action.module}`,
          error: error instanceof Error ? error.message : 'Unknown error',
          functionName: action.functionName
        });
      }
    }
    
    return results;
  },

  async executeAction(action: any, userId: string) {
    const dataWithUserId = action.data ? { ...action.data, user_id: userId } : { user_id: userId };

    switch (action.module) {
      case 'meals':
        return this.executeMealAction(action, dataWithUserId);
      case 'tasks':
        return this.executeTaskAction(action, dataWithUserId);
      case 'workouts':
        return this.executeWorkoutAction(action, dataWithUserId);
      case 'reminders':
        return this.executeReminderAction(action, dataWithUserId);
      case 'time_blocks':
        return this.executeTimeBlockAction(action, dataWithUserId);
      case 'analysis':
        return this.executeAnalysisAction(action, dataWithUserId);
      default:
        throw new Error(`Unknown module: ${action.module}`);
    }
  },

  async executeMealAction(action: any, data: any) {
    switch (action.type) {
      case 'create':
        const meal = await mealsService.create(data);
        return {
          success: true,
          message: `Created meal: ${data.name}`,
          data: meal,
          functionName: action.functionName
        };
      case 'delete':
        if (action.id) {
          await mealsService.delete(action.id);
          return {
            success: true,
            message: 'Meal deleted successfully',
            functionName: action.functionName
          };
        }
        throw new Error('No meal ID provided for deletion');
      default:
        throw new Error(`Unsupported meal action: ${action.type}`);
    }
  },

  async executeTaskAction(action: any, data: any) {
    switch (action.type) {
      case 'create':
        const task = await tasksService.create(data);
        return {
          success: true,
          message: `Created task: ${data.title}`,
          data: task,
          functionName: action.functionName
        };
      case 'complete':
        if (action.id) {
          await tasksService.markComplete(action.id);
          return {
            success: true,
            message: 'Task marked as complete',
            functionName: action.functionName
          };
        }
        throw new Error('No task ID provided for completion');
      case 'delete':
        if (action.id) {
          await tasksService.delete(action.id);
          return {
            success: true,
            message: 'Task deleted successfully',
            functionName: action.functionName
          };
        }
        throw new Error('No task ID provided for deletion');
      default:
        throw new Error(`Unsupported task action: ${action.type}`);
    }
  },

  async executeWorkoutAction(action: any, data: any) {
    switch (action.type) {
      case 'create':
        const workout = await workoutsService.create(data);
        return {
          success: true,
          message: `Created workout: ${data.name}`,
          data: workout,
          functionName: action.functionName
        };
      case 'complete':
        if (action.id) {
          await workoutsService.markComplete(action.id);
          return {
            success: true,
            message: 'Workout marked as complete',
            functionName: action.functionName
          };
        }
        throw new Error('No workout ID provided for completion');
      case 'delete':
        if (action.id) {
          await workoutsService.delete(action.id);
          return {
            success: true,
            message: 'Workout deleted successfully',
            functionName: action.functionName
          };
        }
        throw new Error('No workout ID provided for deletion');
      default:
        throw new Error(`Unsupported workout action: ${action.type}`);
    }
  },

  async executeReminderAction(action: any, data: any) {
    switch (action.type) {
      case 'create':
        const reminder = await remindersService.create(data);
        return {
          success: true,
          message: `Created reminder: ${data.title}`,
          data: reminder,
          functionName: action.functionName
        };
      case 'delete':
        if (action.id) {
          await remindersService.delete(action.id);
          return {
            success: true,
            message: 'Reminder deleted successfully',
            functionName: action.functionName
          };
        }
        throw new Error('No reminder ID provided for deletion');
      default:
        throw new Error(`Unsupported reminder action: ${action.type}`);
    }
  },

  async executeTimeBlockAction(action: any, data: any) {
    switch (action.type) {
      case 'create':
        const timeBlock = await timeBlocksService.create(data);
        return {
          success: true,
          message: `Created time block: ${data.title}`,
          data: timeBlock,
          functionName: action.functionName
        };
      case 'update':
        if (action.id && data.new_time) {
          await timeBlocksService.update(action.id, {
            start_time: new Date(data.new_time).toISOString(),
            end_time: new Date(new Date(data.new_time).getTime() + 60 * 60 * 1000).toISOString()
          });
          return {
            success: true,
            message: `Event rescheduled successfully${data.reason ? ': ' + data.reason : ''}`,
            functionName: action.functionName
          };
        }
        throw new Error('No event ID or new time provided for rescheduling');
      case 'delete':
        if (action.id) {
          await timeBlocksService.delete(action.id);
          return {
            success: true,
            message: 'Time block deleted successfully',
            functionName: action.functionName
          };
        }
        throw new Error('No time block ID provided for deletion');
      default:
        throw new Error(`Unsupported time block action: ${action.type}`);
    }
  },

  async executeAnalysisAction(action: any, data: any) {
    return {
      success: true,
      message: 'Analysis completed',
      data,
      functionName: action.functionName
    };
  }
};

app.post('/api/gpt', async (req, res) => {
  const { message, messages, userId } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
      actions: [],
      actionResults: [],
      activeModule: null
    });
  }

  if (!userId) {
    return res.status(400).json({
      message: 'Missing required field: userId',
      actions: [],
      actionResults: [],
      activeModule: null
    });
  }

  try {
    console.log('[GPT REQUEST]', { message, userId, messagesCount: messages?.length });

    let conversationMessages: OpenAI.ChatCompletionMessageParam[] = [];
    
    // Handle both legacy single message and new messages array format
    if (messages && Array.isArray(messages)) {
      // Filter out any assistant messages that might have tool_calls to prevent duplication
      conversationMessages = messages.filter(msg => 
        !(msg.role === 'assistant' && msg.tool_calls)
      );
    } else if (message) {
      conversationMessages = [
        {
          role: "system",
          content: "You are a helpful life planning assistant. You have the following tools: addMeal (store meals in meal planner). Use addMeal whenever a user asks to create, add, or schedule a meal. Help users organize their meals, workouts, tasks, reminders, and schedule."
        },
        { role: "user", content: message }
      ];
    }

    const executedActions: any[] = [];
    const maxIterations = 10;
    let iterations = 0;

    // Convert gptFunctions to tools format
    const tools = gptFunctions.map(func => ({
      type: "function" as const,
      function: {
        name: func.name,
        description: func.description,
        parameters: func.parameters
      }
    }));

    // Tool-calling loop - keep internal conversation separate from user-visible messages
    let internalMessages = [...conversationMessages];

    while (iterations < maxIterations) {
      console.log(`[GPT ITERATION ${iterations + 1}]`, { messagesCount: internalMessages.length });

      const params = {
        model: "gpt-4o-mini" as const,
        messages: internalMessages,
        tools: tools,
        tool_choice: "auto" as const,
        temperature: 0.7
      };
      
      console.log('[PAYLOAD]', { toolCount: params.tools.length });

      const completion = await openai.chat.completions.create(params);
      const choice = completion.choices[0];
      
      console.log('[DEBUG] OpenAI Response:', {
        finish_reason: choice.finish_reason,
        has_tool_calls: !!choice.message.tool_calls,
        tool_calls_count: choice.message.tool_calls?.length || 0
      });

      // Tool call round - handle internally without exposing to user
      if (choice.finish_reason === "tool_calls") {
        // Add assistant message with tool calls to internal conversation only
        internalMessages.push({
          role: "assistant",
          content: choice.message.content,
          tool_calls: choice.message.tool_calls
        });

        // Process each tool call
        for (const toolCall of choice.message.tool_calls || []) {
          if (toolCall.type === "function" && toolCall.function?.name === "addMeal") {
            try {
              console.log('[FUNCTION CALL] addMeal', toolCall.function.arguments);
              const args = JSON.parse(toolCall.function.arguments);
              await addMeal(args, userId);
              
              executedActions.push({
                function: "addMeal",
                arguments: args,
                result: { success: true }
              });

              // Add tool response to internal conversation only
              internalMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ status: "success", message: "Meal added successfully" })
              });

              console.log('[FUNCTION RESULT] addMeal success');
            } catch (error) {
              console.error('[FUNCTION ERROR] addMeal:', error);
              
              internalMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ status: "error", message: error.message })
              });
            }
          } else {
            // Handle other tool calls through existing system
            try {
              const functionName = toolCall.function?.name;
              const args = JSON.parse(toolCall.function?.arguments || '{}');
              
              console.log(`[FUNCTION CALL] ${functionName}`, args);
              
              const result = await parseFunctionCall(functionName, args);
              
              executedActions.push({
                function: functionName,
                arguments: args,
                result: result
              });

              internalMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
              });

              console.log(`[FUNCTION RESULT] ${functionName}`, { success: result.success });
            } catch (functionError) {
              console.error('[FUNCTION EXECUTION ERROR]', functionError);
              
              internalMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  success: false,
                  error: functionError instanceof Error ? functionError.message : 'Unknown error'
                })
              });
            }
          }
        }
        
        iterations++;
        continue; // Loop again for natural language response
      } else {
        // Normal exit - send final assistant content to client
        console.log('[GPT COMPLETE]', { iterations, actionsExecuted: executedActions.length });
        
        const response = {
          message: choice.message.content || "I'm here to help you plan your life better!",
          actions: executedActions,
          actionResults: executedActions.map(action => action.result),
          activeModule: null
        };

        console.log('[GPT RESPONSE]', { 
          message: response.message?.substring(0, 100) + '...', 
          actionsCount: response.actions.length,
          resultsCount: response.actionResults.length
        });

        return res.json(response);
      }
    }

    // If we hit max iterations, return what we have
    console.log('[GPT MAX ITERATIONS REACHED]', { iterations, actionsExecuted: executedActions.length });
    
    return res.json({
      message: "I've completed the requested actions, though the conversation may have been truncated due to complexity.",
      actions: executedActions,
      actionResults: executedActions.map(action => action.result),
      activeModule: null
    });

  } catch (error) {
    console.error('[GPT ERROR]', error);
    
    let errorMessage = 'I encountered an error while processing your request.';
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing settings.';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      actions: [],
      actionResults: [],
      activeModule: null
    });
  }
});

// Calendar export endpoint
app.get('/api/ical/:userId', async (req, res) => {
  const { userId } = req.params;

  // Validate that userId is provided and not empty
  if (!userId || userId === 'undefined' || userId === 'null') {
    return res.status(400).json({ 
      message: 'User ID is required for calendar export',
      error: 'Missing or invalid user ID'
    });
  }

  try {
    console.log('[ICAL REQUEST]', { userId });

    const timeBlocks = await timeBlocksService.getAll();
    
    // Filter time blocks for the specific authenticated user only
    const userTimeBlocks = timeBlocks.filter(block => block.user_id === userId);

    if (userTimeBlocks.length === 0) {
      console.log('[ICAL NO DATA]', { userId, message: 'No time blocks found for user' });
    }

    const { CalendarGenerator } = await import('./src/lib/calendar.js');
    const icsContent = CalendarGenerator.timeBlocksToICS(userTimeBlocks);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="life-flow.ics"');
    res.send(icsContent);

    console.log('[ICAL RESPONSE]', { timeBlocksCount: userTimeBlocks.length });
  } catch (error) {
    console.error('[ICAL ERROR]', error);
    res.status(500).json({ 
      message: 'Failed to generate calendar export',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📡 OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
});
