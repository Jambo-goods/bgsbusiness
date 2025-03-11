
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function useDashboardState() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      console.log(`Setting initial tab from URL param: ${tabParam}`);
      return tabParam;
    }
    
    if (location.state && location.state.activeTab) {
      console.log(`Setting initial tab from location state: ${location.state.activeTab}`);
      return location.state.activeTab;
    }
    
    return 'overview';
  });

  // Update active tab when URL params change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      console.log(`Updating tab from URL param change: ${tabParam}`);
      setActiveTab(tabParam);
    } else if (!tabParam && location.pathname === '/dashboard') {
      // If no tab parameter but we're on dashboard route, set to overview
      console.log("No tab param, setting to overview");
      setActiveTab('overview');
    }
  }, [searchParams, location.pathname]);
  
  // Update URL when active tab changes
  useEffect(() => {
    console.log(`Active tab changed to: ${activeTab}`);
    if (activeTab && activeTab !== 'overview') {
      setSearchParams({ tab: activeTab });
    } else if (activeTab === 'overview') {
      // Remove tab parameter for overview tab
      searchParams.delete('tab');
      setSearchParams(searchParams);
    }
  }, [activeTab, setSearchParams, searchParams]);
  
  // Update from location state if provided
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      console.log(`Updating tab from location state change: ${location.state.activeTab}`);
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return {
    activeTab,
    setActiveTab
  };
}
