
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useReminders } from '@/hooks/useReminders';
import { useMeals } from '@/hooks/useMeals';
import { Lightbulb, TrendingUp, Clock, Target } from 'lucide-react';
import { format, isToday, addDays } from 'date-fns';

interface SmartSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const SmartSuggestions = ({ onSuggestionClick }: SmartSuggestionsProps) => {
  const { pendingTasks, overdueTasks } = useTasks();
  const { workouts } = useWorkouts();
  const { reminders } = useReminders();
  const { meals } = useMeals();

  const generateSuggestions = () => {
    const suggestions = [];

    // Task-based suggestions
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'urgent',
        icon: Clock,
        title: 'Address Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue tasks`,
        action: 'Show me my overdue tasks and help me prioritize them',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-700'
      });
    }

    if (pendingTasks.length > 5) {
      suggestions.push({
        type: 'productivity',
        icon: Target,
        title: 'Break Down Large Tasks',
        description: 'Consider breaking complex tasks into smaller steps',
        action: 'Help me break down my largest tasks into smaller manageable steps',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700'
      });
    }

    // Workout suggestions
    const todayWorkouts = workouts.filter(w => 
      w.shceduled_date && isToday(new Date(w.shceduled_date))
    );
    
    if (todayWorkouts.length === 0) {
      suggestions.push({
        type: 'health',
        icon: TrendingUp,
        title: 'Schedule Today\'s Workout',
        description: 'No workouts planned for today',
        action: 'Create a 30-minute workout for today based on my fitness level',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-700'
      });
    }

    // Meal planning suggestions
    const tomorrowMeals = meals.filter(m => 
      m.planned_date && format(new Date(m.planned_date), 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd')
    );

    if (tomorrowMeals.length < 3) {
      suggestions.push({
        type: 'nutrition',
        icon: Lightbulb,
        title: 'Plan Tomorrow\'s Meals',
        description: 'Incomplete meal plan for tomorrow',
        action: 'Help me plan nutritious meals for tomorrow',
        color: 'bg-purple-50 border-purple-200',
        textColor: 'text-purple-700'
      });
    }

    // Time management suggestions
    if (pendingTasks.length > 0 && workouts.length > 0) {
      suggestions.push({
        type: 'planning',
        icon: Clock,
        title: 'Optimize Your Schedule',
        description: 'Balance work and fitness effectively',
        action: 'Create a time-blocked schedule that balances my tasks and workouts',
        color: 'bg-orange-50 border-orange-200',
        textColor: 'text-orange-700'
      });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const suggestions = generateSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-gray-800">Smart Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className={`p-3 ${suggestion.color} border cursor-pointer hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-3">
              <suggestion.icon className={`h-5 w-5 ${suggestion.textColor} mt-0.5`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${suggestion.textColor}`}>{suggestion.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                </div>
                <p className={`text-sm ${suggestion.textColor} opacity-80 mb-2`}>
                  {suggestion.description}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSuggestionClick(suggestion.action)}
                  className="text-xs"
                >
                  Try This
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
