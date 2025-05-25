
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  activeModule: string | null;
}

export const Dashboard = ({ activeModule }: DashboardProps) => {
  const todayStats = {
    meals: { planned: 3, completed: 1 },
    workouts: { planned: 1, completed: 0 },
    tasks: { total: 8, completed: 3 },
    wellbeing: { mood: 7, journaled: false }
  };

  const weeklyGoals = [
    { name: 'Healthy Meals', progress: 60, color: 'bg-green-500' },
    { name: 'Exercise', progress: 40, color: 'bg-blue-500' },
    { name: 'Creative Time', progress: 25, color: 'bg-purple-500' },
    { name: 'Sleep Schedule', progress: 80, color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-4">
      {/* Today's Overview */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Today's Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Meals</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {todayStats.meals.completed}/{todayStats.meals.planned}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Workouts</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {todayStats.workouts.completed}/{todayStats.workouts.planned}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tasks</span>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {todayStats.tasks.completed}/{todayStats.tasks.total}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Mood</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              {todayStats.wellbeing.mood}/10
            </Badge>
          </div>
        </div>
      </Card>

      {/* Weekly Goals */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Weekly Goals</h3>
        <div className="space-y-3">
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{goal.name}</span>
                <span className="text-gray-800 font-medium">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Active Module Indicator */}
      {activeModule && (
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
          <h3 className="font-semibold mb-1">Active Module</h3>
          <p className="text-sm text-blue-100 capitalize">
            {activeModule.replace('-', ' ')} module is processing...
          </p>
        </Card>
      )}
    </div>
  );
};
