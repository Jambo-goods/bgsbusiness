
import { useState, useEffect } from "react";
import { Bell, Wallet, Home } from "lucide-react";
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

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const {
        data
      } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      setIsAuthenticated(hasSession);
      setIsLoading(false);
      
      const isDashboardPage = location.pathname.includes('/dashboard');
      if (hasSession && !isDashboardPage && location.pathname === '/login') {
        navigate('/dashboard');
      }
    };
    checkAuth();

    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      
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

  const isDashboardPage = location.pathname.includes('/dashboard');

  if (isLoading) {
    return null;
  }

  if (isDashboardPage) {
    return (
      <div className="flex items-center justify-center mx-auto space-x-2">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Home className="h-5 w-5 text-bgs-blue" />
        </Link>
        
        <Link to="/dashboard?tab=wallet" className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors space-x-1">
          <Wallet className="h-5 w-5 text-bgs-blue" />
          <span className="text-xs font-medium text-bgs-blue">
            {walletBalance.toLocaleString('fr-FR')}€
          </span>
        </Link>

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
      </div>
    );
  }

  return null;
}
