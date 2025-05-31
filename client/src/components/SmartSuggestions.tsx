
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Calendar, Utensils, Dumbbell } from 'lucide-react';

interface SmartSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const SmartSuggestions = ({ onSuggestionClick }: SmartSuggestionsProps) => {
  const suggestions = [
    {
      icon: Calendar,
      text: "Plan your week's schedule",
      action: "Help me plan my schedule for this week"
    },
    {
      icon: Utensils,
      text: "Plan healthy meals",
      action: "Help me plan healthy meals for today"
    },
    {
      icon: Dumbbell,
      text: "Schedule workouts",
      action: "Help me schedule my workouts for this week"
    }
  ];

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        Smart Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-left h-auto p-3"
            onClick={() => onSuggestionClick(suggestion.action)}
          >
            <suggestion.icon className="h-4 w-4 mr-3 text-blue-600" />
            <span className="text-sm">{suggestion.text}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
