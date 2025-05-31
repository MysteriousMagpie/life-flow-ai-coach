
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const suggestions = [
  "Create a healthy breakfast for tomorrow",
  "Add a gym workout for this week", 
  "Remind me to call mom tomorrow",
  "Schedule time for creative work today",
  "Plan my meals for the week",
  "Show me my pending tasks"
];

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}

export const ChatInput = ({ onSubmit, isProcessing }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [autoSend, setAutoSend] = useState(false);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !user) return;
    
    const message = input.trim();
    console.log('[CHAT INPUT] Submitting message:', message);
    setInput('');
    onSubmit(message);
    
    // Re-focus input after send
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!user) return;
    
    if (autoSend) {
      // Auto-send: immediately submit the suggestion
      console.log('[CHAT INPUT] Auto-sending suggestion:', suggestion);
      onSubmit(suggestion);
    } else {
      // Manual mode: populate input field
      setInput(suggestion);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-focus input when processing stops
  useEffect(() => {
    if (!isProcessing) {
      inputRef.current?.focus();
    }
  }, [isProcessing]);

  return (
    <div className="border-t bg-gray-50/80">
      {/* Suggestions Section */}
      <div className="p-3 sm:p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Quick suggestions:</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Auto-send suggestions</span>
            <Switch
              checked={autoSend}
              onCheckedChange={setAutoSend}
              disabled={!user}
              aria-label="Auto-send suggestions toggle"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={`suggestion-${index}`}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isProcessing || !user}
              className="text-left justify-start h-auto py-2 px-3 text-xs bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-colors"
            >
              <span className="truncate">{suggestion}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 pt-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Tell me what you'd like to plan or improve..." : "Please log in to use the AI assistant"}
            className="w-full border-gray-200 focus:border-blue-500 transition-colors text-sm"
            disabled={isProcessing || !user}
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !input.trim() || !user}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all text-sm"
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
    </div>
  );
};
