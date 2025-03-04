
import { Bell, ArrowUp, Search, MessageSquare, X, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
}

export default function DashboardHeader({ userData }: DashboardHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <header className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-bgs-blue">
            Bonjour, {userData.firstName} {userData.lastName}
          </h1>
          <p className="text-bgs-gray-medium mt-1">
            Bienvenue sur votre tableau de bord BGS Business Club
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-bgs-gray-medium" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 w-64 bg-bgs-gray-light rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bgs-orange transition-all"
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 rounded-full bg-bgs-gray-light hover:bg-bgs-gray-light/80 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-bgs-blue" />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-bgs-orange rounded-full border-2 border-white"></span>
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-bgs-blue">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full">2 nouvelles</span>
                    <button className="text-bgs-gray-medium hover:text-bgs-blue transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
                  <div className="p-3 hover:bg-bgs-gray-light/50 border-l-2 border-bgs-orange transition-colors">
                    <div className="flex gap-3 items-start">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-bgs-blue">Rendement mis à jour</p>
                        <p className="text-xs text-bgs-gray-medium">Le rendement de BGS Wood Africa a augmenté à 15%</p>
                        <p className="text-xs text-bgs-gray-medium mt-1">Il y a 2 heures</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 hover:bg-bgs-gray-light/50 transition-colors">
                    <div className="flex gap-3 items-start">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-bgs-blue">Nouveau message</p>
                        <p className="text-xs text-bgs-gray-medium">L'équipe BGS vous a envoyé un message important</p>
                        <p className="text-xs text-bgs-gray-medium mt-1">Il y a 5 heures</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 hover:bg-bgs-gray-light/50 transition-colors">
                    <div className="flex gap-3 items-start">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <ArrowUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-bgs-blue">Nouveau projet disponible</p>
                        <p className="text-xs text-bgs-gray-medium">BGS Energy est maintenant ouvert aux investissements</p>
                        <p className="text-xs text-bgs-gray-medium mt-1">Il y a 1 jour</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border-t border-gray-100 bg-bgs-gray-light/30">
                  <button className="w-full text-center text-sm text-bgs-orange hover:text-bgs-orange-light font-medium transition-colors">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative group"
              aria-label="Profile menu"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-bgs-blue to-bgs-blue-light text-white flex items-center justify-center font-medium shadow-md transition-transform group-hover:scale-105">
                {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
              </div>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-bgs-blue to-bgs-blue-light text-white flex items-center justify-center text-xl font-medium mx-auto mb-2">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-bgs-blue">{userData.firstName} {userData.lastName}</h3>
                  <p className="text-xs text-bgs-gray-medium">Investisseur</p>
                </div>
                
                <div className="p-2">
                  <button className="flex items-center w-full p-2 rounded-lg text-left hover:bg-bgs-gray-light/50 transition-colors">
                    <User className="h-4 w-4 mr-3 text-bgs-gray-medium" />
                    <span className="text-sm text-bgs-blue">Profil</span>
                  </button>
                  <button className="flex items-center w-full p-2 rounded-lg text-left hover:bg-bgs-gray-light/50 transition-colors">
                    <Settings className="h-4 w-4 mr-3 text-bgs-gray-medium" />
                    <span className="text-sm text-bgs-blue">Paramètres</span>
                  </button>
                </div>
                
                <div className="p-3 border-t border-gray-100">
                  <button className="w-full p-2 bg-bgs-gray-light hover:bg-bgs-gray-light/70 text-bgs-blue font-medium rounded-lg text-sm transition-colors">
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
