
import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  ArrowLeftRight, 
  Bell, 
  Home 
} from 'lucide-react';

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
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
        <div className="p-4 flex items-center space-x-2 border-b border-gray-800">
          <LayoutDashboard className="h-6 w-6 text-bgs-orange" />
          <span className="text-lg font-semibold">BGS Admin</span>
        </div>
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            <li>
              <Link 
                to="/admin/dashboard" 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/admin/dashboard') 
                    ? 'bg-bgs-orange text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/admin/users') 
                    ? 'bg-bgs-orange text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/projects" 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/admin/projects') 
                    ? 'bg-bgs-orange text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span>Projets</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/transactions" 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/admin/transactions') 
                    ? 'bg-bgs-orange text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Transactions</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/withdrawals" 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/admin/withdrawals') 
                    ? 'bg-bgs-orange text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span>Retraits</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/notifications" 
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive('/admin/notifications') 
                    ? 'bg-bgs-orange text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
            <User size={16} className="text-gray-300" />
            <span className="text-sm text-gray-300">{adminUser.email}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white border-gray-700 hover:bg-gray-800 flex-1"
            >
              <Home size={16} className="mr-1" />
              Accueil
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-300 hover:text-white border-gray-700 hover:bg-gray-800 flex-1"
            >
              <LogOut size={16} className="mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/admin/dashboard' && 'Tableau de bord'}
              {location.pathname === '/admin/users' && 'Gestion des utilisateurs'}
              {location.pathname === '/admin/projects' && 'Gestion des projets'}
              {location.pathname === '/admin/transactions' && 'Gestion des transactions'}
              {location.pathname === '/admin/withdrawals' && 'Gestion des retraits'}
              {location.pathname === '/admin/notifications' && 'Gestion des notifications'}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
