
import React from 'react';
import { SmartSuggestions } from './SmartSuggestions';
import { ProgressAnalytics } from './ProgressAnalytics';
import { QuickActionPanel } from './QuickActionPanel';

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
    </div>
  );
};
