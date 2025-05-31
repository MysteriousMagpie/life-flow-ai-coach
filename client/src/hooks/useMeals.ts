
import { useState, useEffect } from 'react';

interface Meal {
  id: string;
  name: string;
  meal_type?: string;
  planned_date?: string;
  calories?: number;
  ingredients?: any;
  instructions?: string;
  created_at?: string;
  user_id: string;
}

export const useMeals = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setMeals([
      {
        id: '1',
        name: 'Healthy Breakfast',
        meal_type: 'breakfast',
        planned_date: new Date().toISOString().split('T')[0],
        calories: 300,
        user_id: '1'
      }
    ]);
    setLoading(false);
  }, []);

  return {
    meals,
    loading
  };
};
