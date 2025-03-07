
import { useState, useEffect } from "react";
import { Bell, User, LayoutDashboard, Wallet, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import UserMenuDropdown from "./UserMenuDropdown";
import DashboardMenuDropdown from "./DashboardMenuDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { supabase } from "@/integrations/supabase/client";

interface NavbarActionsProps {
  isActive: (path: string) => boolean;
}

export default function NavbarActions({ isActive }: NavbarActionsProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { walletBalance } = useWalletBalance();
  const location = useLocation();
  
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isNotificationOpen || isUserMenuOpen || isDashboardMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.notification-dropdown') && 
            !target.closest('.user-dropdown') && 
            !target.closest('.dashboard-menu-dropdown')) {
          setIsNotificationOpen(false);
          setIsUserMenuOpen(false);
          setIsDashboardMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationOpen, isUserMenuOpen, isDashboardMenuOpen]);

  return (
    <div className="flex items-center space-x-2">
      <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <Home className="h-5 w-5 text-bgs-blue" />
      </Link>
      
      {isAuthenticated && (
        <Link to="/dashboard?tab=wallet" className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors space-x-1">
          <Wallet className="h-5 w-5 text-bgs-blue" />
          <span className="text-xs font-medium text-bgs-blue">
            {walletBalance.toLocaleString('fr-FR')}€
          </span>
        </Link>
      )}
      
      <div className="relative dashboard-menu-dropdown">
        <button
          onClick={() => {
            setIsDashboardMenuOpen(!isDashboardMenuOpen);
            if (isNotificationOpen) setIsNotificationOpen(false);
            if (isUserMenuOpen) setIsUserMenuOpen(false);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Dashboard Menu"
        >
          <LayoutDashboard className="h-5 w-5 text-bgs-blue" />
        </button>

        <DashboardMenuDropdown isOpen={isDashboardMenuOpen} isActive={isActive} />
      </div>

      <div className="relative notification-dropdown">
        <button 
          onClick={() => {
            setIsNotificationOpen(!isNotificationOpen);
            if (isUserMenuOpen) setIsUserMenuOpen(false);
            if (isDashboardMenuOpen) setIsDashboardMenuOpen(false);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-bgs-blue" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-bgs-orange rounded-full"></span>
        </button>
        
        <NotificationDropdown isOpen={isNotificationOpen} />
      </div>
      
      <div className="relative user-dropdown">
        <button 
          onClick={() => {
            setIsUserMenuOpen(!isUserMenuOpen);
            if (isNotificationOpen) setIsNotificationOpen(false);
            if (isDashboardMenuOpen) setIsDashboardMenuOpen(false);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="User menu"
        >
          <User className="h-5 w-5 text-bgs-blue" />
        </button>
        
        <UserMenuDropdown isOpen={isUserMenuOpen} isActive={isActive} />
      </div>
    </div>
  );
}
