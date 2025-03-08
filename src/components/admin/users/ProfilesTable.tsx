
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import UserStatusBadge from './UserStatusBadge';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';

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

interface ProfilesTableProps {
  profiles: Profile[];
  filteredProfiles: Profile[];
  isLoading: boolean;
  searchTerm: string;
}

export default function ProfilesTable({ 
  profiles,
  filteredProfiles, 
  isLoading, 
  searchTerm 
}: ProfilesTableProps) {
  if (isLoading) {
    return (
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
    );
  }

  return (
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
              <TableCell>
                {calculateInactivityTime(profile.last_active_at, profile.created_at)}
              </TableCell>
              <TableCell>
                <UserStatusBadge status={profile.online_status} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
