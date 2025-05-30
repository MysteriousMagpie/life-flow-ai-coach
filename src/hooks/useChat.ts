import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  actions?: any[];
  actionResults?: any[];
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const { user } = useAuth();

  const sendMessage = async (content: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Use the new API endpoint
      const response = await fetch('https://ceeobnncvfsqqliojsxn.supabase.co/functions/v1/gpt-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZW9ibm5jdmZzcXFsaW9qc3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTkwODksImV4cCI6MjA2Mzc3NTA4OX0.UJShCgS3BdR0KUKN5OPS_WJbjJgUKJhIMm1pbmXv9Bw`
        },
        body: JSON.stringify({ 
          message: content, 
          userId: user.id,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        actions: data.actions || [],
        actionResults: data.actionResults || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
      setActiveModule(data.activeModule);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setActiveModule(null);
  };

  return {
    messages,
    isLoading,
    activeModule,
    sendMessage,
    clearMessages,
  };
};
