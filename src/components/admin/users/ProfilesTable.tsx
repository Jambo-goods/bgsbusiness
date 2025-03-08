
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
import { UserProfile } from '@/hooks/admin/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ProfilesTableProps {
  profiles: UserProfile[];
  filteredProfiles: UserProfile[];
  isLoading: boolean;
  searchTerm: string;
  onAddFunds?: (userId: string) => void;
}

export default function ProfilesTable({ 
  profiles,
  filteredProfiles, 
  isLoading, 
  searchTerm,
  onAddFunds
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
          <TableHead>Solde portefeuille</TableHead>
          <TableHead>Compte</TableHead>
          <TableHead>Connexion</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProfiles.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
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
                {profile.wallet_balance !== undefined && profile.wallet_balance !== null 
                  ? `${profile.wallet_balance.toLocaleString()} €` 
                  : '0 €'}
              </TableCell>
              <TableCell>
                <UserStatusBadge status={profile.account_status || 'inactive'} />
              </TableCell>
              <TableCell>
                <UserStatusBadge status={profile.online_status || 'offline'} />
              </TableCell>
              <TableCell>
                {onAddFunds && (
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => onAddFunds(profile.id)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Fonds</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
