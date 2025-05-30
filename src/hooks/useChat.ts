
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ActionExecutor } from '@/utils/actionExecutor';
import { useMeals } from '@/hooks/useMeals';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { supabase } from '@/integrations/supabase/client';

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

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Initialize hooks for all modules
  const meals = useMeals();
  const tasks = useTasks();
  const workouts = useWorkouts();
  const reminders = useReminders();
  const timeBlocks = useTimeBlocks();

  const sendMessage = useCallback(async (content: string) => {
    if (isProcessing || !content.trim()) return;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to use the chat feature",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Add user message immediately (optimistic UI)
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'done'
    };

    setMessages(prev => [...prev, userMessage]);

    // Add placeholder assistant message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming'
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare conversation history for the API
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          messages: conversationMessages,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response supports streaming
      if (response.body && response.body.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Look for complete JSON objects in the buffer
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
              const line = buffer.slice(0, newlineIndex).trim();
              buffer = buffer.slice(newlineIndex + 1);
              
              if (line) {
                try {
                  const chunk = JSON.parse(line);
                  if (chunk.token) {
                    fullResponse += chunk.token;
                    // Update the assistant message with streaming content
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: fullResponse, status: 'streaming' }
                        : msg
                    ));
                  }
                } catch (parseError) {
                  // If not JSON, might be final response
                  console.log('Non-JSON chunk:', line);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        // If no streaming content was received, fall back to regular response
        if (!fullResponse) {
          const data: GPTResponse = await response.json();
          fullResponse = data.message;
        }

        // Mark streaming as complete
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullResponse, status: 'done' }
            : msg
        ));

        // Execute any actions from the response
        try {
          const data: GPTResponse = await response.json();
          if (data.actions && data.actions.length > 0) {
            const actionExecutor = new ActionExecutor({
              meals,
              tasks,
              workouts,
              reminders,
              timeBlocks
            });

            // Convert actions to the expected format
            const formattedActions = data.actions.map(action => ({
              type: action.function || action.type,
              payload: action.arguments || action.data || {}
            }));

            await actionExecutor.executeActions(formattedActions, user.id);
            
            toast({
              title: "Actions Completed",
              description: `Successfully executed ${data.actions.length} action(s)`,
            });
          }
        } catch (actionError) {
          console.error('Error executing actions:', actionError);
          // Don't show error to user for action execution failures
        }

      } else {
        // Fallback for browsers that don't support streams
        const data: GPTResponse = await response.json();
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: data.message, status: 'done' }
            : msg
        ));

        // Execute actions if present
        if (data.actions && data.actions.length > 0) {
          const actionExecutor = new ActionExecutor({
            meals,
            tasks,
            workouts,
            reminders,
            timeBlocks
          });

          // Convert actions to the expected format
          const formattedActions = data.actions.map(action => ({
            type: action.function || action.type,
            payload: action.arguments || action.data || {}
          }));

          await actionExecutor.executeActions(formattedActions, user.id);
          
          toast({
            title: "Actions Completed",
            description: `Successfully executed ${data.actions.length} action(s)`,
          });
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Update assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error while processing your request. Please try again.',
              status: 'error'
            }
          : msg
      ));

      toast({
        title: "Chat Error",
        description: "Failed to get response from assistant",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, messages, meals, tasks, workouts, reminders, timeBlocks, toast]);

  return {
    messages,
    isProcessing,
    sendMessage,
  };
};
