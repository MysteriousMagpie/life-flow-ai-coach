
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Workout } from '@/types/database';

interface WeeklyWorkoutsProps {
  workouts: Workout[];
}

export const WeeklyWorkouts = ({ workouts }: WeeklyWorkoutsProps) => {
  return (
    <Card className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base flex items-center">
        📆 This Week's Workouts
      </h3>
      {workouts.length > 0 ? (
        <div className="space-y-2">
          {workouts.map((workout, index) => (
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
  );
};
