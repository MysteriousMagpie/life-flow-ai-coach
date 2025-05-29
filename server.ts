
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/gpt', async (req, res) => {
  const { input, functions } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
      function_calls: []
    });
  }

  try {
    console.log('[GPT REQUEST]', { input, functionsCount: functions?.length });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful AI life planning assistant specialized in helping users manage their daily life through meals, tasks, workouts, reminders, and time blocking.

Your role is to:
1. Understand user requests for creating, managing, or querying their life planning data
2. Use the available functions to perform actions when appropriate
3. Provide helpful, actionable advice and confirmations
4. Be proactive in suggesting improvements to their planning

When users ask you to create items, always use the appropriate functions. When they ask about existing items, use list functions if available.

Be conversational, encouraging, and focus on helping them build better habits and organization.`
        },
        { role: 'user', content: input }
      ],
      functions: functions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000
    });

    const message = completion.choices[0].message;
    const content = message.content || 'I\'m here to help you plan your life better!';
    
    // Handle function calls
    const functionCalls = [];
    if (message.function_call) {
      try {
        const parsedArgs = JSON.parse(message.function_call.arguments || '{}');
        functionCalls.push({
          name: message.function_call.name,
          arguments: parsedArgs
        });
      } catch (parseError) {
        console.error('[FUNCTION PARSE ERROR]', parseError);
      }
    }

    console.log('[GPT RESPONSE]', { 
      content: content.substring(0, 100) + '...', 
      functionCalls: functionCalls.length 
    });

    res.json({ 
      message: content,
      function_calls: functionCalls
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
      function_calls: []
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
