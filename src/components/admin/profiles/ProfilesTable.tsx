
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Wallet, Plus, Minus, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";
import UserStatusBadge from '@/components/admin/users/UserStatusBadge';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';
import { Profile } from './types';
import AddFundsDialog from './funds/AddFundsDialog';
import { supabase } from '@/integrations/supabase/client';

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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddFunds = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsAddFundsOpen(true);
    setAmount('');
  };

  const handleFundsSuccess = async () => {
    setIsAddFundsOpen(false);
    
    // Refresh the profile data after funds are added/removed
    try {
      if (selectedProfile) {
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', selectedProfile.id)
          .single();
          
        if (error) throw error;
        
        // Update the selected profile in the state
        if (data) {
          toast.success("Opération réussie", {
            description: "Le solde du portefeuille a été mis à jour"
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error);
      toast.error("Erreur lors de la mise à jour", {
        description: "Veuillez rafraîchir la page pour voir les changements"
      });
    }
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
      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Solde</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="max-w-[200px] truncate">{profile.email || '-'}</TableCell>
                    <TableCell>{profile.first_name || '-'}</TableCell>
                    <TableCell>{profile.last_name || '-'}</TableCell>
                    <TableCell>
                      {profile.wallet_balance !== undefined && profile.wallet_balance !== null 
                        ? `${profile.wallet_balance} €` 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>
                      {profile.last_active_at ? new Date(profile.last_active_at).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell className="text-right p-2">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddFunds(profile)}
                          title="Gérer les fonds"
                        >
                          <Wallet className="h-4 w-4 mr-1" />
                          Fonds
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
        </div>
      </div>

      {selectedProfile && (
        <AddFundsDialog
          isOpen={isAddFundsOpen}
          onOpenChange={setIsAddFundsOpen}
          userId={selectedProfile.id}
          userName={`${selectedProfile.first_name || ''} ${selectedProfile.last_name || ''}`}
          currentBalance={selectedProfile.wallet_balance || 0}
          onSuccess={handleFundsSuccess}
          onClose={() => setIsAddFundsOpen(false)}
        />
      )}
    </>
  );
}
