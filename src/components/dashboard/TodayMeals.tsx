
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

  // Combine meals with their corresponding time blocks
  const getMealsWithTimes = () => {
    if (mealBlocks.length > 0) {
      return mealBlocks.map((block) => {
        const relatedMeal = meals.find(meal => 
          block.title.toLowerCase().includes(meal.name.toLowerCase()) ||
          block.category === 'meal'
        );
        
        return {
          id: block.id,
          title: block.title,
          time: formatTime(block.start_time),
          calories: relatedMeal?.calories,
          isFromTimeBlock: true
        };
      });
    }
    
    // Fallback to meals without specific times
    return meals.map((meal) => ({
      id: meal.id,
      title: meal.name,
      time: formatMealType(meal.meal_type || ''),
      calories: meal.calories,
      isFromTimeBlock: false
    }));
  };

  const displayMeals = getMealsWithTimes();

  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
        🍴 Today's Meals
      </h3>
      {displayMeals.length > 0 ? (
        <div className="space-y-2">
          {displayMeals.map((item, index) => (
            <div key={item.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{item.title}</div>
                <div className="text-xs text-gray-600">
                  {item.time}
                  {item.calories && ` • ${item.calories} cal`}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.isFromTimeBlock ? "Scheduled" : "Planned"}
              </Badge>
            </div>
          ))}
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
