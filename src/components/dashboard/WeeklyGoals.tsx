
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Goal {
  name: string;
  progress: number;
  color: string;
}

interface WeeklyGoalsProps {
  goals: Goal[];
}

export const WeeklyGoals = ({ goals }: WeeklyGoalsProps) => {
  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Weekly Goals</h3>
      <div className="space-y-2 sm:space-y-3">
        {goals.map((goal, index) => (
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
  );
};
