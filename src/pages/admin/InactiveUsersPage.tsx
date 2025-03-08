
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SearchBar from '@/components/admin/users/SearchBar';
import ProfilesTable from '@/components/admin/users/ProfilesTable';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_active_at?: string | null;
  online_status: 'online' | 'offline';
};

export default function InactiveUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfiles();
    const unsubscribe = subscribeToPresence();
    
    return () => {
      unsubscribe();
    };
  }, []);

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

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Get all profiles - do not filter by online status
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Add online_status property to all profiles
      const profilesWithStatus: Profile[] = data?.map(profile => ({
        ...profile,
        online_status: onlineUsers.has(profile.id) ? 'online' as const : 'offline' as const
      })) || [];
      
      setProfiles(profilesWithStatus);
      setTotalProfiles(profilesWithStatus.length);
      toast.success('Utilisateurs chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {totalProfiles} utilisateurs
          </span>
        </div>
      </div>

      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        placeholder="Rechercher par nom, prénom ou email..."
      />

      <div className="bg-white rounded-md shadow">
        <ProfilesTable
          profiles={profiles}
          filteredProfiles={filteredProfiles}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}
