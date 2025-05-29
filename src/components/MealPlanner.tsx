import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Meal {
  id: number;
  day: string;
  time: string;
  meal: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const times = ['Breakfast', 'Lunch', 'Dinner'];

export const MealPlanner = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('Breakfast');
  const [mealInput, setMealInput] = useState('');

  const addMeal = () => {
    if (!mealInput.trim()) return;
    const newMeal: Meal = {
      id: Date.now(),
      day: selectedDay,
      time: selectedTime,
      meal: mealInput.trim()
    };
    setMeals(prev => [...prev, newMeal]);
    setMealInput('');
  };

  const mealsByDay = days.map(day => ({
    day,
    meals: meals.filter(m => m.day === day)
  }));

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-4">Weekly Meal Planner</h3>
      <div className="mb-4 flex gap-2">
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="border rounded px-2">
          {days.map(day => <option key={day}>{day}</option>)}
        </select>
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="border rounded px-2">
          {times.map(time => <option key={time}>{time}</option>)}
        </select>
        <Input
          value={mealInput}
          onChange={(e) => setMealInput(e.target.value)}
          placeholder="Enter meal name"
        />
        <Button onClick={addMeal}>Add Meal</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mealsByDay.map(({ day, meals }) => (
          <Card key={day} className="p-3">
            <h4 className="font-semibold text-gray-700 mb-2">{day}</h4>
            {times.map(time => {
              const entry = meals.find(m => m.time === time);
              return (
                <div key={time} className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">{time}:</span> {entry ? entry.meal : '—'}
                </div>
              );
            })}
          </Card>
        ))}
      </div>
    </Card>
  );
};
