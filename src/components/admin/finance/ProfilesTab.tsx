
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfilesTabProps {
  isLoading: boolean;
  filteredProfiles: any[];
  searchTerm: string;
}

const ProfilesTab: React.FC<ProfilesTabProps> = ({ 
  isLoading, 
  filteredProfiles, 
  searchTerm 
}) => {
  return (
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
  );
};

export default ProfilesTab;
