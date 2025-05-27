import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { gptParser } from '@/utils/gptParser';

interface ChatInterfaceProps {
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveModule: (module: string | null) => void;
}

export const ChatInterface = ({ conversations, setConversations, setActiveModule }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setConversations([...conversations, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(async () => {
      const response = await gptParser.processInput(input);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.message,
        actions: response.actions,
        timestamp: new Date()
      };

      setConversations(prevConversations => [...prevConversations, aiMessage]);
      
      if (response.activeModule) {
        setActiveModule(response.activeModule);
      }
      
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <Card className="h-[600px] flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <p className="text-blue-100 text-sm">Tell me what you'd like to plan or improve</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Try saying:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>"Help me eat better and get back to the gym"</p>
                  <p>"Plan my meals for this week"</p>
                  <p>"Create a realistic weekly schedule"</p>
                  <p>"I need to find time for creative work"</p>
                </div>
              </div>
            </div>
          )}
          
          {conversations.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.actions && (
                  <div className="mt-2 space-y-1">
                    {message.actions.map((action: any, index: number) => (
                      <div key={index} className="text-xs bg-white/20 rounded px-2 py-1">
                        ✓ {action}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50/80">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you'd like to plan or improve..."
            className="flex-1 border-gray-200 focus:border-blue-500 transition-colors"
            disabled={isProcessing}
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
};
