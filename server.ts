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
      conversationMessages = messages;
    } else if (message) {
      conversationMessages = [
        {
          role: "system",
          content: "You are a helpful life planning assistant. Use the provided functions to help users organize their meals, workouts, tasks, reminders, and schedule. Be conversational and helpful."
        },
        { role: "user", content: message }
      ];
    }

    const executedActions: any[] = [];
    const maxIterations = 10; // Prevent infinite loops
    let iterations = 0;

    // Recursive function calling loop
    while (iterations < maxIterations) {
      console.log(`[GPT ITERATION ${iterations + 1}]`, { messagesCount: conversationMessages.length });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: conversationMessages,
        functions: gptFunctions.map(func => ({
          name: func.name,
          description: func.description,
          parameters: func.parameters
        })),
        function_call: "auto",
        temperature: 0.7
      });

      const assistantMessage = completion.choices[0].message;
      
      // Add assistant message to conversation
      conversationMessages.push({
        role: "assistant",
        content: assistantMessage.content,
        function_call: assistantMessage.function_call
      });

      // Check if there's a function call to execute
      if (assistantMessage.function_call) {
        try {
          const functionName = assistantMessage.function_call.name;
          const args = JSON.parse(assistantMessage.function_call.arguments || '{}');
          
          console.log(`[FUNCTION CALL] ${functionName}`, args);
          
          // Execute the function call
          const result = await parseFunctionCall(functionName, args);
          
          // Track the executed action
          executedActions.push({
            function: functionName,
            arguments: args,
            result: result
          });

          // Add function result to conversation
          conversationMessages.push({
            role: "function",
            name: functionName,
            content: JSON.stringify(result)
          });

          console.log(`[FUNCTION RESULT] ${functionName}`, { success: result.success });
        } catch (functionError) {
          console.error('[FUNCTION EXECUTION ERROR]', functionError);
          
          // Add error to conversation so GPT can handle it
          conversationMessages.push({
            role: "function",
            name: assistantMessage.function_call.name,
            content: JSON.stringify({
              success: false,
              error: functionError instanceof Error ? functionError.message : 'Unknown error'
            })
          });
        }
        
        iterations++;
        continue; // Continue the loop for next GPT call
      } else {
        // No more function calls, we're done
        console.log('[GPT COMPLETE]', { iterations, actionsExecuted: executedActions.length });
        
        const response = {
          message: assistantMessage.content || "I'm here to help you plan your life better!",
          actions: executedActions,
          actionResults: executedActions.map(action => action.result),
          activeModule: null // Could be enhanced to detect active module
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

  try {
    console.log('[ICAL REQUEST]', { userId });

    const timeBlocks = await timeBlocksService.getAll();
    
    // Filter time blocks for the specific user (when proper auth is implemented)
    // For now, we'll export all time blocks since we're using temp-user
    const userTimeBlocks = timeBlocks.filter(block => block.user_id === userId || block.user_id === 'temp-user');

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
