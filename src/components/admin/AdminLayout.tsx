
import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Users, LayoutDashboard } from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!adminUser) {
    navigate('/admin/login');
    return null;
  }

  // Check if the current path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Administration</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              <Home size={16} className="mr-1" />
              Accueil
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-1">
            <Button 
              variant={isActive('/admin/dashboard') ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => navigate('/admin/dashboard')}
            >
              <LayoutDashboard size={16} className="mr-2" />
              Tableau de bord
            </Button>
            <Button 
              variant={isActive('/admin/users') ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => navigate('/admin/users')}
            >
              <Users size={16} className="mr-2" />
              Utilisateurs
            </Button>
          </div>
        </div>

        <main className="flex-1 p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
