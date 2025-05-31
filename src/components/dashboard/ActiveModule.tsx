
import React from 'react';
import { Card } from '@/components/ui/card';

interface ActiveModuleProps {
  activeModule: string | null;
}

export const ActiveModule = ({ activeModule }: ActiveModuleProps) => {
  if (!activeModule) return null;

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg w-full">
      <h3 className="font-semibold mb-1 text-sm sm:text-base">Active Module</h3>
      <p className="text-xs sm:text-sm text-blue-100 capitalize">
        {activeModule.replace('-', ' ')} module is processing...
      </p>
    </Card>
  );
};
