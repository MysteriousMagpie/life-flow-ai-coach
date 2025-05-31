
import React from 'react';
import { SmartSuggestions } from './SmartSuggestions';
import { ProgressAnalytics } from './ProgressAnalytics';
import { QuickActionPanel } from './QuickActionPanel';
import { TabNavigation, TabItem } from './TabNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Brain } from 'lucide-react';

interface EnhancedDashboardProps {
  activeModule: string | null;
  onSuggestionClick: (suggestion: string) => void;
}

export const EnhancedDashboard = ({ activeModule, onSuggestionClick }: EnhancedDashboardProps) => {
  const quickTabs: TabItem[] = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'timeline', label: 'Timeline', icon: '⏰' },
    { id: 'meals', label: 'Meals', icon: '🍽️' },
    { id: 'scheduling', label: 'Assistant', icon: '🧠' }
  ];

  const handleQuickTabClick = (tabId: string) => {
    // Trigger suggestion based on tab
    const suggestions = {
      calendar: "Show me today's schedule in calendar view",
      timeline: "Create time blocks for my pending tasks", 
      meals: "Help me plan my meals for this week",
      scheduling: "Help me optimize my schedule for this week"
    };
    onSuggestionClick(suggestions[tabId] || suggestions.calendar);
  };

  return (
    <div className="space-y-6">
      <QuickActionPanel />
      
      {/* Quick Module Access */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Access</h3>
        <TabNavigation
          tabs={quickTabs}
          activeTab={activeModule}
          onTabClick={handleQuickTabClick}
          variant="compact"
          className="justify-center"
        />
      </Card>

      <SmartSuggestions onSuggestionClick={onSuggestionClick} />
      <ProgressAnalytics />
      
      {/* Calendar Quick Access */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Calendar Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => onSuggestionClick("Show me today's schedule in calendar view")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today's Schedule
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => onSuggestionClick("Help me optimize my schedule for this week")}
          >
            <Brain className="h-4 w-4 mr-2" />
            Optimize Schedule
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => onSuggestionClick("Create time blocks for my pending tasks")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Block Time for Tasks
          </Button>
        </div>
      </Card>
    </div>
  );
};
