
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useDashboardState() {
  // Extract tab from URL if available
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split('/');
  const tabFromPath = pathParts.length > 2 ? pathParts[2] : null;
  
  // Initialize state with URL tab or "overview"
  const [activeTab, setActiveTab] = useState(() => {
    return tabFromPath || "overview";
  });

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      // Update URL when tab changes to maintain state in URL
      navigate(`/dashboard/${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate]);

  return {
    activeTab,
    setActiveTab
  };
}
