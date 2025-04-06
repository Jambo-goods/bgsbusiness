import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notifications';
import { Bell, CreditCard, Gear, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function NavbarActions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        // Get notifications to count unread ones
        const notifications = await notificationService.getNotifications();
        setUnreadNotifications(notifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();

    const intervalId = setInterval(fetchNotificationCount, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <div className="flex items-center space-x-4">
      {/* Notification Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 bg-bgs-orange text-white text-xs rounded-full px-2 py-0.5">
              {unreadNotifications}
            </span>
          )}
        </button>
        <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
      </div>

      {/* User Avatar and Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="outline-none">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link to="/dashboard" className="block">
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Tableau de bord
            </DropdownMenuItem>
          </Link>
          <Link to="/settings" className="block">
            <DropdownMenuItem>
              <Gear className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
