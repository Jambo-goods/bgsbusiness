
import { useState, useEffect } from 'react';

export function useSidebarState() {
  // Initialize from localStorage if available, otherwise default to expanded (true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('dashboardSidebarState');
    // Return true (expanded) if no saved preference or if explicitly set to 'true'
    return savedState === null ? true : savedState === 'true';
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('dashboardSidebarState', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return { isSidebarOpen, setIsSidebarOpen, toggleSidebar };
}
