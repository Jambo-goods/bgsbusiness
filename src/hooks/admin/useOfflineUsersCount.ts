
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';
import { toast } from 'sonner';

export function useOfflineUsersCount() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all profiles without requiring authentication
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setError('Impossible de récupérer les données des utilisateurs');
          toast.error('Erreur de chargement', {
            description: 'Impossible de récupérer les données des utilisateurs'
          });
          return;
        }

        console.log(`Fetched ${profiles?.length || 0} user profiles from database`);
        setUsersData(profiles || []);
        setTotalUsers(profiles?.length || 0);
        
        // Calculate online users (users with recent activity in the last 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const onlineUsersCount = profiles?.filter(
          profile => profile.last_active_at && profile.last_active_at >= fifteenMinutesAgo
        ).length || 0;
        
        setOnlineUsers(onlineUsersCount);
        
        console.log(`Total users: ${profiles?.length}, Online users: ${onlineUsersCount}`);
      } catch (error) {
        console.error('Error in useOfflineUsersCount:', error);
        setError('Une erreur est survenue lors du chargement des données');
        toast.error('Erreur de chargement', {
          description: 'Une erreur est survenue lors du chargement'
        });
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
    usersData,
    isLoading,
    error
  };
}
