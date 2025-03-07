
import { useState } from "react";
import { CalendarClock, TrendingUp, RefreshCw, BellRing, Home, User } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
  refreshData?: () => Promise<void>;
  isRefreshing?: boolean;
  realTimeStatus?: 'connecting' | 'connected' | 'error';
}

export default function DashboardHeader({ 
  userData, 
  refreshData, 
  isRefreshing = false,
  realTimeStatus = 'connecting'
}: DashboardHeaderProps) {
  const handleRefresh = async () => {
    if (refreshData && !isRefreshing) {
      await refreshData();
    }
  };

  return (
    <header className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light rounded-xl shadow-lg p-5 mb-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Bonjour, {userData.firstName} {userData.lastName}
            {realTimeStatus === 'connected' && (
              <span className="flex items-center ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Live
              </span>
            )}
          </h1>
          <p className="text-white/90 mt-1">
            Bienvenue sur votre espace investisseur BGS Business Club
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <Link to="/" className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center transition-all hover:bg-white/20 border border-white/5">
            <Home className="h-4 w-4 text-white/80" />
          </Link>
          
          <Link to="/dashboard?tab=profile" className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center transition-all hover:bg-white/20 border border-white/5">
            <User className="h-4 w-4 text-white/80" />
          </Link>
          
          <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5">
            <CalendarClock className="h-4 w-4 mr-2 text-white/80" />
            <span className="text-sm whitespace-nowrap">
              {new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center border border-white/5">
            <TrendingUp className="h-4 w-4 mr-2 text-green-300" />
            <span className="text-sm text-green-300 font-medium whitespace-nowrap">Marchés en hausse</span>
          </div>

          {refreshData && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center transition-all hover:bg-white/20 border border-white/5"
            >
              <RefreshCw className={`h-4 w-4 mr-2 text-white/80 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm whitespace-nowrap">Actualiser</span>
            </button>
          )}
          
          <button className="relative bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center transition-all hover:bg-white/20 border border-white/5">
            <BellRing className="h-4 w-4 text-white/80" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">2</span>
          </button>
        </div>
      </div>
    </header>
  );
}
