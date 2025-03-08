import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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

  const calculateInactivityTime = (profile: Profile) => {
    // If the user has a last_active_at timestamp, use it
    // Otherwise, use created_at as the last activity
    const lastActive = profile.last_active_at || profile.created_at;
    
    if (!lastActive) return "Inconnue";
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''} ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Durée d'inactivité</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? "Aucun utilisateur trouvé pour cette recherche" : "Aucun utilisateur dans la base de données"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.first_name || '-'}</TableCell>
                    <TableCell>{profile.last_name || '-'}</TableCell>
                    <TableCell>{profile.email || '-'}</TableCell>
                    <TableCell>{profile.phone || '-'}</TableCell>
                    <TableCell>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>{calculateInactivityTime(profile)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={`flex items-center gap-1 ${
                          profile.online_status === 'online' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <UserX className="h-3 w-3" />
                        <span>{profile.online_status === 'online' ? 'En ligne' : 'Hors ligne'}</span>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
