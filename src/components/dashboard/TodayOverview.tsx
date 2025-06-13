
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TodayStats {
  meals: { planned: number; completed: number };
  workouts: { planned: number; completed: number };
  tasks: { total: number; completed: number };
  wellbeing: { mood: number; journaled: boolean };
}

interface TodayOverviewProps {
  stats: TodayStats;
}

export const TodayOverview = ({ stats }: TodayOverviewProps) => {
  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Today's Progress</h3>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Meals</span>
          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
            {stats.meals.planned} planned
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Workouts</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
            {stats.workouts.completed}/{stats.workouts.planned}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Tasks</span>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
            {stats.tasks.completed}/{stats.tasks.total}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Mood</span>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
            {stats.wellbeing.mood}/10
          </Badge>
        </div>
      </div>
    </Card>
  );
};
