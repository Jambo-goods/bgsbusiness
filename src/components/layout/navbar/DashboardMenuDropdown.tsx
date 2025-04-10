
import { useState } from "react";
import { LayoutDashboard, TrendingUp, Briefcase, Award, WalletCards } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardMenuDropdown() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { walletBalance, isLoadingBalance } = useWalletBalance();
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname.includes(path) || location.search.includes(path);
  };
  
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        <WalletCards className="h-5 w-5 text-gray-700" />
        {isLoadingBalance ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-sm font-medium text-gray-700">{walletBalance} €</span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 border border-gray-100 py-2 animate-fade-in">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 mb-1">Menu rapide</div>
          <Link to="/dashboard" className={`flex items-center px-4 py-2.5 text-sm ${isActive('/dashboard') && !location.search ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
            <LayoutDashboard className="h-4 w-4 mr-3 text-bgs-blue" />
            Tableau de bord
          </Link>
          <Link to="/dashboard?tab=wallet" className={`flex items-center px-4 py-2.5 text-sm ${isActive('tab=wallet') ? 'bg-gray-50 text-bgs-blue font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
            <WalletCards className="h-4 w-4 mr-3 text-bgs-blue" />
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
        </div>
      )}
    </div>
  );
}
