import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const openaiMock = vi.fn();
vi.mock('openai', () => {
  return {
    default: class {
      chat = { completions: { create: openaiMock } };
    }
  };
}, { virtual: true });

let app: any;
beforeEach(async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const mod = await import('../../server');
  app = mod.default;
  openaiMock.mockReset();
});

describe('POST /api/gpt', () => {
  it('returns assistant reply without tools', async () => {
    openaiMock.mockResolvedValueOnce({ choices: [{ finish_reason: 'stop', message: { content: 'Hello!' } }] });
    const res = await request(app).post('/api/gpt').send({ message: 'Hi', userId: 'u1' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Hello!');
    expect(openaiMock).toHaveBeenCalledTimes(1);
  });

  it('handles tool calls and loops', async () => {
    openaiMock
      .mockResolvedValueOnce({
        choices: [
          {
            finish_reason: 'tool_calls',
            message: {
              content: '',
              tool_calls: [
                {
                  type: 'function',
                  id: '1',
                  function: {
                    name: 'addMeal',
                    arguments: '{"name":"Tacos","meal_type":"dinner","planned_date":"2025-06-14"}'
                  }
                }
              ]
            }
          }
        ]
      })
      .mockResolvedValueOnce({ choices: [{ finish_reason: 'stop', message: { content: 'Done' } }] });

    const res = await request(app).post('/api/gpt').send({ message: 'Plan dinner', userId: 'u1' });

    expect(openaiMock).toHaveBeenCalledTimes(2);
    expect(res.body.actions[0].function).toBe('addMeal');
    expect(res.body.message).toBe('Done');
  });
});
