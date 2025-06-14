import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Minimal addMeal stub for tool-call demos
export async function addMeal(args: any, userId: string) {
  console.log('[ADD MEAL] called', { args, userId });
  return { success: true };
}

// Define GPT tools
const gptTools = [
  {
    type: 'function' as const,
    function: {
      name: 'addMeal',
      description: 'Add a meal to the meal planner',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the meal' },
          meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          planned_date: { type: 'string', format: 'date', description: 'Date for the meal (YYYY-MM-DD)' },
          calories: { type: 'number', description: 'Estimated calories' },
          ingredients: { type: 'array', items: { type: 'string' }, description: 'List of ingredients' },
          instructions: { type: 'string', description: 'Cooking instructions' }
        },
        required: ['name', 'meal_type', 'planned_date']
      }
    }
  }
];

// Minimal stub for calendar operations
const timeBlocksService = {
  getAll: async () => [],
  create: async () => undefined
};

// /api/gpt route
app.post('/api/gpt', async (req: Request, res: Response): Promise<void> => {
  const { message, messages, userId } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      message: 'OpenAI API key not configured. Please set OPENAI_API_KEY.',
      actions: [],
      actionResults: [],
      activeModule: null
    });
    return;
  }

  if (!userId) {
    res.status(400).json({
      message: 'Missing required field: userId',
      actions: [],
      actionResults: [],
      activeModule: null
    });
    return;
  }

  try {
    console.log('[GPT REQUEST]', { message, userId, messagesCount: messages?.length });

    let conversationMessages: OpenAI.ChatCompletionMessageParam[] = [];
    if (messages && Array.isArray(messages) && messages.length > 0) {
      conversationMessages = messages;
    } else {
      conversationMessages = [
        {
          role: 'system',
          content:
            'You are a helpful life planning assistant. You have the following tools: addMeal (store meals in meal planner). Use addMeal whenever a user asks to create, add, or schedule a meal. Help users organize their meals, workouts, tasks, reminders, and schedule.'
        },
        { role: 'user', content: message }
      ];
    }

    const executedActions: any[] = [];
    const maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      console.log(`[GPT ITERATION ${iterations + 1}]`, { messagesCount: conversationMessages.length });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: conversationMessages,
        tools: gptTools,
        tool_choice: 'auto',
        temperature: 0.7
      });

      const choice = completion.choices[0];

      console.log('[DEBUG] OpenAI Response:', {
        finish_reason: choice.finish_reason,
        has_tool_calls: !!choice.message.tool_calls
      });

      if (choice.finish_reason === 'tool_calls') {
        conversationMessages.push({
          role: 'assistant',
          content: choice.message.content,
          tool_calls: choice.message.tool_calls
        });

        for (const toolCall of choice.message.tool_calls || []) {
          if (toolCall.type === 'function' && toolCall.function?.name === 'addMeal') {
            const args = JSON.parse(toolCall.function.arguments);
            await addMeal(args, userId);

            executedActions.push({ function: 'addMeal', arguments: args, result: { success: true } });

            conversationMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({ status: 'success' })
            });
          }
        }

        iterations++;
        continue;
      }

      const response = {
        message: choice.message.content || "I'm here to help you plan your life better!",
        actions: executedActions,
        actionResults: executedActions.map(action => action.result),
        activeModule: null
      };

      res.json(response);
      return;
    }

    console.log('[GPT MAX ITERATIONS REACHED]', { iterations });
    res.json({
      message: "I've completed the requested actions, though the conversation may have been truncated due to complexity.",
      actions: executedActions,
      actionResults: executedActions.map(action => action.result),
      activeModule: null
    });
  } catch (error) {
    console.error('[GPT ERROR]', error);
    const err = error as any;
    let errorMessage = 'I encountered an error while processing your request.';
    if (err.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing.';
    } else if (err.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check configuration.';
    }
    res.status(500).json({
      message: errorMessage,
      actions: [],
      actionResults: [],
      activeModule: null
    });
  }
});

// /api/ical/:userId route
app.get('/api/ical/:userId', async (req: Request, res: Response): Promise<void> => {
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
    const userTimeBlocks = timeBlocks.filter(block => block.user_id === userId);
    const { CalendarGenerator } = await import('./src/lib/calendar.js');
    const icsContent = CalendarGenerator.timeBlocksToICS(userTimeBlocks);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="life-flow.ics"');
    res.send(icsContent);
  } catch (error) {
    console.error('[ICAL ERROR]', error);
    res.status(500).json({
      message: 'Failed to generate calendar export',
      error: (error as Error).message
    });
  }
});

// /health route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📡 OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
  });
}

export default app;
