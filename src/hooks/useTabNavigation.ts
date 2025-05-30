
import { useState } from 'react';

export const useTabNavigation = (initialTab: string | null = null) => {
  const [activeTab, setActiveTab] = useState<string | null>(initialTab);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      // Optionally toggle off if same tab is clicked
      // setActiveTab(null);
      return;
    }
    setActiveTab(tabId);
  };

  const clearActiveTab = () => {
    setActiveTab(null);
  };

  return {
    activeTab,
    setActiveTab,
    handleTabClick,
    clearActiveTab
  };
};
