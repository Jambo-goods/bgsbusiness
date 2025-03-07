
import { cn } from "@/lib/utils";
import { Bell, User, LayoutDashboard, Wallet, TrendingUp, BarChart3, Briefcase, Settings, UserCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarHeaderProps {
  isScrolled: boolean;
  children?: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, children }: NavbarHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  const location = useLocation();
  
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

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {children}
          
          <div className="flex items-center space-x-2">
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

              {isDashboardMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 border border-gray-100 py-2 animate-fade-in">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 mb-1">Menu rapide</div>
                  <Link to="/dashboard" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/dashboard') && !location.search ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <LayoutDashboard className="h-4 w-4 mr-3 text-bgs-blue" />
                    Tableau de bord
                  </Link>
                  <Link to="/dashboard?tab=wallet" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=wallet') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Wallet className="h-4 w-4 mr-3 text-bgs-blue" />
                    Solde disponible
                  </Link>
                  <Link to="/dashboard?tab=capital" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=capital') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <TrendingUp className="h-4 w-4 mr-3 text-bgs-blue" />
                    Capital investi
                  </Link>
                  <Link to="/dashboard?tab=yield" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=yield') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <BarChart3 className="h-4 w-4 mr-3 text-bgs-blue" />
                    Rendement mensuel
                  </Link>
                  <Link to="/dashboard?tab=investments" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=investments') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Briefcase className="h-4 w-4 mr-3 text-bgs-blue" />
                    Investissements
                  </Link>
                </div>
              )}
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
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-4 border border-gray-100 animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-bgs-blue">Notifications</h3>
                    <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full font-medium">3 nouvelles</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    <div className="py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors">
                      <p className="text-sm font-medium text-bgs-blue">Nouvel investissement disponible</p>
                      <p className="text-xs text-gray-500 mt-0.5">Il y a 20 minutes</p>
                    </div>
                    <div className="py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors">
                      <p className="text-sm font-medium text-bgs-blue">Rendement mis à jour</p>
                      <p className="text-xs text-gray-500 mt-0.5">Il y a 2 heures</p>
                    </div>
                    <div className="py-3 hover:bg-gray-50 cursor-pointer rounded-md px-3 transition-colors">
                      <p className="text-sm font-medium text-bgs-blue">Paiement reçu</p>
                      <p className="text-xs text-gray-500 mt-0.5">Il y a 1 jour</p>
                    </div>
                  </div>
                  <button className="w-full text-center text-sm text-bgs-blue hover:text-bgs-blue-dark mt-3 font-medium transition-colors">
                    Voir toutes les notifications
                  </button>
                </div>
              )}
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
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg z-50 border border-gray-100 animate-fade-in">
                  <div className="py-3 px-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-bgs-blue">Compte utilisateur</p>
                    <p className="text-xs text-gray-500 mt-0.5">Gérez vos informations</p>
                  </div>
                  <div className="py-2">
                    <Link to="/dashboard/profile" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/profile') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <UserCircle className="h-4 w-4 mr-3 text-bgs-blue" />
                      Mon Profil
                    </Link>
                    <Link to="/dashboard/settings" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/settings') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <Settings className="h-4 w-4 mr-3 text-bgs-blue" />
                      Paramètres
                    </Link>
                    <hr className="my-1" />
                    <Link to="/logout" className="flex items-center px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="h-4 w-4 mr-3" />
                      Déconnexion
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
