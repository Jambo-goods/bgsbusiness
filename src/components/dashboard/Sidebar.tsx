import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { Home, LayoutDashboard, Users, Settings, HelpCircle, LogOut, MailIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const { user, signOut } = useUser();
  const router = useRouter();
  const isAdmin = user?.email === 'jambogoodsafrica@gmail.com';

  useEffect(() => {
    const handleResize = () => {
      setExpanded(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sections = [
    {
      title: 'General',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
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
          href: '/settings',
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
    <aside className={`${className} ${expanded ? 'w-64' : 'w-20'} fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out flex flex-col`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 p-4">
        {expanded ? (
          <span className="text-lg font-bold">BGS Invest</span>
        ) : (
          <span className="text-2xl font-bold">BGS</span>
        )}
      </div>
      
      <div className="flex flex-col flex-grow overflow-y-auto">
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            {section.title && (
              <div className={`px-4 py-2 font-semibold text-gray-500 uppercase text-xs ${expanded ? 'block' : 'hidden'}`}>
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className={cn({ 'hidden': !expanded })}>{item.name}</span>
              </a>
            ))}
          </div>
        ))}
        
        {/* Add Email Test link for admins */}
        {isAdmin && (
          <div className={`px-4 py-2 ${expanded ? 'block' : 'hidden'}`}>
            <a 
              href="/admin/email-test" 
              className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MailIcon className="h-5 w-5 mr-3" />
              <span>Test Email</span>
            </a>
          </div>
        )}
        
        <div className="mt-auto p-4 border-t border-gray-200">
          <a
            href="#"
            className="flex items-center p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              signOut();
              router.push('/');
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className={cn({ 'hidden': !expanded })}>Logout</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
