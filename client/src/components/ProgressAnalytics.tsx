
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, CheckCircle } from 'lucide-react';

export const ProgressAnalytics = () => {
  const weeklyGoals = [
    { name: 'Tasks Completed', current: 12, target: 20, color: 'bg-blue-500' },
    { name: 'Workouts', current: 3, target: 5, color: 'bg-green-500' },
    { name: 'Meals Planned', current: 18, target: 21, color: 'bg-purple-500' }
  ];

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-green-500" />
        Weekly Progress
      </h3>
      <div className="space-y-4">
        {weeklyGoals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{goal.name}</span>
              <span className="text-sm text-gray-500">
                {goal.current}/{goal.target}
              </span>
            </div>
            <Progress 
              value={(goal.current / goal.target) * 100} 
              className="h-2"
            />
          </div>
        ))}
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              You're on track to meet 2 out of 3 goals this week!
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
