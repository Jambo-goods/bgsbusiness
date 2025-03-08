
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOfflineUsersCount() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsersData = async () => {
      setIsLoading(true);
      try {
        // Get total users count
        const { count: totalCount, error: totalError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (totalError) {
          console.error('Error fetching total users:', totalError);
          return;
        }

        // Get online users (users with recent activity in the last 15 minutes)
        const { count: onlineCount, error: onlineError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_active_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

        if (onlineError) {
          console.error('Error fetching online users:', onlineError);
          return;
        }

        setTotalUsers(totalCount || 0);
        setOnlineUsers(onlineCount || 0);
      } catch (error) {
        console.error('Error in useOfflineUsersCount:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersData();
    // Set up a polling interval to refresh data every minute
    const interval = setInterval(fetchUsersData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    totalUsers,
    onlineUsers,
    offlineUsers: totalUsers - onlineUsers,
    isLoading
  };
}
