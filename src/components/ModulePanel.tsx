
import React from 'react';
import { TaskManager } from './TaskManager';
import { WorkoutTracker } from './WorkoutTracker';
import { ReminderCenter } from './ReminderCenter';
import { TimeBlockScheduler } from './TimeBlockScheduler';
import { MealPlanner } from './MealPlanner';
import { QuickActionPanel } from './QuickActionPanel';

interface ModulePanelProps {
  activeModule: string | null;
}

export const ModulePanel = ({ activeModule }: ModulePanelProps) => {
  const renderModule = () => {
    switch (activeModule) {
      case 'tasks':
        return <TaskManager />;
      case 'workouts':
        return <WorkoutTracker />;
      case 'reminders':
        return <ReminderCenter />;
      case 'time-blocks':
        return <TimeBlockScheduler />;
      case 'meals':
        return <MealPlanner />;
      default:
        return <QuickActionPanel />;
    }
  };

  return (
    <div className="space-y-4">
      {renderModule()}
    </div>
  );
};
