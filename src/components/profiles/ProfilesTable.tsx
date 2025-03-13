
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Profile } from '@/hooks/useAllProfiles';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inscrit le
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernière Activité
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProfiles.map((profile) => (
            <tr key={profile.id}>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{profile.email}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <BadgeStatus status={profile.account_status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.created_at 
                  ? format(new Date(profile.created_at), 'dd MMM yyyy', { locale: fr }) 
                  : '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {profile.last_active_at 
                  ? format(new Date(profile.last_active_at), 'dd MMM yyyy', { locale: fr }) 
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
