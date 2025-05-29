
import React from 'react';
import { SmartSuggestions } from './SmartSuggestions';
import { ProgressAnalytics } from './ProgressAnalytics';
import { QuickActionPanel } from './QuickActionPanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Brain } from 'lucide-react';

interface EnhancedDashboardProps {
  activeModule: string | null;
  onSuggestionClick: (suggestion: string) => void;
}

export const EnhancedDashboard = ({ activeModule, onSuggestionClick }: EnhancedDashboardProps) => {
  return (
    <div className="space-y-6">
      <QuickActionPanel />
      <SmartSuggestions onSuggestionClick={onSuggestionClick} />
      <ProgressAnalytics />
      
      {/* Calendar Quick Access */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Calendar Access</h3>
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
