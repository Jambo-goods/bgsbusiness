
import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, Database, Wallet, ArrowRightFromLine, 
  CreditCard, RefreshCw, LayoutDashboard, Clock, 
  Building, BanknoteIcon, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';

interface DatabaseLayoutProps {
  children: React.ReactNode;
}

const DatabaseLayout: React.FC<DatabaseLayoutProps> = ({ children }) => {
  const { adminUser, logout } = useAdmin();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!adminUser) {
    return <Navigate to="/database/login" replace />;
  }

  const navigation = [
    { name: 'Tableau de bord', href: '/database/dashboard', icon: LayoutDashboard },
    { name: 'Utilisateurs', href: '/database/users', icon: Users },
    { name: 'Paiements programmés', href: '/database/scheduled-payments', icon: Clock },
    { name: 'Transactions', href: '/database/wallet-transactions', icon: Wallet },
    { name: 'Demandes de retrait', href: '/database/withdrawal-requests', icon: CreditCard },
    { name: 'Projets', href: '/database/projects', icon: Building },
    { name: 'Virements bancaires', href: '/database/bank-transfers', icon: BanknoteIcon },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar pour mobile (overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out lg:relative lg:flex`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 flex justify-between items-center">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-bgs-orange" />
              <span className="ml-2 text-xl font-bold">Admin DB</span>
            </div>
            <button 
              className="lg:hidden text-white"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 px-4 space-y-1 overflow-y-auto">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center px-4 py-3 text-sm rounded-md ${
                      isActive
                        ? 'bg-bgs-orange text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center pb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-bgs-orange flex items-center justify-center">
                  <span className="text-white font-medium">
                    {adminUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{adminUser.email}</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-center"
              onClick={logout}
            >
              <ArrowRightFromLine className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <RefreshCw className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">
                Dernière mise à jour: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DatabaseLayout;
