
import { ChatMessage } from '@/types/chat';

export const createUserMessage = (content: string): ChatMessage => ({
  id: `user-${Date.now()}`,
  role: 'user',
  content: content.trim(),
  timestamp: new Date(),
  status: 'done'
});

export const createAssistantMessage = (id?: string): ChatMessage => ({
  id: id || `assistant-${Date.now()}`,
  role: 'assistant',
  content: '',
  timestamp: new Date(),
  status: 'streaming'
});

export const updateMessageContent = (
  messages: ChatMessage[], 
  messageId: string, 
  content: string, 
  status: ChatMessage['status'] = 'streaming'
): ChatMessage[] => {
  return messages.map(msg => 
    msg.id === messageId 
      ? { ...msg, content, status }
      : msg
  );
};

export const setMessageError = (
  messages: ChatMessage[], 
  messageId: string, 
  errorContent: string = 'Sorry, I encountered an error while processing your request. Please try again.'
): ChatMessage[] => {
  return messages.map(msg => 
    msg.id === messageId 
      ? { ...msg, content: errorContent, status: 'error' }
      : msg
  );
};
