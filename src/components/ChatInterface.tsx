
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { gptParser, GPTAction } from '@/utils/gptParser';
import { ActionExecutor } from '@/utils/actionExecutor';
import { useMeals } from '@/hooks/useMeals';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ChatInterfaceProps {
  conversations: any[];
  setConversations: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveModule: (module: string | null) => void;
}

export const ChatInterface = ({ conversations, setConversations, setActiveModule }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const mealsHook = useMeals();
  const tasksHook = useTasks();
  const workoutsHook = useWorkouts();
  const remindersHook = useReminders();
  const timeBlocksHook = useTimeBlocks();

  const actionExecutor = new ActionExecutor({
    meals: mealsHook,
    tasks: tasksHook,
    workouts: workoutsHook,
    reminders: remindersHook,
    timeBlocks: timeBlocksHook
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !user) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setConversations([...conversations, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      console.log('[CHAT] Processing input:', input);
      const response = await gptParser.processInput(input);
      console.log('[CHAT] GPT Response:', response);
      
      // Execute any actions suggested by GPT
      let actionResults = [];
      if (response.actions && response.actions.length > 0) {
        console.log('[CHAT] Executing actions:', response.actions);
        actionResults = await actionExecutor.executeActions(response.actions, user.id);
        console.log('[CHAT] Action results:', actionResults);
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.message,
        actions: response.actions,
        actionResults,
        timestamp: new Date()
      };

      setConversations(prevConversations => [...prevConversations, aiMessage]);
      
      if (response.activeModule) {
        setActiveModule(response.activeModule);
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
      setConversations(prevConversations => [...prevConversations, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionResults = (actionResults: any[]) => {
    if (!actionResults || actionResults.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {actionResults.map((result, index) => (
          <div key={index} className="text-xs flex items-center gap-1 bg-white/20 rounded px-2 py-1">
            {result.success ? (
              <CheckCircle className="w-3 h-3 text-green-300" />
            ) : (
              <XCircle className="w-3 h-3 text-red-300" />
            )}
            <span>{result.message}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <h2 className="text-xl font-semibold">AI Life Planning Assistant</h2>
        <p className="text-blue-100 text-sm">Tell me what you'd like to plan, create, or improve</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {conversations.length === 0 && (
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
          
          {conversations.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : message.error 
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Render action results */}
                {message.actionResults && renderActionResults(message.actionResults)}
                
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50/80">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you'd like to plan or improve..."
            className="flex-1 border-gray-200 focus:border-blue-500 transition-colors"
            disabled={isProcessing || !user}
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !input.trim() || !user}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </div>
        {!user && (
          <p className="text-xs text-gray-500 mt-1">Please log in to use the AI assistant</p>
        )}
      </form>
    </Card>
  );
};
