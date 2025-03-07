
import { cn } from "@/lib/utils";
import { Search, Bell, User } from "lucide-react";
import { useState } from "react";

interface NavbarHeaderProps {
  isScrolled: boolean;
  children: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, children }: NavbarHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-white shadow-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {children}
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-bgs-blue/20 w-48 md:w-64"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-bgs-orange rounded-full"></span>
              </button>
              
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-3 border border-gray-100">
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
            
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5 text-gray-500" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100">
                  <div className="py-2">
                    <a href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon Profil
                    </a>
                    <a href="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </a>
                    <hr className="my-1" />
                    <a href="/logout" className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
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
