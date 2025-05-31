
import { useState, useEffect } from 'react';

interface Workout {
  id: string;
  name?: string;
  duration?: number;
  intensity?: string;
  shceduled_date?: string;
  is_completed?: boolean;
  created_at?: string;
  user_id: string;
}

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setWorkouts([
      {
        id: '1',
        name: 'Morning Run',
        duration: 30,
        intensity: 'medium',
        shceduled_date: new Date().toISOString().split('T')[0],
        is_completed: false,
        user_id: '1'
      }
    ]);
    setLoading(false);
  }, []);

  return {
    workouts,
    loading
  };
};
