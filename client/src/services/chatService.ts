
import { ChatMessage, GPTResponse } from '@/types/chat';

export class ChatApiService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  async sendMessage(content: string, messages: ChatMessage[], userId: string): Promise<Response> {
    const updatedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Ensure latest user message is included before GPT call
    const response = await fetch(`${this.apiBaseUrl}/api/gpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: content,
        messages: updatedMessages,
        userId: userId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
}
