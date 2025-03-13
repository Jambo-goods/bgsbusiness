
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';
import { Profile } from '@/components/admin/profiles/types';

interface ProfilesTableProps {
  profiles: Profile[];
  isLoading: boolean;
  filteredProfiles: Profile[];
}

const ProfilesTable: React.FC<ProfilesTableProps> = ({ 
  profiles, 
  isLoading, 
  filteredProfiles 
}) => {
  return (
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
          <TableHead>Statut</TableHead>
          <TableHead>Date d'inscription</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProfiles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
              {profiles.length > 0 ? "Aucun profil trouvé pour cette recherche" : "Aucun profil disponible"}
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
                <Badge 
                  variant={profile.online_status === 'online' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {profile.online_status === 'online' ? (
                    <>
                      <UserCheck className="h-3 w-3" />
                      <span>En ligne</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-3 w-3" />
                      <span>Hors ligne</span>
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ProfilesTable;
