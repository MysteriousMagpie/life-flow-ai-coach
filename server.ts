
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getGptResponseWithFunctions } from './src/server/gptRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/gpt', async (req, res) => {
  const { input } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      message: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.',
      function_calls: [],
      function_results: []
    });
  }

  try {
    console.log('[GPT REQUEST]', { input });

    const result = await getGptResponseWithFunctions(input);

    console.log('[GPT RESPONSE]', { 
      content: result.message.substring(0, 100) + '...', 
      functionCalls: result.function_calls.length,
      functionResults: result.function_results.length
    });

    res.json(result);
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
      function_calls: [],
      function_results: []
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
