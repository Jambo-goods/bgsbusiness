
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, UserX, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between bg-gray-100 border-b p-4">
          <Link to="/admin" className="flex items-center text-xl font-bold text-gray-800">
            Admin Dashboard
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-8 space-y-2 px-4">
          <Link to="/admin" className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link to="/admin/profiles" className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <Users className="mr-3 h-5 w-5" />
            <span>Profils Utilisateurs</span>
          </Link>
          
          <Link to="/admin/inactive-users" className="flex items-center rounded-md px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <UserX className="mr-3 h-5 w-5" />
            <span>Utilisateurs Inactifs</span>
          </Link>
          
          {/* Add more navigation links here */}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-100">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} InvestEase
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out lg:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between h-16 bg-white shadow-md px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold ml-4">Admin Panel</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url as string} alt={user?.user_metadata?.full_name as string} />
                  <AvatarFallback>{(user?.user_metadata?.full_name as string)?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={8} forceMount>
              <DropdownMenuLabel>Mon Profil</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4">
          {/* Your page content will go here */}
        </main>
      </div>
    </div>
  );
}
