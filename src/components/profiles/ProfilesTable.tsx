
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Profile } from '@/hooks/useAllProfiles';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export interface ProfilesTableProps {
  profiles: Profile[];
  isLoading: boolean;
  filteredProfiles: Profile[];
}

const ProfilesTable: React.FC<ProfilesTableProps> = ({ 
  profiles, 
  isLoading, 
  filteredProfiles 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-4 border rounded-lg bg-white">
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex space-x-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-white">
        <p className="text-gray-500">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  console.log("Profiles à afficher:", filteredProfiles);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Inscrit le</TableHead>
          <TableHead>Dernière Activité</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProfiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell>
              <div className="font-medium">
                {profile.first_name || ''} {profile.last_name || ''}
                {(!profile.first_name && !profile.last_name) && 'Utilisateur sans nom'}
              </div>
            </TableCell>
            <TableCell>{profile.email || '-'}</TableCell>
            <TableCell>
              <BadgeStatus status={profile.account_status} />
            </TableCell>
            <TableCell>
              {profile.created_at 
                ? format(new Date(profile.created_at), 'dd MMM yyyy', { locale: fr }) 
                : '-'}
            </TableCell>
            <TableCell>
              {profile.last_active_at 
                ? format(new Date(profile.last_active_at), 'dd MMM yyyy', { locale: fr }) 
                : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const BadgeStatus = ({ status }: { status?: string }) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>;
    case 'suspended':
      return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
  }
};

export default ProfilesTable;
