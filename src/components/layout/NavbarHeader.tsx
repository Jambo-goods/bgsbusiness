
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, CircleUserRound } from "lucide-react";

interface NavbarHeaderProps {
  isScrolled: boolean;
  children: React.ReactNode;
}

export default function NavbarHeader({ isScrolled, children }: NavbarHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      {children}
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-bgs-blue/20"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="h-5 w-5 text-bgs-blue" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-bgs-orange rounded-full"></span>
          </button>
          
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-100 z-50 p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-bgs-blue">Notifications</h3>
                <span className="text-xs bg-bgs-orange/10 text-bgs-orange px-2 py-0.5 rounded-full">2 nouvelles</span>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex gap-3 items-start">
                    <div className="bg-green-100 p-2 rounded-full">
                      <div className="h-4 w-4 text-green-500">📈</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bgs-blue">Rendement mis à jour</p>
                      <p className="text-xs text-gray-500">Le rendement de BGS Wood Africa a augmenté à 15%</p>
                      <p className="text-xs text-gray-500 mt-1">Il y a 2 heures</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex gap-3 items-start">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <div className="h-4 w-4 text-blue-500">🚀</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bgs-blue">Nouveau projet disponible</p>
                      <p className="text-xs text-gray-500">BGS Energy est maintenant ouvert aux investissements</p>
                      <p className="text-xs text-gray-500 mt-1">Il y a 1 jour</p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full text-center text-sm text-bgs-orange hover:text-bgs-orange-light mt-3">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
        
        <div className="h-8 w-8 rounded-full bg-bgs-blue text-white flex items-center justify-center">
          <CircleUserRound className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
