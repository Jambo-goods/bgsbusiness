
import { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  projects_count: number | null;
  created_at: string | null;
}

export default function ProfileManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    async function fetchProfiles() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setProfiles(data || []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast.error('Erreur lors du chargement des profils');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfiles();
    
    // Set up real-time listener for profile changes
    const profilesChannel = supabase
      .channel('admin_profiles_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles' 
        }, 
        (payload) => {
          console.log('Profile change detected:', payload);
          // Refresh the profiles list when any change is detected
          fetchProfiles();
        }
      )
      .subscribe();
      
    // Clean up the subscription when component unmounts
    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, []);
  
  const filteredProfiles = profiles.filter(profile => {
    const searchValue = searchTerm.toLowerCase();
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const email = (profile.email || '').toLowerCase();
    
    return fullName.includes(searchValue) || email.includes(searchValue);
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des profils utilisateurs</h1>
        <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
          Données en temps réel
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun profil trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead className="text-right">Solde portefeuille</TableHead>
                      <TableHead className="text-right">Total investissements</TableHead>
                      <TableHead className="text-right">Nombre de projets</TableHead>
                      <TableHead>Date d'inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.phone || '-'}</TableCell>
                        <TableCell className="text-right">
                          {profile.wallet_balance !== null ? `${profile.wallet_balance}€` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {profile.investment_total !== null ? `${profile.investment_total}€` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {profile.projects_count || 0}
                        </TableCell>
                        <TableCell>
                          {profile.created_at
                            ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
