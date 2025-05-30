
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ActionResultsDisplayProps {
  actionResults: any[];
}

export const ActionResultsDisplay = ({ actionResults }: ActionResultsDisplayProps) => {
  if (!actionResults || actionResults.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {actionResults.map((result, index) => (
        <div key={index} className="text-xs flex items-center gap-1 bg-white/20 rounded px-2 py-1">
          {result.success ? (
            <CheckCircle className="w-3 h-3 text-green-300" />
          ) : (
            <XCircle className="w-3 h-3 text-red-300" />
          )}
          <span>{result.message}</span>
        </div>
      ))}
    </div>
  );
};
