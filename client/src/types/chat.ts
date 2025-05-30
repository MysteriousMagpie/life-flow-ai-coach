
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'streaming' | 'done' | 'error';
}

export interface GPTResponse {
  message: string;
  actions: any[];
  actionResults: any[];
  activeModule: string | null;
}

export interface ChatService {
  sendMessage: (content: string, messages: ChatMessage[], userId: string) => Promise<Response>;
}
