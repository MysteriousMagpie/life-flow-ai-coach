
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMeals } from '@/hooks/useMeals';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useTimeBlocks } from '@/hooks/useTimeBlocks';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';

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

  // Today's stats
  const todayStats = {
    meals: { planned: todaysMeals.length, completed: todaysMeals.filter(m => m.is_completed).length || 0 },
    workouts: { 
      planned: thisWeekWorkouts.filter(w => isToday(new Date(w.shceduled_date))).length,
      completed: thisWeekWorkouts.filter(w => isToday(new Date(w.shceduled_date)) && w.is_completed).length
    },
    tasks: { total: 8, completed: 3 }, // Keep existing mock data
    wellbeing: { mood: 7, journaled: false } // Keep existing mock data
  };

  const weeklyGoals = [
    { name: 'Healthy Meals', progress: Math.min(100, (todayStats.meals.completed / Math.max(1, todayStats.meals.planned)) * 100), color: 'bg-green-500' },
    { name: 'Exercise', progress: Math.min(100, (todayStats.workouts.completed / Math.max(1, todayStats.workouts.planned)) * 100), color: 'bg-blue-500' },
    { name: 'Creative Time', progress: 25, color: 'bg-purple-500' }, // Keep existing
    { name: 'Sleep Schedule', progress: 80, color: 'bg-indigo-500' } // Keep existing
  ];

  const formatMealType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Today's Overview */}
      <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Today's Progress</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Meals</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
              {todayStats.meals.completed}/{todayStats.meals.planned}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Workouts</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
              {todayStats.workouts.completed}/{todayStats.workouts.planned}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Tasks</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
              {todayStats.tasks.completed}/{todayStats.tasks.total}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Mood</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
              {todayStats.wellbeing.mood}/10
            </Badge>
          </div>
        </div>
      </Card>

      {/* This Week's Workouts */}
      <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
          📆 This Week's Workouts
        </h3>
        {thisWeekWorkouts.length > 0 ? (
          <div className="space-y-2">
            {thisWeekWorkouts.map((workout, index) => (
              <div key={workout.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{workout.name}</div>
                  <div className="text-xs text-gray-600">
                    {format(new Date(workout.shceduled_date), 'EEEE, MMM d')}
                    {workout.duration && ` • ${workout.duration} min`}
                    {workout.intensity && ` • ${workout.intensity}`}
                  </div>
                </div>
                <Badge variant={workout.is_completed ? "default" : "outline"} className="text-xs">
                  {workout.is_completed ? "Done" : "Planned"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No workouts planned for this week</p>
            <p className="text-xs text-gray-400 mt-1">Ask the AI to create your workout plan!</p>
          </div>
        )}
      </Card>

      {/* Today's Meals */}
      <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
          🍴 Today's Meals
        </h3>
        {todaysMeals.length > 0 || todayMealBlocks.length > 0 ? (
          <div className="space-y-2">
            {todayMealBlocks.length > 0 ? (
              // Show scheduled meals with times from time blocks
              todayMealBlocks.map((block, index) => {
                const meal = todaysMeals.find(m => block.title.toLowerCase().includes(m.name.toLowerCase()));
                return (
                  <div key={block.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{block.title}</div>
                      <div className="text-xs text-gray-600">
                        {formatTime(block.start_time)}
                        {meal?.calories && ` • ${meal.calories} cal`}
                      </div>
                    </div>
                    <Badge variant={meal?.is_completed ? "default" : "outline"} className="text-xs">
                      {meal?.is_completed ? "Done" : "Planned"}
                    </Badge>
                  </div>
                );
              })
            ) : (
              // Fallback to showing meals without specific times
              todaysMeals.map((meal, index) => (
                <div key={meal.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{meal.name}</div>
                    <div className="text-xs text-gray-600">
                      {formatMealType(meal.meal_type)}
                      {meal.calories && ` • ${meal.calories} cal`}
                    </div>
                  </div>
                  <Badge variant={meal.is_completed ? "default" : "outline"} className="text-xs">
                    {meal.is_completed ? "Done" : "Planned"}
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

      {/* Weekly Goals */}
      <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Weekly Goals</h3>
        <div className="space-y-2 sm:space-y-3">
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 truncate pr-2">{goal.name}</span>
                <span className="text-gray-800 font-medium flex-shrink-0">{Math.round(goal.progress)}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Active Module Indicator */}
      {activeModule && (
        <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg w-full">
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Active Module</h3>
          <p className="text-xs sm:text-sm text-blue-100 capitalize">
            {activeModule.replace('-', ' ')} module is processing...
          </p>
        </Card>
      )}
    </div>
  );
};
