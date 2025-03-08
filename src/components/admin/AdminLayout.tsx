
import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { logoutAdmin } from '@/services/adminAuthService';
import { 
  Database, ArrowLeftRight, 
  LayoutDashboard, LogOut, Menu, X, Bell, Users, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout() {
  const { adminUser, setAdminUser } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // If no admin user is logged in, redirect to login
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logoutAdmin();
    setAdminUser(null);
    toast.success("Vous avez été déconnecté");
    navigate("/admin/login");
  };

  const menuItems = [
    { 
      label: 'Tableau de bord', 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      path: '/admin/dashboard' 
    },
    { 
      label: 'Projets', 
      icon: <Database className="w-5 h-5" />, 
      path: '/admin/projects' 
    },
    { 
      label: 'Demandes de retrait', 
      icon: <ArrowLeftRight className="w-5 h-5" />, 
      path: '/admin/withdrawals' 
    },
    { 
      label: 'Gestion financière', 
      icon: <CreditCard className="w-5 h-5" />, 
      path: '/admin/finance' 
    },
    { 
      label: 'Profils', 
      icon: <Users className="w-5 h-5" />, 
      path: '/admin/profiles' 
    },
    { 
      label: 'Notifications', 
      icon: <Bell className="w-5 h-5" />, 
      path: '/admin/notifications' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <div className="bg-bgs-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <h1 className="text-xl font-bold">BGS Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-bgs-orange rounded-full"></span>
            </button>
            
            <div className="hidden md:flex items-center gap-2">
              <div className="text-sm">
                <div className="font-medium">
                  {adminUser.first_name} {adminUser.last_name}
                </div>
                <div className="text-white/70 text-xs">{adminUser.email}</div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-bgs-blue-light rounded-full"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg 
            transition-transform duration-300 ease-in-out z-50 pt-16 md:pt-0
          `}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 w-full rounded-lg
                  ${
                    location.pathname === item.path
                      ? 'bg-bgs-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            
            <hr className="my-4" />
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
