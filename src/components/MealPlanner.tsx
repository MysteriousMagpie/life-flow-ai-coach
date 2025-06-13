
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMeals } from '@/hooks/useMeals';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MealPlanner = () => {
  const { user } = useAuth();
  const { meals, isLoading, createMeal, deleteMeal, isCreating, isDeleting } = useMeals();
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('breakfast');
  const [mealInput, setMealInput] = useState('');

  const addMeal = () => {
    if (!mealInput.trim() || !user) return;
    
    const today = new Date();
    const dayIndex = days.indexOf(selectedDay);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
    
    createMeal({
      user_id: user.id,
      name: mealInput.trim(),
      meal_type: selectedTime,
      planned_date: targetDate.toISOString().split('T')[0]
    });
    
    setMealInput('');
  };

  const getMealsForDayAndTime = (day: string, time: string) => {
    const dayIndex = days.indexOf(day);
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    return meals.filter(meal => 
      meal.planned_date === dateStr && 
      meal.meal_type === time
    );
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Weekly Meal Planner</h3>
      
      {/* Mobile-optimized form */}
      <div className="mb-4 space-y-2 sm:space-y-0 sm:flex sm:gap-2 sm:flex-wrap">
        <select 
          value={selectedDay} 
          onChange={(e) => setSelectedDay(e.target.value)} 
          className="w-full sm:w-auto border rounded px-3 py-2 text-sm"
        >
          {days.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
        
        <select 
          value={selectedTime} 
          onChange={(e) => setSelectedTime(e.target.value)} 
          className="w-full sm:w-auto border rounded px-3 py-2 text-sm"
        >
          {times.map(time => (
            <option key={time} value={time}>
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </option>
          ))}
        </select>
        
        <Input
          value={mealInput}
          onChange={(e) => setMealInput(e.target.value)}
          placeholder="Enter meal name"
          className="w-full sm:flex-1 sm:min-w-48 text-sm"
        />
        
        <Button 
          onClick={addMeal} 
          disabled={isCreating || !mealInput.trim()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm"
        >
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Meal
        </Button>
      </div>

      {/* Mobile-optimized grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {days.map((day) => (
          <Card key={day} className="p-2 sm:p-3">
            <h4 className="font-semibold text-gray-700 mb-2 text-xs sm:text-sm">{day}</h4>
            {times.map(time => {
              const dayMeals = getMealsForDayAndTime(day, time);
              return (
                <div key={time} className="mb-2 sm:mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-gray-600 capitalize">
                      {time}:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {dayMeals.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {dayMeals.length > 0 ? (
                      dayMeals.map(meal => (
                        <div key={meal.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                          <span className="text-xs text-gray-700 truncate pr-1">{meal.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMeal(meal.id)}
                            disabled={isDeleting}
                            className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No meals planned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        ))}
      </div>
    </Card>
  );
};
