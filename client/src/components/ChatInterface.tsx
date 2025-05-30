
import React from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';

export const ChatInterface = () => {
  const { messages, isProcessing, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg shadow-sm border">
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">AI Planning Assistant</h2>
        <p className="text-xs sm:text-sm text-gray-600">Ask me to help plan your meals, workouts, tasks, and schedule</p>
      </div>
      
      <MessageList messages={messages} isProcessing={isProcessing} />
      
      <ChatInput onSubmit={sendMessage} isProcessing={isProcessing} />
    </div>
  );
};
