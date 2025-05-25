
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ModulePanelProps {
  activeModule: string | null;
  setActiveModule: (module: string | null) => void;
}

export const ModulePanel = ({ activeModule, setActiveModule }: ModulePanelProps) => {
  const modules = [
    {
      id: 'meals',
      name: 'Meals',
      icon: '🍽️',
      status: 'active',
      description: 'Plan meals & grocery lists'
    },
    {
      id: 'workouts',
      name: 'Workouts',
      icon: '💪',
      status: 'pending',
      description: 'Schedule & track exercise'
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: '📅',
      status: 'synced',
      description: 'Manage time & events'
    },
    {
      id: 'tasks',
      name: 'Tasks',
      icon: '✅',
      status: 'active',
      description: 'Track to-dos & reminders'
    },
    {
      id: 'wellbeing',
      name: 'Well-being',
      icon: '🧘',
      status: 'idle',
      description: 'Mood & reflection tracking'
    },
    {
      id: 'time-blocks',
      name: 'Time Blocks',
      icon: '⏰',
      status: 'idle',
      description: 'Optimize daily schedule'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'synced': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-3">Life Modules</h3>
      <div className="space-y-2">
        {modules.map((module) => (
          <Button
            key={module.id}
            variant="ghost"
            onClick={() => setActiveModule(module.id === activeModule ? null : module.id)}
            className={`w-full justify-start p-3 h-auto ${
              activeModule === module.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xl">{module.icon}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{module.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(module.status)}`}
                  >
                    {module.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{module.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};
