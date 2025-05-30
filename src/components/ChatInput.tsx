
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isProcessing: boolean;
}

export const ChatInput = ({ onSubmit, isProcessing }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !user) return;
    
    onSubmit(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50/80">
      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={user ? "Tell me what you'd like to plan or improve..." : "Please log in to use the AI assistant"}
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
  );
};
