
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, UserCircle2, Settings, Mail, HelpCircle, BellRing, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenuDropdown from './UserMenuDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardMenuDropdown from './DashboardMenuDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';

export default function NavbarActions() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { userId, handleLogout } = useUserSession();
  const navigate = useNavigate();

  useEffect(() => {
    console.info("Auth state changed in Navbar:", isAuthenticated);
    checkAuthState();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUnreadNotificationsCount();
      
      // Set up subscription for notifications
      const channel = supabase
        .channel('navbar-notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchUnreadNotificationsCount();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const checkAuthState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
    }
  };

  const fetchUnreadNotificationsCount = async () => {
    if (!userId) return;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('seen', false);
        
      if (error) {
        console.error('Error fetching unread notifications:', error);
        return;
      }
      
      if (count !== null) {
        setUnreadNotifications(count);
      }
    } catch (err) {
      console.error('Error in fetchUnreadNotificationsCount:', err);
    }
  };

  if (isAuthenticated === null) {
    return <div className="flex items-center gap-2"></div>; // Loading state
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <DashboardMenuDropdown isOpen={false} isActive={() => false} />
        
        <NotificationDropdown 
          unreadCount={unreadNotifications} 
          onMarkAllRead={fetchUnreadNotificationsCount}
        />
        
        <UserMenuDropdown />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
        <LogIn className="h-4 w-4 mr-2" />
        Se connecter
      </Button>
      <Button variant="default" size="sm" onClick={() => navigate('/register')}>
        S'inscrire
      </Button>
    </div>
  );
}
