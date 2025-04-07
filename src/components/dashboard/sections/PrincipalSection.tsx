
import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, PiggyBank, Activity, LineChart, Wallet, Calendar } from "lucide-react";

export default function PrincipalSection() {
  return (
    <div className="mb-8 space-y-1">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Principal
      </h2>
      
      <Link to="/dashboard" className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors">
        <span className="mr-3 text-gray-400">
          <HomeIcon size={18} />
        </span>
        Tableau de bord
      </Link>
      
      <Link to="/dashboard/projects" className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors">
        <span className="mr-3 text-gray-400">
          <PiggyBank size={18} />
        </span>
        Nos projets
      </Link>
      
      <Link to="/dashboard/investments" className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors">
        <span className="mr-3 text-gray-400">
          <Activity size={18} />
        </span>
        Mes investissements
      </Link>
      
      <Link to="/dashboard/statistics" className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors">
        <span className="mr-3 text-gray-400">
          <LineChart size={18} />
        </span>
        Statistiques
      </Link>
      
      <Link to="/dashboard/wallet" className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors">
        <span className="mr-3 text-gray-400">
          <Wallet size={18} />
        </span>
        Mon portefeuille
      </Link>
      
      <Link to="/dashboard/scheduled-payments" className="flex items-center py-2 px-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-bgs-blue rounded-md transition-colors">
        <span className="mr-3 text-gray-400">
          <Calendar size={18} />
        </span>
        Paiements programmés
      </Link>
    </div>
  );
}
