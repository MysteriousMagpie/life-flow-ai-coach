
import React from 'react';

interface TabNavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeModule, setActiveModule }) => {
  const modules = ['dashboard', 'meals', 'tasks', 'workouts', 'schedule'];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {modules.map((module) => (
        <button
          key={module}
          onClick={() => setActiveModule(module)}
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
