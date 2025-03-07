
import { cn } from "@/lib/utils";
import { Bell, User, LayoutDashboard, Wallet, TrendingUp, BarChart3, Briefcase, Settings, UserCircle, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarHeaderProps {
  isScrolled: boolean;
  children: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, children }: NavbarHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);
  
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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-white shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {children}
          
          <div className="flex items-center space-x-4">
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
                <LayoutDashboard className="h-5 w-5 text-gray-500" />
              </button>

              {isDashboardMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg z-50 border border-gray-100 animate-in fade-in duration-200">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Menu rapide</div>
                    <a href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LayoutDashboard className="h-4 w-4 mr-2 text-bgs-blue" />
                      Tableau de bord
                    </a>
                    <a href="/dashboard?tab=wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Wallet className="h-4 w-4 mr-2 text-bgs-blue" />
                      Solde disponible
                    </a>
                    <a href="/dashboard?tab=capital" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <TrendingUp className="h-4 w-4 mr-2 text-bgs-blue" />
                      Capital investi
                    </a>
                    <a href="/dashboard?tab=yield" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <BarChart3 className="h-4 w-4 mr-2 text-bgs-blue" />
                      Rendement mensuel
                    </a>
                    <a href="/dashboard?tab=investments" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Briefcase className="h-4 w-4 mr-2 text-bgs-blue" />
                      Investissements
                    </a>
                  </div>
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
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-bgs-orange rounded-full"></span>
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-3 border border-gray-100 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-700">Notifications</h3>
                    <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full">3 nouvelles</span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                    <div className="py-2 hover:bg-gray-50 cursor-pointer rounded-md px-2">
                      <p className="text-sm font-medium text-gray-700">Nouvel investissement disponible</p>
                      <p className="text-xs text-gray-500">Il y a 20 minutes</p>
                    </div>
                    <div className="py-2 hover:bg-gray-50 cursor-pointer rounded-md px-2">
                      <p className="text-sm font-medium text-gray-700">Rendement mis à jour</p>
                      <p className="text-xs text-gray-500">Il y a 2 heures</p>
                    </div>
                    <div className="py-2 hover:bg-gray-50 cursor-pointer rounded-md px-2">
                      <p className="text-sm font-medium text-gray-700">Paiement reçu</p>
                      <p className="text-xs text-gray-500">Il y a 1 jour</p>
                    </div>
                  </div>
                  <button className="w-full text-center text-sm text-bgs-blue hover:text-bgs-blue-dark mt-2">
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
                <User className="h-5 w-5 text-gray-500" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 animate-in fade-in duration-200">
                  <div className="py-2">
                    <a href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <UserCircle className="h-4 w-4 mr-2 text-bgs-blue" />
                      Mon Profil
                    </a>
                    <a href="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4 mr-2 text-bgs-blue" />
                      Paramètres
                    </a>
                    <hr className="my-1" />
                    <a href="/logout" className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </a>
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
