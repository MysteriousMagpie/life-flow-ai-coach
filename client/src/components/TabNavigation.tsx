
import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabNavigationProps {
  activeModule?: string | null;
  setActiveModule?: (module: string) => void;
  // New props for enhanced functionality
  tabs?: TabItem[];
  activeTab?: string | null;
  onTabClick?: (tabId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeModule, 
  setActiveModule,
  tabs,
  activeTab,
  onTabClick,
  variant = 'default',
  className
}) => {
  // If using the new interface
  if (tabs && onTabClick) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              "px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
              variant === 'compact' ? 'text-sm px-2 py-1' : 'px-4 py-2',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Legacy interface for backward compatibility
  const modules = ['dashboard', 'meals', 'tasks', 'workouts', 'schedule'];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {modules.map((module) => (
        <button
          key={module}
          onClick={() => setActiveModule?.(module)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeModule === module
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {module.charAt(0).toUpperCase() + module.slice(1)}
        </button>
      ))}
    </div>
  );
};
