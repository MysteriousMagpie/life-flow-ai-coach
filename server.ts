
// server.ts
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

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful AI life planning assistant. You can help users manage their meals, tasks, workouts, reminders, and time blocks. When users ask you to create items, use the available functions to structure the data properly. Always provide helpful, actionable advice.`
        },
        { role: 'user', content: input }
      ],
      functions: functions,
      function_call: 'auto',
      temperature: 0.7
    });

    const message = completion.choices[0].message;
    const content = message.content || 'I can help you with planning your life!';
    const functionCalls = message.function_call ? [message.function_call] : [];

    res.json({ 
      message: content,
      function_calls: functionCalls
    });
  } catch (error) {
    console.error('[GPT ERROR]', error);
    res.status(500).json({ message: 'Error contacting OpenAI API.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
