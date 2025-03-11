
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Users, Settings, HelpCircle, LogOut, MailIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar, handleLogout, activeTab, setActiveTab }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setExpanded(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Get user email
    const getUserEmail = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const email = sessionData.session.user.email;
        setUserEmail(email);
        setIsAdmin(email === 'jambogoodsafrica@gmail.com');
      }
    };

    getUserEmail();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavigation = (path: string) => {
    if (path.startsWith('/')) {
      navigate(path);
    } else {
      setActiveTab(path);
    }
  };

  const sections = [
    {
      title: 'General',
      items: [
        {
          name: 'Dashboard',
          href: 'overview',
          icon: Home,
        },
        {
          name: 'Projects',
          href: '/projects',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          name: 'Users',
          href: '/users',
          icon: Users,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          name: 'Settings',
          href: 'settings',
          icon: Settings,
        },
        {
          name: 'Help',
          href: '/help',
          icon: HelpCircle,
        },
      ],
    },
  ];

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out flex flex-col`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 p-4">
        {isSidebarOpen ? (
          <span className="text-lg font-bold">BGS Invest</span>
        ) : (
          <span className="text-2xl font-bold">BGS</span>
        )}
      </div>
      
      <div className="flex flex-col flex-grow overflow-y-auto">
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            {section.title && (
              <div className={`px-4 py-2 font-semibold text-gray-500 uppercase text-xs ${isSidebarOpen ? 'block' : 'hidden'}`}>
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center w-full text-left p-2 text-sm ${
                  (item.href === activeTab || location.pathname === item.href) 
                    ? 'bg-gray-100 text-bgs-blue' 
                    : 'text-gray-600 hover:bg-gray-100'
                } rounded-lg`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className={cn({ 'hidden': !isSidebarOpen })}>{item.name}</span>
              </button>
            ))}
          </div>
        ))}
        
        {/* Add Email Test link for admins */}
        {isAdmin && (
          <div className={`px-4 py-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <button 
              onClick={() => navigate('/admin/email-test')}
              className="flex items-center w-full text-left p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MailIcon className="h-5 w-5 mr-3" />
              <span>Test Email</span>
            </button>
          </div>
        )}
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <button
            className="flex items-center w-full text-left p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className={cn({ 'hidden': !isSidebarOpen })}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
