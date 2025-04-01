import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons-set';
import { useAdmin } from '@/contexts/AdminContext';

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
    
    console.log("AdminLayout mounted, current path:", pathname);
  }, [isLoggedIn, navigate, pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: <Icons.home className="h-5 w-5" /> },
    { path: '/admin/projects', label: 'Projets', icon: <Icons.package className="h-5 w-5" /> },
    { path: '/admin/scheduled-payments', label: 'Paiements programmés', icon: <Icons.calendar className="h-5 w-5" /> },
    { path: '/admin/withdrawal-requests', label: 'Demandes de retrait', icon: <Icons.creditCard className="h-5 w-5" /> },
    { path: '/admin/bank-transfers', label: 'Virements bancaires', icon: <Icons.banknote className="h-5 w-5" /> },
    { path: '/admin/profiles', label: 'Profils utilisateurs', icon: <Icons.user className="h-5 w-5" /> },
    { path: '/admin/notifications', label: 'Notifications', icon: <Icons.bell className="h-5 w-5" /> },
    { path: '/admin/project-updates', label: 'Mises à jour projets', icon: <Icons.info className="h-5 w-5" /> },
    { path: '/admin/settings', label: 'Paramètres', icon: <Icons.settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 z-30`}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-4 py-6">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 font-semibold text-lg text-gray-800"
              >
                {sidebarOpen ? (
                  <>
                    <Icons.logo className="h-6 w-6 text-bgs-blue" />
                    <span>Admin</span>
                  </>
                ) : (
                  <Icons.logo className="h-6 w-6 text-bgs-blue" />
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <Icons.chevronLeft className="h-4 w-4" />
                ) : (
                  <Icons.chevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            <nav className="mt-6 px-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                        pathname === item.path
                          ? 'bg-bgs-blue text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      } ${!sidebarOpen ? 'justify-center' : ''}`}
                    >
                      {item.icon}
                      {sidebarOpen && <span className="ml-3">{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="px-4 py-6">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`flex items-center w-full ${
                !sidebarOpen ? 'justify-center' : ''
              }`}
            >
              <Icons.logout className="h-5 w-5" />
              {sidebarOpen && <span className="ml-3">Déconnexion</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
