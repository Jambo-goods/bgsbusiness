
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Profile } from '@/components/profiles/types';
import { formatDate } from '@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';

interface ProfileListProps {
  profiles: Profile[];
  isLoading: boolean;
}

export default function ProfileList({ profiles, isLoading }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun profil trouvé
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Solde</TableHead>
            <TableHead>Total Investi</TableHead>
            <TableHead>Projets</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Inactivité</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                  <div className="text-sm text-gray-500">{profile.email}</div>
                  {profile.phone && (
                    <div className="text-xs text-gray-400">{profile.phone}</div>
                  )}
                  {profile.address && (
                    <div className="text-xs text-gray-400">{profile.address}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {profile.wallet_balance !== null ? 
                  `${profile.wallet_balance.toLocaleString()} €` : 
                  "0 €"
                }
              </TableCell>
              <TableCell>
                {profile.investment_total !== null ? 
                  `${profile.investment_total.toLocaleString()} €` : 
                  "0 €"
                }
              </TableCell>
              <TableCell>
                {profile.projects_count || 0}
              </TableCell>
              <TableCell>
                {profile.created_at ? formatDate(profile.created_at) : "-"}
              </TableCell>
              <TableCell>
                {calculateInactivityTime(profile.last_active_at, profile.created_at)}
              </TableCell>
              <TableCell>
                {getStatusBadge(profile.last_active_at, profile.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getStatusBadge(lastActiveAt: string | null, createdAt: string | null) {
  if (!lastActiveAt) return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      Jamais connecté
    </span>
  );
  
  const lastActive = new Date(lastActiveAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Actif
      </span>
    );
  } else if (diffDays < 30) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Inactif récent
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactif
      </span>
    );
  }
}
