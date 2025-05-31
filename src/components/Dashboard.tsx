
import React from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/hooks/useMeals';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { TodayOverview } from './dashboard/TodayOverview';
import { WeeklyWorkouts } from './dashboard/WeeklyWorkouts';
import { TodayMeals } from './dashboard/TodayMeals';
import { WeeklyGoals } from './dashboard/WeeklyGoals';
import { ActiveModule } from './dashboard/ActiveModule';

interface DashboardProps {
  activeModule?: string | null;
}

export const Dashboard = ({ activeModule }: DashboardProps) => {
  const { user, loading } = useAuth();
  const { meals } = useMeals();
  const { workouts } = useWorkouts();
  const { timeBlocks } = useTimeBlocks();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show unauthenticated message
  if (!user) {
    return (
      <Card className="p-4 sm:p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
        <p className="text-gray-600 text-sm sm:text-base">You need to be logged in to view your dashboard.</p>
      </Card>
    );
  }

  // Get current week's workouts
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const thisWeekWorkouts = workouts.filter(workout => {
    if (!workout.shceduled_date) return false;
    const workoutDate = new Date(workout.shceduled_date);
    return workoutDate >= weekStart && workoutDate <= weekEnd;
  }).sort((a, b) => new Date(a.shceduled_date).getTime() - new Date(b.shceduled_date).getTime());

  // Get today's meals
  const today = format(now, 'yyyy-MM-dd');
  const todaysMeals = meals.filter(meal => meal.planned_date === today)
    .sort((a, b) => {
      const order = { breakfast: 1, morning_snack: 2, lunch: 3, afternoon_snack: 4, dinner: 5, evening_snack: 6 };
      return (order[a.meal_type] || 999) - (order[b.meal_type] || 999);
    });

  // Get today's meal time blocks
  const todayMealBlocks = timeBlocks.filter(block => {
    if (!block.start_time || block.category !== 'meal') return false;
    return isToday(new Date(block.start_time));
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Today's stats - Note: meals don't have is_completed field, so we'll show planned vs total
  const todayStats = {
    meals: { planned: todaysMeals.length, completed: 0 }, // Remove completed count since field doesn't exist
    workouts: { 
      planned: thisWeekWorkouts.filter(w => isToday(new Date(w.shceduled_date))).length,
      completed: thisWeekWorkouts.filter(w => isToday(new Date(w.shceduled_date)) && w.is_completed).length
    },
    tasks: { total: 8, completed: 3 }, // Keep existing mock data
    wellbeing: { mood: 7, journaled: false } // Keep existing mock data
  };

  const weeklyGoals = [
    { name: 'Healthy Meals', progress: todayStats.meals.planned > 0 ? 75 : 0, color: 'bg-green-500' }, // Use fixed progress since we can't track completion
    { name: 'Exercise', progress: Math.min(100, (todayStats.workouts.completed / Math.max(1, todayStats.workouts.planned)) * 100), color: 'bg-blue-500' },
    { name: 'Creative Time', progress: 25, color: 'bg-purple-500' }, // Keep existing
    { name: 'Sleep Schedule', progress: 80, color: 'bg-indigo-500' } // Keep existing
  ];

  return (
    <div className="space-y-4 w-full">
      <TodayOverview stats={todayStats} />
      <WeeklyWorkouts workouts={thisWeekWorkouts} />
      <TodayMeals meals={todaysMeals} mealBlocks={todayMealBlocks} />
      <WeeklyGoals goals={weeklyGoals} />
      <ActiveModule activeModule={activeModule} />
    </div>
  );
};
