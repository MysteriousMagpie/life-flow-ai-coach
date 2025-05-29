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
  const { input } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful planning assistant.' },
        { role: 'user', content: input }
      ],
      temperature: 0.7
    });

    const content = completion.choices[0].message?.content || 'No response.';
    res.json({ message: content });
  } catch (error) {
    console.error('[GPT ERROR]', error);
    res.status(500).json({ message: 'Error contacting OpenAI API.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
