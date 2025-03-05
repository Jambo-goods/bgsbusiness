
import { BellIcon, ArrowUpIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
}

export default function DashboardHeader({ userData }: DashboardHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  
  const handleDismissAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationCount(0);
  };
  
  const handleDismissNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotificationCount(prev => Math.max(0, prev - 1));
  };
  
  return (
    <header className="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-bgs-blue">
          Bonjour, {userData.firstName} {userData.lastName}
        </h1>
        <p className="text-bgs-gray-medium mt-1">
          Bienvenue sur votre tableau de bord BGS Business Club
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-full bg-bgs-gray-light hover:bg-bgs-gray-light/80 transition-colors"
          >
            <BellIcon className="h-5 w-5 text-bgs-blue" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-xs text-white bg-bgs-orange rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
          
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-md rounded-lg border border-gray-100 z-50 p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-bgs-blue">Notifications</h3>
                {notificationCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={handleDismissAll}
                  >
                    Tout effacer
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {notificationCount === 0 ? (
                  <div className="py-6 text-center text-bgs-gray-medium">
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <>
                    <div className="p-2 hover:bg-bgs-gray-light rounded-lg cursor-pointer">
                      <div className="flex gap-3 items-start justify-between">
                        <div className="flex gap-3 items-start">
                          <div className="bg-green-100 p-2 rounded-full">
                            <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-bgs-blue">Rendement mis à jour</p>
                            <p className="text-xs text-bgs-gray-medium">Le rendement de BGS Wood Africa a augmenté à 15%</p>
                            <p className="text-xs text-bgs-gray-medium mt-1">Il y a 2 heures</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleDismissNotification(e, 1)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-2 hover:bg-bgs-gray-light rounded-lg cursor-pointer">
                      <div className="flex gap-3 items-start justify-between">
                        <div className="flex gap-3 items-start">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-bgs-blue">Nouveau projet disponible</p>
                            <p className="text-xs text-bgs-gray-medium">BGS Energy est maintenant ouvert aux investissements</p>
                            <p className="text-xs text-bgs-gray-medium mt-1">Il y a 1 jour</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleDismissNotification(e, 2)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <Button className="w-full text-center text-sm text-bgs-orange hover:text-bgs-orange-light mt-3" variant="ghost">
                Voir toutes les notifications
              </Button>
            </div>
          )}
        </div>
        
        <div className="h-10 w-10 rounded-full bg-bgs-blue text-white flex items-center justify-center font-medium">
          {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
        </div>
      </div>
    </header>
  );
}
