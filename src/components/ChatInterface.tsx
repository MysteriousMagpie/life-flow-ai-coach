
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useToast } from '@/hooks/use-toast';
import { useMeals } from '@/hooks/useMeals';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: any[];
  actionResults?: any[];
  error?: boolean;
}

interface ChatInterfaceProps {
  conversations: Message[];
  setConversations: React.Dispatch<React.SetStateAction<Message[]>>;
  setActiveModule: (module: string | null) => void;
}

export const ChatInterface = ({ conversations, setConversations, setActiveModule }: ChatInterfaceProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert conversations to OpenAI message format
  const buildMessageHistory = (conversations: Message[]) => {
    const messages: any[] = [
      {
        role: "system",
        content: "You are a helpful life planning assistant. Use the provided functions to help users organize their meals, workouts, tasks, reminders, and schedule. Be conversational and helpful."
      }
    ];

    conversations.forEach(conv => {
      if (conv.role === 'user' || conv.role === 'assistant') {
        messages.push({
          role: conv.role,
          content: conv.content
        });
      }
    });

    return messages;
  };

  const handleActionsReceived = (actions: any[]) => {
    if (!actions || actions.length === 0) return;

    // Invalidate relevant queries based on actions performed
    const modules = new Set();
    
    actions.forEach(action => {
      if (action.function?.includes('meal') || action.function?.includes('Meal')) {
        modules.add('meals');
      }
      if (action.function?.includes('task') || action.function?.includes('Task')) {
        modules.add('tasks');
      }
      if (action.function?.includes('workout') || action.function?.includes('Workout')) {
        modules.add('workouts');
      }
      if (action.function?.includes('reminder') || action.function?.includes('Reminder')) {
        modules.add('reminders');
      }
      if (action.function?.includes('timeBlock') || action.function?.includes('TimeBlock')) {
        modules.add('timeBlocks');
      }
    });

    // Invalidate queries for updated modules
    modules.forEach(module => {
      queryClient.invalidateQueries({ queryKey: [module] });
    });

    // Show success toasts for completed actions
    actions.forEach(action => {
      if (action.result?.success) {
        toast({
          title: "Action Completed",
          description: action.result.message || `${action.function} executed successfully`,
        });
      } else if (action.result?.success === false) {
        toast({
          title: "Action Failed",
          description: action.result.error || `Failed to execute ${action.function}`,
          variant: "destructive",
        });
      }
    });
  };

  const handleSubmit = async (input: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Add user message to conversations
    setConversations((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      console.log('[CHAT] Processing input:', input);
      
      // Build conversation history
      const messages = buildMessageHistory([...conversations, userMessage]);
      
      // Get session for auth header
      const { data: { session } } = await user.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call the enhanced backend endpoint
      const response = await fetch("http://localhost:5000/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[CHAT] Backend response:', data);

      // Create assistant message with all the data from backend
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message || "I'm here to help you plan your life better!",
        actions: data.actions || [],
        actionResults: data.actionResults || [],
        timestamp: new Date()
      };

      // Add assistant message to conversations
      setConversations((prev) => [...prev, assistantMessage]);
      
      // Handle any actions that were performed
      if (data.actions && data.actions.length > 0) {
        handleActionsReceived(data.actions);
      }
      
      // Set active module if specified
      if (data.activeModule) {
        setActiveModule(data.activeModule);
      }
      
    } catch (error) {
      console.error('[CHAT] Error processing input:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error instanceof Error 
          ? `I encountered an error: ${error.message}. Please make sure you're logged in and the server is running.`
          : 'I encountered an unexpected error processing your request. Please try again.',
        error: true,
        timestamp: new Date()
      };
      setConversations((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <h2 className="text-xl font-semibold">AI Life Planning Assistant</h2>
        <p className="text-blue-100 text-sm">Tell me what you'd like to plan, create, or improve</p>
      </div>

      {/* Messages */}
      <MessageList conversations={conversations} isProcessing={isProcessing} />

      {/* Input */}
      <ChatInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </Card>
  );
};
