
import React, { useMemo } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { MealPlanner } from '@/components/MealPlanner';
import { TaskManager } from '@/components/TaskManager';
import { WorkoutPlanner } from '@/components/WorkoutPlanner';
import { ReminderCenter } from '@/components/ReminderCenter';
import { TimeBlockScheduler } from '@/components/TimeBlockScheduler';
import { ChatInterface } from '@/components/ChatInterface';

interface ModuleContainerProps {
  activeModule: string;
}

/**
 * ModuleContainer manages all application modules and preserves their state
 * by keeping them mounted but hidden when not active. This approach:
 * 
 * 1. Prevents unmounting/remounting which would reset local state
 * 2. Preserves form inputs, scroll positions, and component state
 * 3. Avoids unnecessary useEffect re-runs on tab switches
 * 4. Uses CSS visibility/display to show/hide modules efficiently
 * 
 * Each module is rendered once and cached for the session lifetime.
 */
export const ModuleContainer = ({ activeModule }: ModuleContainerProps) => {
  // Memoize all modules to prevent unnecessary re-renders
  const modules = useMemo(() => ({
    dashboard: <Dashboard activeModule={activeModule} />,
    meals: <MealPlanner />,
    tasks: <TaskManager />,
    workouts: <WorkoutPlanner />,
    reminders: <ReminderCenter />,
    schedule: <TimeBlockScheduler />,
    chat: <ChatInterface />
  }), [activeModule]);

  return (
    <div className="relative">
      {Object.entries(modules).map(([moduleKey, component]) => (
        <div
          key={moduleKey}
          style={{
            display: activeModule === moduleKey ? 'block' : 'none'
          }}
          className="w-full"
        >
          {component}
        </div>
      ))}
    </div>
  );
};
