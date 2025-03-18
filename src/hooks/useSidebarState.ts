
import { useState, useEffect } from 'react';

export function useSidebarState() {
  // Initialize from localStorage if available, otherwise default based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('dashboardSidebarState');
    
    // Check for saved preference
    if (savedState !== null) {
      return savedState === 'true';
    }
    
    // Initial state based on screen size - default to open
    return true;
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('dashboardSidebarState', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Handle window resize to adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Auto-close sidebar on small screens
        setIsSidebarOpen(false);
      } else if (window.innerWidth >= 768) {
        // Auto-expand on larger screens
        setIsSidebarOpen(true);
      }
    };
    
    // Initialize based on current screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return { isSidebarOpen, setIsSidebarOpen, toggleSidebar };
}
