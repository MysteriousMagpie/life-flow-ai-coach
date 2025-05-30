import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getGptResponseWithFunctions } from './src/server/gptRouter';
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
  const { message, userId } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
      actions: [],
      actionResults: [],
      activeModule: null
    });
  }

  if (!message || !userId) {
    return res.status(400).json({
      message: 'Missing required fields: message and userId',
      actions: [],
      actionResults: [],
      activeModule: null
    });
  }

  try {
    console.log('[GPT REQUEST]', { message, userId });

    // Use gptParser to process the input and get structured response
    const parsedResponse = await gptParser.processInput(message);
    console.log('[GPT PARSED]', { 
      message: parsedResponse.message.substring(0, 100) + '...', 
      actionsCount: parsedResponse.actions.length 
    });

    // Execute actions if any
    let actionResults = [];
    if (parsedResponse.actions && parsedResponse.actions.length > 0) {
      console.log('[EXECUTING ACTIONS]', parsedResponse.actions);
      actionResults = await backendActionExecutor.executeActions(parsedResponse.actions, userId);
      console.log('[ACTION RESULTS]', actionResults);
    }

    const response = {
      message: parsedResponse.message,
      actions: parsedResponse.actions || [],
      actionResults,
      activeModule: parsedResponse.activeModule
    };

    console.log('[GPT RESPONSE]', { 
      message: response.message.substring(0, 100) + '...', 
      actionsCount: response.actions.length,
      resultsCount: actionResults.length,
      activeModule: response.activeModule
    });

    res.json(response);
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
