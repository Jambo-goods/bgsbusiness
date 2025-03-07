
import { useState, useEffect } from 'react';

export function useSidebarState() {
  // Initialize from localStorage if available, otherwise default based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('dashboardSidebarState');
    
    // Check for saved preference
    if (savedState !== null) {
      return savedState === 'true';
    }
    
    // Initial state based on screen size
    return window.innerWidth >= 1024;
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('dashboardSidebarState', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Handle window resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Auto-close sidebar on mobile unless user specifically opened it
        if (isSidebarOpen && localStorage.getItem('dashboardSidebarState') !== 'true') {
          setIsSidebarOpen(false);
        }
      } else if (window.innerWidth >= 1280) {
        // Auto-expand on large screens unless user specifically closed it
        if (!isSidebarOpen && localStorage.getItem('dashboardSidebarState') !== 'false') {
          setIsSidebarOpen(true);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return { isSidebarOpen, setIsSidebarOpen, toggleSidebar };
}
