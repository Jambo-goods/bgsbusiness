
import React from 'react';
import { useProfilesList } from '@/hooks/useProfilesList';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProfilesList() {
  const {
    profiles,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    refreshProfiles
  } = useProfilesList();

  // Fonction pour afficher l'icône de tri
  const getSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }
    return null;
  };

  // Fonction pour formatter la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Liste des profils</h1>
            <Button 
              onClick={refreshProfiles} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un profil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex space-x-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('first_name')}
                    >
                      <div className="flex items-center gap-1">
                        Prénom {getSortIcon('first_name')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('last_name')}
                    >
                      <div className="flex items-center gap-1">
                        Nom {getSortIcon('last_name')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        Email {getSortIcon('email')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center gap-1">
                        Téléphone {getSortIcon('phone')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('wallet_balance')}
                    >
                      <div className="flex items-center gap-1">
                        Portefeuille {getSortIcon('wallet_balance')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('projects_count')}
                    >
                      <div className="flex items-center gap-1">
                        Projets {getSortIcon('projects_count')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('investment_total')}
                    >
                      <div className="flex items-center gap-1">
                        Total investi {getSortIcon('investment_total')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Date d'inscription {getSortIcon('created_at')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer" 
                      onClick={() => handleSort('last_active_at')}
                    >
                      <div className="flex items-center gap-1">
                        Dernière activité {getSortIcon('last_active_at')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        {searchTerm ? "Aucun profil trouvé pour cette recherche" : "Aucun profil disponible"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.first_name || '-'}</TableCell>
                        <TableCell>{profile.last_name || '-'}</TableCell>
                        <TableCell>{profile.email || '-'}</TableCell>
                        <TableCell>{profile.phone || '-'}</TableCell>
                        <TableCell>
                          {profile.wallet_balance !== null ? `${profile.wallet_balance.toLocaleString()} €` : '0 €'}
                        </TableCell>
                        <TableCell>{profile.projects_count || 0}</TableCell>
                        <TableCell>
                          {profile.investment_total !== null ? `${profile.investment_total.toLocaleString()} €` : '0 €'}
                        </TableCell>
                        <TableCell>{formatDate(profile.created_at)}</TableCell>
                        <TableCell>{formatDate(profile.last_active_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="mt-4 text-gray-500 text-sm">
            {profiles.length} profils affichés
          </div>
        </div>
      </div>
    </div>
  );
}
