
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useDashboardState() {
  // Extract tab from URL if available
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const tabFromPath = pathParts.length > 2 ? pathParts[2] : null;
  
  // Initialize state with URL tab or "overview"
  const [activeTab, setActiveTab] = useState(() => {
    return tabFromPath || "overview";
  });

  // Update URL when tab changes
  useEffect(() => {
    // Optional: update URL when tab changes
    // Use this if you want to maintain tab state in URL
    // history.push(`/dashboard/${activeTab}`);
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab
  };
}
