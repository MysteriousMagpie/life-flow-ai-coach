
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

interface TabNavigationProps {
  tabs?: TabItem[];
  activeTab?: string | null;
  onTabClick?: (tabId: string) => void;
  activeModule?: string;
  setActiveModule?: (module: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const TabNavigation = ({ 
  tabs, 
  activeTab, 
  onTabClick, 
  activeModule,
  setActiveModule,
  variant = 'default',
  className 
}: TabNavigationProps) => {
  
  // Default tabs if none provided
  const defaultTabs: TabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'View your progress overview' },
    { id: 'meals', label: 'Meal Planner', icon: '🍽️', description: 'Plan your meals and nutrition' },
    { id: 'tasks', label: 'Task Manager', icon: '✅', description: 'Organize your daily tasks' },
    { id: 'workouts', label: 'Workout Planner', icon: '💪', description: 'Schedule your fitness routine' },
    { id: 'reminders', label: 'Reminder Center', icon: '⏰', description: 'Set up important reminders' },
    { id: 'schedule', label: 'Time Blocks', icon: '📅', description: 'Block time for your activities' },
    { id: 'chat', label: 'AI Assistant', icon: '🤖', description: 'Chat with your AI planning coach' }
  ];

  const tabsToRender = tabs || defaultTabs;
  const currentActiveTab = activeTab || activeModule;
  const handleClick = onTabClick || setActiveModule;

  const handleTabClick = (tabId: string) => {
    if (currentActiveTab === tabId) {
      // Optionally collapse if same tab is clicked
      return;
    }
    if (handleClick) {
      handleClick(tabId);
    }
    
    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {tabsToRender.map((tab) => (
          <Button
            key={tab.id}
            variant={currentActiveTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center space-x-2 transition-all duration-200",
              currentActiveTab === tab.id && "bg-primary text-primary-foreground shadow-md"
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {tabsToRender.map((tab) => (
        <Button
          key={tab.id}
          variant="outline"
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            "h-20 flex flex-col items-center justify-center space-y-2 border-2 transition-all duration-200 hover:scale-[1.02]",
            currentActiveTab === tab.id 
              ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" 
              : "hover:border-primary/50"
          )}
        >
          <span className="text-lg font-medium">{tab.icon} {tab.label}</span>
          {tab.description && (
            <span className="text-sm text-gray-600">{tab.description}</span>
          )}
        </Button>
      ))}
    </div>
  );
};
