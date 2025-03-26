
import React, { useState, useEffect } from 'react';
import useProfiles from '@/hooks/useProfiles';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw, Search, Pencil } from 'lucide-react';

const ProfilesPage: React.FC = () => {
  const { profiles, isLoading, error, fetchProfiles } = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);

  useEffect(() => {
    // Filter profiles based on search term
    const filtered = profiles.filter(profile => 
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProfiles(filtered);
  }, [profiles, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  const handleEdit = (profileId: string) => {
    // This function will be implemented later for editing profiles
    console.log('Edit profile:', profileId);
    // You could navigate to an edit page or open a modal here
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profils utilisateurs</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button onClick={refreshProfiles} variant="outline" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableCaption>Liste des profils utilisateurs ({filteredProfiles.length} utilisateurs)</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Solde</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead>Dernière activité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Loader2 className="animate-spin h-6 w-6 mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  {searchTerm ? "Aucun résultat pour cette recherche" : "Aucun profil trouvé"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.email || 'N/A'}</TableCell>
                  <TableCell>{profile.first_name || 'N/A'}</TableCell>
                  <TableCell>{profile.last_name || 'N/A'}</TableCell>
                  <TableCell>{profile.wallet_balance ? `${profile.wallet_balance} €` : '0 €'}</TableCell>
                  <TableCell>{profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
                  <TableCell>{profile.last_active_at ? new Date(profile.last_active_at).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(profile.id)}
                      title="Modifier l'utilisateur"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProfilesPage;
