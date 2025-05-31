
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Meal } from '@/types/database';
import { TimeBlock } from '@/types/database';

interface TodayMealsProps {
  meals: Meal[];
  mealBlocks: TimeBlock[];
}

export const TodayMeals = ({ meals, mealBlocks }: TodayMealsProps) => {
  const formatMealType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
        🍴 Today's Meals
      </h3>
      {meals.length > 0 || mealBlocks.length > 0 ? (
        <div className="space-y-2">
          {mealBlocks.length > 0 ? (
            // Show scheduled meals with times from time blocks
            mealBlocks.map((block, index) => {
              const meal = meals.find(m => block.title.toLowerCase().includes(m.name.toLowerCase()));
              return (
                <div key={block.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{block.title}</div>
                    <div className="text-xs text-gray-600">
                      {formatTime(block.start_time)}
                      {meal?.calories && ` • ${meal.calories} cal`}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Planned
                  </Badge>
                </div>
              );
            })
          ) : (
            // Fallback to showing meals without specific times
            meals.map((meal, index) => (
              <div key={meal.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{meal.name}</div>
                  <div className="text-xs text-gray-600">
                    {formatMealType(meal.meal_type)}
                    {meal.calories && ` • ${meal.calories} cal`}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Planned
                </Badge>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No meals planned for today</p>
          <p className="text-xs text-gray-400 mt-1">Ask the AI to plan your meals!</p>
        </div>
      )}
    </Card>
  );
};
