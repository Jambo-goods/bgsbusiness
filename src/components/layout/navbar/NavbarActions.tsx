
import { useState, useEffect } from "react";
import { Bell, User, LayoutDashboard, Wallet, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import UserMenuDropdown from "./UserMenuDropdown";
import DashboardMenuDropdown from "./DashboardMenuDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { supabase } from "@/integrations/supabase/client";

interface NavbarActionsProps {
  isActive: (path: string) => boolean;
}

export default function NavbarActions({
  isActive
}: NavbarActionsProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    walletBalance
  } = useWalletBalance();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is authenticated - optimized with early redirect
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const {
        data
      } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      setIsAuthenticated(hasSession);
      setIsLoading(false);
      
      // Redirect logic based on authentication state and current path
      const isDashboardPage = location.pathname.includes('/dashboard');
      if (hasSession && !isDashboardPage && location.pathname === '/login') {
        navigate('/dashboard');
      }
    };
    checkAuth();

    // Listen for auth state changes
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      
      // Handle redirect on login/logout
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isNotificationOpen || isUserMenuOpen || isDashboardMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.notification-dropdown') && !target.closest('.user-dropdown') && !target.closest('.dashboard-menu-dropdown')) {
          setIsNotificationOpen(false);
          setIsUserMenuOpen(false);
          setIsDashboardMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationOpen, isUserMenuOpen, isDashboardMenuOpen]);

  // Check if user is on a dashboard page
  const isDashboardPage = location.pathname.includes('/dashboard');

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // If the user is authenticated and not on dashboard, don't show any actions
  if (isAuthenticated && !isDashboardPage) {
    return null;
  }
  
  // If the user is not authenticated and not on dashboard, also don't show actions
  if (!isAuthenticated && !isDashboardPage) {
    return null;
  }
  
  // Only show dashboard actions when on dashboard pages
  if (isDashboardPage) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Home className="h-5 w-5 text-bgs-blue" />
        </Link>
        
        <Link to="/dashboard?tab=wallet" className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors space-x-1">
          <Wallet className="h-5 w-5 text-bgs-blue" />
          <span className="text-xs font-medium text-bgs-blue">
            {walletBalance.toLocaleString('fr-FR')}€
          </span>
        </Link>
        
        <div className="relative dashboard-menu-dropdown">
          <button onClick={() => {
            setIsDashboardMenuOpen(!isDashboardMenuOpen);
            if (isNotificationOpen) setIsNotificationOpen(false);
            if (isUserMenuOpen) setIsUserMenuOpen(false);
          }} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Dashboard Menu">
            <LayoutDashboard className="h-5 w-5 text-bgs-blue" />
          </button>
          <DashboardMenuDropdown isOpen={isDashboardMenuOpen} isActive={isActive} />
        </div>

        <div className="relative notification-dropdown">
          <button onClick={() => {
            setIsNotificationOpen(!isNotificationOpen);
            if (isUserMenuOpen) setIsUserMenuOpen(false);
            if (isDashboardMenuOpen) setIsDashboardMenuOpen(false);
          }} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-bgs-blue" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-bgs-orange rounded-full"></span>
          </button>
          
          <NotificationDropdown isOpen={isNotificationOpen} />
        </div>
        
        <div className="relative user-dropdown">
          <button onClick={() => {
            setIsUserMenuOpen(!isUserMenuOpen);
            if (isNotificationOpen) setIsNotificationOpen(false);
            if (isDashboardMenuOpen) setIsDashboardMenuOpen(false);
          }} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="User Menu">
            <User className="h-5 w-5 text-bgs-blue" />
          </button>
          <UserMenuDropdown isOpen={isUserMenuOpen} isActive={isActive} />
        </div>
      </div>
    );
  }
  
  return null;
}
