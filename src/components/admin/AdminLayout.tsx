
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  DollarSign, 
  Wallet, 
  ArrowDownLeft, 
  FolderKanban, 
  Bell, 
  Settings, 
  User 
} from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-bgs-blue">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <LayoutDashboard className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Tableau de bord</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/users" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <Users className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Utilisateurs</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/profiles" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <UserCheck className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Gestion des profils</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/finance" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <DollarSign className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Finance</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/wallet" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <Wallet className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Portefeuilles</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/withdrawals" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <ArrowDownLeft className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Retraits</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/projects" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <FolderKanban className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Projets</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/notifications" 
                className={({ isActive }) => `
                  flex items-center px-6 py-3 hover:bg-gray-100
                  ${isActive ? 'bg-gray-100 border-l-4 border-bgs-blue' : ''}
                `}
              >
                <Bell className="mr-3 h-5 w-5 text-bgs-blue" />
                <span>Notifications</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-bgs-blue flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
