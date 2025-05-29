
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useMeals } from '@/hooks/useMeals';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export const ProgressAnalytics = () => {
  const { tasks, completedTasks } = useTasks();
  const { workouts } = useWorkouts();
  const { meals } = useMeals();

  const thisWeek = {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  };

  // Calculate weekly progress
  const weeklyTasksCompleted = completedTasks.filter(task => 
    task.created_at && isWithinInterval(new Date(task.created_at), thisWeek)
  ).length;

  const weeklyWorkoutsCompleted = workouts.filter(workout => 
    workout.is_completed && workout.created_at && 
    isWithinInterval(new Date(workout.created_at), thisWeek)
  ).length;

  const weeklyMealsPlanned = meals.filter(meal => 
    meal.planned_date && isWithinInterval(new Date(meal.planned_date), thisWeek)
  ).length;

  // Calculate completion rates
  const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  const workoutCompletionRate = workouts.length > 0 ? 
    (workouts.filter(w => w.is_completed).length / workouts.length) * 100 : 0;

  // Achievements
  const achievements = [];
  
  if (weeklyTasksCompleted >= 5) {
    achievements.push({ label: 'Productive Week', icon: '🎯', description: '5+ tasks completed' });
  }
  
  if (weeklyWorkoutsCompleted >= 3) {
    achievements.push({ label: 'Fitness Streak', icon: '💪', description: '3+ workouts completed' });
  }
  
  if (weeklyMealsPlanned >= 10) {
    achievements.push({ label: 'Meal Planner', icon: '🍽️', description: '10+ meals planned' });
  }

  if (taskCompletionRate >= 80) {
    achievements.push({ label: 'Task Master', icon: '✅', description: '80%+ completion rate' });
  }

  const metrics = [
    {
      label: 'Task Completion Rate',
      value: taskCompletionRate,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Workout Completion Rate', 
      value: workoutCompletionRate,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Weekly Tasks Completed',
      value: weeklyTasksCompleted,
      maxValue: 10,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      isCount: true
    }
  ];

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Progress Analytics</h3>
      </div>

      {/* Weekly Summary */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-2">This Week</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{weeklyTasksCompleted}</p>
            <p className="text-xs text-gray-600">Tasks Done</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{weeklyWorkoutsCompleted}</p>
            <p className="text-xs text-gray-600">Workouts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{weeklyMealsPlanned}</p>
            <p className="text-xs text-gray-600">Meals Planned</p>
          </div>
        </div>
      </div>

      {/* Progress Metrics */}
      <div className="space-y-3 mb-4">
        {metrics.map((metric, index) => (
          <Card key={index} className={`p-3 ${metric.bgColor} border-0`}>
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
            </div>
            {metric.isCount ? (
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
                {metric.maxValue && (
                  <span className="text-sm text-gray-500">/ {metric.maxValue}</span>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{Math.round(metric.value)}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-gray-800">Recent Achievements</h4>
          </div>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <span className="text-lg">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-yellow-800 text-sm">{achievement.label}</p>
                  <p className="text-xs text-yellow-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <div className="text-center py-4">
          <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Complete more activities to unlock achievements!</p>
        </div>
      )}
    </Card>
  );
};
