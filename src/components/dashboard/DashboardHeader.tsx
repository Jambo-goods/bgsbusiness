
import { useState } from "react";
import { CalendarClock, TrendingUp, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
  refreshData?: () => Promise<void>;
}

export default function DashboardHeader({ userData, refreshData }: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshData && !isRefreshing) {
      setIsRefreshing(true);
      await refreshData();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  return (
    <header className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light rounded-xl shadow-md p-5 mb-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour, {userData.firstName} {userData.lastName}
          </h1>
          <p className="text-white/90 mt-1">
            Bienvenue sur votre tableau de bord BGS Business Club
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <CalendarClock className="h-4 w-4 mr-2 text-white/80" />
            <span className="text-sm whitespace-nowrap">
              {new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-300" />
            <span className="text-sm text-green-300 font-medium whitespace-nowrap">Marchés en hausse</span>
          </div>

          {refreshData && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center transition-all hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 text-white/80 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm whitespace-nowrap">Actualiser</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
