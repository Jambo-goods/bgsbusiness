
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useDashboardState() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract tab from URL path
  const pathParts = location.pathname.split('/');
  const tabFromPath = pathParts.length > 2 ? pathParts[2] : null;
  
  // List of valid tabs
  const validTabs = [
    "overview", "wallet", "yield", "investments", 
    "projects", "referrals", "profile", "notifications", "settings"
  ];
  
  // Initialize state with tab from URL or "overview" as default
  const [activeTab, setActiveTab] = useState(() => {
    return validTabs.includes(tabFromPath || "") ? tabFromPath : "overview";
  });

  // Update activeTab when URL changes
  useEffect(() => {
    if (tabFromPath && tabFromPath !== activeTab && validTabs.includes(tabFromPath)) {
      setActiveTab(tabFromPath);
    }
  }, [tabFromPath, activeTab]);

  // Handle tab change with URL update
  const handleTabChange = (tab: string) => {
    if (validTabs.includes(tab)) {
      setActiveTab(tab);
      navigate(`/dashboard/${tab}`, { replace: true });
    } else {
      console.warn(`Invalid tab: ${tab}. Defaulting to overview.`);
      setActiveTab("overview");
      navigate("/dashboard/overview", { replace: true });
    }
  };

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
}
