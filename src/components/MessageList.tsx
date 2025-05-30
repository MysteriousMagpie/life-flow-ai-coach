
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { ActionResultsDisplay } from './ActionResultsDisplay';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'streaming' | 'done' | 'error';
  actionResults?: any[];
}

interface MessageListProps {
  messages: Message[];
  isProcessing: boolean;
}

export const MessageList = ({ messages, isProcessing }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Try saying:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>"Create a healthy breakfast for tomorrow"</p>
                <p>"Add a gym workout for this week"</p>
                <p>"Remind me to call mom tomorrow"</p>
                <p>"Schedule time for creative work today"</p>
                <p>"Plan my meals for the week"</p>
                <p>"Show me my pending tasks"</p>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">
                {message.content}
                {message.status === 'streaming' && (
                  <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse" />
                )}
              </p>
              
              {/* Render action results */}
              {message.actionResults && message.actionResults.length > 0 && (
                <ActionResultsDisplay actionResults={message.actionResults} />
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isProcessing && messages.length > 0 && !messages[messages.length - 1]?.content && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
