
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ActionExecutor } from '@/utils/actionExecutor';
import { useMeals } from '@/hooks/useMeals';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, GPTResponse } from '@/types/chat';
import { ChatApiService } from '@/services/chatService';
import { createUserMessage, createAssistantMessage, updateMessageContent, setMessageError } from '@/utils/messageHandler';
import { StreamHandler } from '@/utils/streamHandler';

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

  // Initialize chat API service
  const chatApiService = new ChatApiService();

  const executeActions = async (actions: any[], userId: string) => {
    if (!actions || actions.length === 0) return;

    try {
      const actionExecutor = new ActionExecutor({
        meals,
        tasks,
        workouts,
        reminders,
        timeBlocks
      });

      // Convert actions to the expected format
      const formattedActions = actions.map(action => ({
        type: action.function || action.type,
        payload: action.arguments || action.data || {}
      }));

      await actionExecutor.executeActions(formattedActions, userId);
      
      toast({
        title: "Actions Completed",
        description: `Successfully executed ${actions.length} action(s)`,
      });
    } catch (actionError) {
      console.error('Error executing actions:', actionError);
      // Don't show error to user for action execution failures
    }
  };

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
    const userMessage = createUserMessage(content);
    setMessages(prev => [...prev, userMessage]);

    // Add placeholder assistant message for streaming
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage = createAssistantMessage(assistantMessageId);
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare conversation history for the API - include the new user message
      const updatedMessages = [...messages, userMessage];
      
      const response = await chatApiService.sendMessage(content, updatedMessages, user.id);

      // Check if response supports streaming
      if (response.body && response.body.getReader) {
        const fullResponse = await StreamHandler.handleStreamResponse(
          response,
          assistantMessageId,
          setMessages
        );

        // If no streaming content was received, fall back to regular response
        if (!fullResponse) {
          const data: GPTResponse = await response.json();
          setMessages(prev => updateMessageContent(prev, assistantMessageId, data.message, 'done'));
          await executeActions(data.actions, user.id);
        } else {
          // Mark streaming as complete
          setMessages(prev => updateMessageContent(prev, assistantMessageId, fullResponse, 'done'));
          
          // Try to get actions from response
          try {
            const data: GPTResponse = await response.json();
            await executeActions(data.actions, user.id);
          } catch (actionError) {
            console.error('Error parsing actions:', actionError);
          }
        }
      } else {
        // Fallback for browsers that don't support streams
        const data: GPTResponse = await response.json();
        setMessages(prev => updateMessageContent(prev, assistantMessageId, data.message, 'done'));
        await executeActions(data.actions, user.id);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Update assistant message with error
      setMessages(prev => setMessageError(prev, assistantMessageId));

      toast({
        title: "Chat Error",
        description: "Failed to get response from assistant",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, messages, meals, tasks, workouts, reminders, timeBlocks, toast, chatApiService]);

  return {
    messages,
    isProcessing,
    sendMessage,
  };
};
