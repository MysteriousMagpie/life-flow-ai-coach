
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface ChatInterfaceProps {
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveModule: (module: string | null) => void;
}

export const ChatInterface = ({ conversations, setConversations, setActiveModule }: ChatInterfaceProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (input: string) => {
    if (!user) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    // Add user message to conversations
    setConversations((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      console.log('[CHAT] Processing input:', input);
      
      // Call the centralized backend endpoint
      const response = await fetch("http://localhost:5000/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[CHAT] Backend response:', data);

      // Create assistant message with all the data from backend
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.message,
        actions: data.actions || [],
        actionResults: data.actionResults || [],
        timestamp: new Date()
      };

      // Add assistant message to conversations
      setConversations((prev) => [...prev, assistantMessage]);
      
      // Set active module if specified
      if (data.activeModule) {
        setActiveModule(data.activeModule);
      }
      
    } catch (error) {
      console.error('[CHAT] Error processing input:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I encountered an error processing your request. Please make sure the server is running and try again.',
        error: true,
        timestamp: new Date()
      };
      setConversations((prev) => [...prev, errorMessage]);
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
