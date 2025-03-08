
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import UserStatusBadge from './UserStatusBadge';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, User } from 'lucide-react';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_active_at?: string | null;
  wallet_balance?: number;
  online_status: 'online' | 'offline';
};

interface ProfilesTableProps {
  profiles: Profile[];
  filteredProfiles: Profile[];
  isLoading: boolean;
  searchTerm: string;
  showAdminControls?: boolean;
}

export default function ProfilesTable({ 
  profiles,
  filteredProfiles, 
  isLoading, 
  searchTerm,
  showAdminControls = false
}: ProfilesTableProps) {
  const { addFundsToUser, withdrawFundsFromUser } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');

  const handleOpenDialog = (user: Profile, type: 'deposit' | 'withdraw') => {
    setSelectedUser(user);
    setActionType(type);
    setAmount(0);
    setIsDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedUser || amount <= 0) return;
    
    if (actionType === 'deposit') {
      await addFundsToUser(selectedUser.id, amount);
    } else {
      await withdrawFundsFromUser(selectedUser.id, amount);
    }
    
    setIsDialogOpen(false);
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
            <TableHead>Solde</TableHead>
            <TableHead>Statut</TableHead>
            {showAdminControls && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showAdminControls ? 9 : 8} className="text-center py-8 text-gray-500">
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
                  <span className="font-medium">
                    {profile.wallet_balance?.toLocaleString() || '0'} €
                  </span>
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={profile.online_status} />
                </TableCell>
                {showAdminControls && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleOpenDialog(profile, 'deposit')}
                      >
                        <Upload className="h-3 w-3" />
                        <span className="hidden sm:inline">Dépôt</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleOpenDialog(profile, 'withdraw')}
                      >
                        <Download className="h-3 w-3" />
                        <span className="hidden sm:inline">Retrait</span>
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'deposit' ? 'Déposer des fonds' : 'Retirer des fonds'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <div className="bg-gray-200 p-2 rounded-full">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            {actionType === 'withdraw' && selectedUser && (
              <div className="text-sm text-muted-foreground">
                Solde actuel: {selectedUser.wallet_balance?.toLocaleString() || '0'} €
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAction}
              className={actionType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={amount <= 0}
            >
              {actionType === 'deposit' ? 'Déposer' : 'Retirer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
