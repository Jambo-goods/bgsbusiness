
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Database } from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/database/login');
  };

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-bgs-orange" />
            <span className="text-lg font-semibold">Admin Database</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-gray-300" />
              <span className="text-sm">{adminUser.email}</span>
              <span className="px-2 py-1 text-xs bg-bgs-orange text-white rounded">
                {adminUser.role || 'admin'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-300 hover:text-white"
            >
              <LogOut size={16} className="mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-col">
        <main className="flex-1 p-4">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
