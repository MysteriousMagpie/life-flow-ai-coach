
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ActionResult {
  success: boolean;
  message: string;
  functionName?: string;
  error?: string;
}

interface ActionResultsDisplayProps {
  actionResults: ActionResult[];
}

export const ActionResultsDisplay = ({ actionResults }: ActionResultsDisplayProps) => {
  if (!actionResults || actionResults.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-white/90 mb-1">Actions Performed:</div>
      {actionResults.map((result, index) => (
        <div key={index} className="text-xs flex items-center gap-2 bg-white/20 rounded px-2 py-1">
          {result.success ? (
            <CheckCircle className="w-3 h-3 text-green-300 flex-shrink-0" />
          ) : (
            <XCircle className="w-3 h-3 text-red-300 flex-shrink-0" />
          )}
          <span className="flex-1">{result.message}</span>
          {result.functionName && (
            <span className="text-white/60 text-[10px]">({result.functionName})</span>
          )}
        </div>
      ))}
    </div>
  );
};
