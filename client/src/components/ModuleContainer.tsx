
import React from 'react';

interface ModuleContainerProps {
  activeModule: string;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ activeModule }) => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 capitalize">{activeModule}</h2>
        <p className="text-gray-600">
          {activeModule} module content will be displayed here.
        </p>
      </div>
    </div>
  );
};
