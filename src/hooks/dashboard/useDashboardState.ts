
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function useDashboardState() {
  const location = useLocation();
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

  // Update URL when active tab changes - but limit the frequency
  useEffect(() => {
    console.log(`Active tab changed to: ${activeTab}`);
    
    const updateUrl = () => {
      if (activeTab && activeTab !== 'overview') {
        // We're using a timeout to prevent excessive history updates
        setSearchParams({ tab: activeTab }, { replace: true });
      } else if (activeTab === 'overview') {
        // Remove tab parameter for overview tab
        if (searchParams.has('tab')) {
          searchParams.delete('tab');
          setSearchParams(searchParams, { replace: true });
        }
      }
    };
    
    // Add a small delay to prevent rapid sequential updates
    const timeoutId = setTimeout(updateUrl, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeTab, setSearchParams, searchParams]);

  // Also listen for URL changes to update the active tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      console.log(`Updating active tab from URL: ${tabFromUrl}`);
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  return {
    activeTab,
    setActiveTab
  };
}
