
import React, { useState, useEffect } from 'react';
import { useAllUsersData } from '@/hooks/admin/useAllUsersData';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Eye, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AdminHeader from '@/components/admin/AdminHeader';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProfilesPage() {
  const { users, loading, refreshUsers } = useAllUsersData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter profiles based on search term
  const filteredProfiles = users.filter(profile => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const email = (profile.email || '').toLowerCase();
    
    return name.includes(term) || email.includes(term);
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUsers();
      toast.success("Profils actualisés avec succès");
    } catch (error) {
      console.error("Error refreshing profiles:", error);
      toast.error("Erreur lors de l'actualisation des profils");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Load profiles on component mount
  useEffect(() => {
    refreshUsers();
  }, []);
  
  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Gestion des profils" 
        description={`${users.length} profils utilisateurs au total`}
      />
      
      <div className="flex items-center justify-between mb-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Rechercher par nom, email..." 
            className="pl-10 w-full" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        
        {/* Refresh button */}
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isRefreshing || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Chargement des profils...</p>
            </div>
          ) : users.length === 0 ? (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Aucun profil trouvé</AlertTitle>
              <AlertDescription>
                Aucun utilisateur n'a été trouvé dans la base de données.
              </AlertDescription>
            </Alert>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun utilisateur ne correspond à votre recherche
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
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
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="max-w-[200px] truncate">{profile.email || '-'}</TableCell>
                      <TableCell>{profile.first_name || '-'}</TableCell>
                      <TableCell>{profile.last_name || '-'}</TableCell>
                      <TableCell>
                        {profile.wallet_balance !== undefined 
                          ? `${profile.wallet_balance} €` 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell>
                        {profile.last_active_at ? new Date(profile.last_active_at).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell className="text-right p-2">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Gérer les fonds"
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Voir le profil"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
