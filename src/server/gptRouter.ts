// src/server/gptRouter.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY // not exposed to browser
});

export async function getGptResponse(input: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: input }],
    temperature: 0.7
  });

  return completion.choices[0].message?.content ?? "No response.";
}
