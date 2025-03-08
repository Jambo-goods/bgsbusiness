
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
  online_status?: 'online' | 'offline';
};

export type RealTimeStatus = 'connected' | 'connecting' | 'error';

export const useProfilesData = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus>('connected');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfiles();
    const unsubscribe = subscribeToPresence();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Get all profiles without real-time updates
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched profiles:', data);
      
      // Combine the profiles with online status
      const profilesWithStatus: Profile[] = data?.map(profile => ({
        ...profile,
        online_status: onlineUsers.has(profile.id) ? 'online' as const : 'offline' as const
      })) || [];
      
      setProfiles(profilesWithStatus);
      setTotalProfiles(count || 0);
      toast.success('Profils chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des profils');
      setRealTimeStatus('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const subscribeToPresence = () => {
    // Subscribe to presence channel to track online users
    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineUserIds = new Set<string>();
        
        // Extract user IDs from presence state
        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              onlineUserIds.add(presence.user_id);
            }
          });
        });
        
        setOnlineUsers(onlineUserIds);
        
        // Update profiles with the new online status
        setProfiles(prevProfiles => 
          prevProfiles.map(profile => ({
            ...profile,
            online_status: onlineUserIds.has(profile.id) ? 'online' as const : 'offline' as const
          }))
        );
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to presence channel');
        }
      });

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfiles();
  };

  return {
    profiles,
    isLoading,
    isRefreshing,
    realTimeStatus,
    totalProfiles,
    onlineUsers,
    handleRefresh,
    fetchProfiles
  };
};
