
import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { Dashboard } from '@/components/Dashboard';
import { ModulePanel } from '@/components/ModulePanel';

const Index = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            LifePlan AI
          </h1>
          <p className="text-gray-600 text-lg">
            Your intelligent life planning assistant
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface 
              conversations={conversations}
              setConversations={setConversations}
              setActiveModule={setActiveModule}
            />
          </div>

          {/* Dashboard */}
          <div className="space-y-6">
            <Dashboard activeModule={activeModule} />
            <ModulePanel 
              activeModule={activeModule}
              setActiveModule={setActiveModule}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
