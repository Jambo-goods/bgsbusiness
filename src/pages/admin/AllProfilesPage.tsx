
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/components/admin/profiles/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AllProfilesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = profiles.filter(profile => 
        (profile.first_name && profile.first_name.toLowerCase().includes(term)) ||
        (profile.last_name && profile.last_name.toLowerCase().includes(term)) ||
        (profile.email && profile.email.toLowerCase().includes(term))
      );
      setFilteredProfiles(filtered);
    }
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched profiles:", data);
      setProfiles(data as Profile[]);
      setFilteredProfiles(data as Profile[]);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erreur lors du chargement des profils");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfiles();
    setIsRefreshing(false);
    toast.success("Profils actualisés");
  };

  const handleViewProfile = (id: string) => {
    navigate(`/admin/user-profile/${id}`);
  };

  return (
    <div className="space-y-6 p-6">
      <AdminHeader 
        title="Tous les profils utilisateurs" 
        description={`${profiles.length} profils utilisateurs au total`} 
      />
      
      <div className="flex justify-between items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4"
          />
        </div>
        
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Aucun profil ne correspond à votre recherche" : "Aucun profil trouvé"}
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
                          {profile.created_at 
                            ? new Date(profile.created_at).toLocaleDateString('fr-FR') 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {profile.wallet_balance !== undefined 
                            ? `${profile.wallet_balance} €` 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewProfile(profile.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Voir</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
