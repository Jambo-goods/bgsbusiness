
import { LayoutDashboard, Wallet, TrendingUp, Briefcase, Award, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface DashboardMenuDropdownProps {
  isOpen: boolean;
  isActive: (path: string) => boolean;
}

export default function DashboardMenuDropdown({ isOpen, isActive }: DashboardMenuDropdownProps) {
  const location = useLocation();
  
  if (!isOpen) return null;
  
  return (
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
      <Link to="/dashboard?tab=yield" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=yield') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
        <TrendingUp className="h-4 w-4 mr-3 text-bgs-blue" />
        Rendement mensuel
      </Link>
      <Link to="/dashboard?tab=investments" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=investments') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Briefcase className="h-4 w-4 mr-3 text-bgs-blue" />
        Investissements
      </Link>
      <Link to="/dashboard?tab=opportunities" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=opportunities') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Award className="h-4 w-4 mr-3 text-bgs-blue" />
        Opportunités
      </Link>
      <Link to="/scheduled-payments" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/scheduled-payments') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Calendar className="h-4 w-4 mr-3 text-bgs-blue" />
        Paiements Programmés
      </Link>
    </div>
  );
}
