
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ActionExecutor } from '@/utils/actionExecutor';
import { actionParser } from '@/utils/parsing/actionParser';
import { useMeals } from './useMeals';
import { useTasks } from './useTasks';
import { useWorkouts } from './useWorkouts';
import { useReminders } from './useReminders';
import { useTimeBlocks } from './useTimeBlocks';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'streaming' | 'done';
  actionResults?: any[];
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Initialize hooks for action execution
  const meals = useMeals();
  const tasks = useTasks();
  const workouts = useWorkouts();
  const reminders = useReminders();
  const timeBlocks = useTimeBlocks();

  const actionExecutor = new ActionExecutor({
    meals,
    tasks,
    workouts,
    reminders,
    timeBlocks,
  });

  const sendMessage = useCallback(async (userInput: string) => {
    if (!user || !userInput.trim()) return;

    setIsProcessing(true);

    // 1. Optimistically add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date(),
      status: 'done',
    };

    setMessages(prev => [...prev, userMessage]);

    // 2. Create assistant message placeholder for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming',
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // 3. Fire streaming request to /api/gpt
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput }),
      });

      if (!response.body) {
        throw new Error('No response body received');
      }

      // TODO: Add fallback for browsers without ReadableStream support
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullContent = '';
      let functionCalls: any[] = [];

      // 4. Stream response tokens
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.message) {
                fullContent += data.message;
                // Update streaming message content
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              }

              if (data.function_calls) {
                functionCalls = data.function_calls;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', line);
            }
          }
        }
      }

      // 5. Mark assistant message as done
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, status: 'done' }
          : msg
      ));

      // 6. Execute actions if any were detected
      if (functionCalls.length > 0 && user) {
        const actions = actionParser.parseFunctionCalls(functionCalls);
        const actionResults = await actionExecutor.executeActions(actions, user.id);
        
        // Update assistant message with action results
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, actionResults }
            : msg
        ));
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Update assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error processing your request. Please try again.',
              status: 'done'
            }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [user, actionExecutor]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
  };
};
