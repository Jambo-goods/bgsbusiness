
import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
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
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
  // Removing online_status since we're disabling real-time presence tracking
};

export default function AllProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalProfiles, setTotalProfiles] = useState(0);
  // Removing onlineUsers state since we're disabling real-time presence tracking

  useEffect(() => {
    console.log("AllProfiles component mounted");
    fetchProfiles();
    
    return () => {
      console.log("AllProfiles component unmounted");
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all profiles...");
      
      // Fetch all profiles from the database without filtering
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Profiles fetched successfully:', data);
      console.log('Total profiles count:', count);
      console.log('Number of profiles fetched:', data?.length);
      
      setProfiles(data || []);
      setTotalProfiles(count || 0);
      toast.success('Profils chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log("Manual refresh requested");
    setIsRefreshing(true);
    fetchProfiles();
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
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Tous les Profils | BGS Invest</title>
        <meta name="description" content="Liste complète de tous les profils enregistrés" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Liste Complète des Profils</h1>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
              {totalProfiles} utilisateurs
            </span>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="flex items-center gap-2" 
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </Button>
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
                  <TableHead>Portefeuille</TableHead>
                  <TableHead>Projets</TableHead>
                  <TableHead>Total investi</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm ? "Aucun profil trouvé pour cette recherche" : "Aucun profil disponible"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.first_name || '-'}</TableCell>
                      <TableCell>{profile.last_name || '-'}</TableCell>
                      <TableCell>{profile.email || '-'}</TableCell>
                      <TableCell>{profile.phone || '-'}</TableCell>
                      <TableCell>{profile.wallet_balance ? `${profile.wallet_balance} €` : '0 €'}</TableCell>
                      <TableCell>{profile.projects_count || 0}</TableCell>
                      <TableCell>{profile.investment_total ? `${profile.investment_total} €` : '0 €'}</TableCell>
                      <TableCell>
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
