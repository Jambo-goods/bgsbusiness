
import { useState, useEffect } from "react";
import { Bell, Wallet, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserMenuDropdown from "./UserMenuDropdown";
import DashboardMenuDropdown from "./DashboardMenuDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

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
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const {
          data
        } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        setIsAuthenticated(hasSession);
        
        if (hasSession) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('wallet_balance')
              .eq('id', data.session.user.id)
              .maybeSingle();
              
            if (!error && profileData) {
              setWalletBalance(profileData.wallet_balance || 0);
            } else {
              console.error("Error fetching wallet balance:", error);
              setWalletBalance(0);
            }
          } catch (err) {
            console.error("Failed to fetch wallet balance:", err);
            setWalletBalance(0);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    const authCheckInterval = setInterval(checkAuth, 60000);
    return () => {
      clearInterval(authCheckInterval);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      const notificationCheckInterval = setInterval(fetchUnreadCount, 30000);
      return () => {
        clearInterval(notificationCheckInterval);
      };
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

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

  const handleCloseNotifications = () => {
    setIsNotificationOpen(false);
  };

  const handleWalletClick = () => {
    console.log("Wallet button clicked, navigating to wallet tab");
    if (location.pathname.includes('/dashboard')) {
      // Already on dashboard, just update the search params
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tab', 'wallet');
      navigate({
        pathname: '/dashboard',
        search: searchParams.toString()
      }, { replace: true });
    } else {
      // Not on dashboard, navigate to dashboard with wallet tab
      navigate('/dashboard?tab=wallet');
    }
  };

  const isDashboardPage = location.pathname.includes('/dashboard');

  if (isLoading) {
    return null;
  }

  if (isDashboardPage) {
    return (
      <div className="flex items-center space-x-2">
        <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Home className="h-5 w-5 text-bgs-blue" />
        </Link>
        
        <button 
          onClick={handleWalletClick}
          className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors space-x-1"
          aria-label="Voir le portefeuille"
          title="Voir le portefeuille"
        >
          <Wallet className="h-5 w-5 text-bgs-blue" />
          {walletBalance !== null && (
            <span className="text-xs font-medium text-bgs-blue">
              {walletBalance.toLocaleString('fr-FR')}€
            </span>
          )}
        </button>

        <div className="relative notification-dropdown">
          <button onClick={() => {
            setIsNotificationOpen(!isNotificationOpen);
            if (isUserMenuOpen) setIsUserMenuOpen(false);
            if (isDashboardMenuOpen) setIsDashboardMenuOpen(false);
          }} className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-bgs-blue" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-bgs-orange rounded-full"></span>
            )}
          </button>
          
          <NotificationDropdown 
            isOpen={isNotificationOpen} 
            onClose={handleCloseNotifications}
          />
        </div>
      </div>
    );
  }

  return null;
}
