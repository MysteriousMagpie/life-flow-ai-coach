
import React, { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { MealPlanner } from '@/components/MealPlanner';
import { TaskManager } from '@/components/TaskManager';
import { WorkoutPlanner } from '@/components/WorkoutPlanner';
import { ReminderCenter } from '@/components/ReminderCenter';
import { TimeBlockScheduler } from '@/components/TimeBlockScheduler';
import { ChatInterface } from '@/components/ChatInterface';
import { TabNavigation } from '@/components/TabNavigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'meals':
        return <MealPlanner />;
      case 'tasks':
        return <TaskManager />;
      case 'workouts':
        return <WorkoutPlanner />;
      case 'reminders':
        return <ReminderCenter />;
      case 'schedule':
        return <TimeBlockScheduler />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
              Life Flow AI Coach
            </h1>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              Your intelligent companion for meal planning, task management, workout tracking, and life optimization
            </p>
          </div>

          <TabNavigation activeModule={activeModule} setActiveModule={setActiveModule} />

          <div className="mt-8">
            {renderModule()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
