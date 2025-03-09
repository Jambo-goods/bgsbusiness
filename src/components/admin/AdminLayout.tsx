import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/services/authService';
import { toast } from 'sonner';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { success } = await logoutUser();
    if (success) {
      toast.success('Déconnexion réussie');
      navigate('/login');
    } else {
      toast.error('Erreur lors de la déconnexion');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm h-16 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-semibold">Administration</h1>
          </div>
          <div>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white h-screen fixed left-0 top-16 shadow-sm transition-all duration-300 z-10`}>
          <div className="py-4">
            <ul className="space-y-2 px-3">
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  {isSidebarOpen && <span className="ml-3">Tableau de bord</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {isSidebarOpen && <span className="ml-3">Utilisateurs</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/projects"
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  {isSidebarOpen && <span className="ml-3">Projets</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/withdrawals"
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                    }`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  {isSidebarOpen && <span className="ml-3">Retraits</span>}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Content */}
        <div className={`pt-16 ${isSidebarOpen ? 'ml-64' : 'ml-16'} flex-1 transition-all duration-300`}>
          {children}
        </div>
      </div>
    </div>
  );
}
