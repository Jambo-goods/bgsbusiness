
import React from 'react';
import { Link } from 'react-router-dom';
import { BanknoteIcon, Wallet, Users, Settings, LayoutDashboard } from 'lucide-react';

const SidebarMenu = () => {
  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="font-bold text-xl text-blue-600 flex items-center">
          Finance App
        </Link>
      </div>
      
      <nav className="p-4 space-y-1">
        <Link 
          to="/scheduled-payments" 
          className={`flex items-center gap-3 px-4 py-3 ${window.location.pathname === '/scheduled-payments' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
        >
          <BanknoteIcon className="h-5 w-5" />
          <span>Paiements Programmés</span>
        </Link>
        
        <Link 
          to="/withdrawal-requests" 
          className={`flex items-center gap-3 px-4 py-3 ${window.location.pathname === '/withdrawal-requests' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
        >
          <Wallet className="h-5 w-5" />
          <span>Demandes de retrait</span>
        </Link>
        
        <Link 
          to="/bank-transfers" 
          className={`flex items-center gap-3 px-4 py-3 ${window.location.pathname === '/bank-transfers' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
        >
          <BanknoteIcon className="h-5 w-5" />
          <span>Virements Bancaires</span>
        </Link>
        
        <Link 
          to="/profiles" 
          className={`flex items-center gap-3 px-4 py-3 ${window.location.pathname === '/profiles' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
        >
          <Users className="h-5 w-5" />
          <span>Profils</span>
        </Link>
        
        <Link 
          to="/admin/projects" 
          className={`flex items-center gap-3 px-4 py-3 ${window.location.pathname === '/admin/projects' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Gestion des Projets</span>
        </Link>
        
        <Link 
          to="/settings" 
          className={`flex items-center gap-3 px-4 py-3 ${window.location.pathname === '/settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg`}
        >
          <Settings className="h-5 w-5" />
          <span>Paramètres</span>
        </Link>
      </nav>
    </div>
  );
};

export default SidebarMenu;
