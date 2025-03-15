
import { useState, useEffect } from "react";
import { Bell, Wallet, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserMenuDropdown from "./UserMenuDropdown";
import DashboardMenuDropdown from "./DashboardMenuDropdown";
import { supabase } from "@/integrations/supabase/client";

interface NavbarActionsProps {
  isActive: (path: string) => boolean;
}

export default function NavbarActions({
  isActive
}: NavbarActionsProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    const handleOutsideClick = (event: MouseEvent) => {
      if (isUserMenuOpen || isDashboardMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-dropdown') && !target.closest('.dashboard-menu-dropdown')) {
          setIsUserMenuOpen(false);
          setIsDashboardMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isUserMenuOpen, isDashboardMenuOpen]);

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
      </div>
    );
  }

  return null;
}
