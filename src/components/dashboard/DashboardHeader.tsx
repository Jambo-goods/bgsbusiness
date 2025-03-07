
import { useState } from "react";
import { CalendarClock, TrendingUp, Banknote } from "lucide-react";

interface DashboardHeaderProps {
  userData: {
    firstName: string;
    lastName: string;
  };
}

export default function DashboardHeader({ userData }: DashboardHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light rounded-xl shadow-md p-6 mb-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour, {userData.firstName} {userData.lastName}
          </h1>
          <p className="text-white/80 mt-1">
            Bienvenue sur votre tableau de bord BGS Business Club
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
            <CalendarClock className="h-4 w-4 mr-2 text-white/80" />
            <span className="text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="bg-white/10 rounded-lg px-3 py-2 hidden md:flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-300" />
            <span className="text-sm text-green-300 font-medium">Marchés en hausse</span>
          </div>
        </div>
      </div>
    </header>
  );
}
