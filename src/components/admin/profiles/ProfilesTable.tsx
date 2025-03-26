
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Wallet, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import UserStatusBadge from '@/components/admin/users/UserStatusBadge';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';
import { Profile } from './types';
import AddFundsDialog from './funds/AddFundsDialog';

interface ProfilesTableProps {
  profiles: Profile[];
  filteredProfiles: Profile[];
  isLoading: boolean;
}

export default function ProfilesTable({ 
  profiles, 
  filteredProfiles, 
  isLoading
}: ProfilesTableProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAddFunds = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsAddFundsOpen(true);
    setAmount('');
  };

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
    <>
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
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Aucun utilisateur trouvé
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
                    : '-'}
                </TableCell>
                <TableCell>
                  <UserStatusBadge 
                    status={profile.last_active_at && new Date(profile.last_active_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 
                      ? 'active' 
                      : 'inactive'} 
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddFunds(profile)}
                      title="Ajouter des fonds"
                    >
                      <Wallet className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {/* View profile details would go here */}}
                      title="Voir le profil"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedProfile && (
        <AddFundsDialog
          isOpen={isAddFundsOpen}
          onOpenChange={setIsAddFundsOpen}
          userId={selectedProfile.id}
          userName={`${selectedProfile.first_name || ''} ${selectedProfile.last_name || ''}`}
          currentBalance={selectedProfile.wallet_balance || 0}
          onSuccess={() => setIsAddFundsOpen(false)}
          onClose={() => setIsAddFundsOpen(false)}
        />
      )}
    </>
  );
}
