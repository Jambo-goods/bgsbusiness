
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
import { Wallet, Eye, Pencil } from 'lucide-react';
import { toast } from "sonner";
import { Profile } from './types';
import AddFundsDialog from './funds/AddFundsDialog';
import EditProfileDialog from './EditProfileDialog';
import { supabase } from '@/integrations/supabase/client';

interface ProfilesTableProps {
  profiles: Profile[];
  isLoading: boolean;
}

export default function ProfilesTable({ 
  profiles, 
  isLoading 
}: ProfilesTableProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  console.log('ProfilesTable - Props received:', { 
    profilesCount: profiles.length, 
    isLoading
  });
  
  useEffect(() => {
    if (profiles.length > 0) {
      console.log('ProfilesTable - First profile:', profiles[0]);
    }
  }, [profiles]);

  const handleAddFunds = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsAddFundsOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsEditProfileOpen(true);
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
      <div className="w-full p-8 flex justify-center">
        <p>Chargement des profils...</p>
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
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
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
                          onClick={() => handleEditProfile(profile)}
                          title="Modifier le profil"
                        >
                          <Pencil className="h-4 w-4" />
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
        <>
          <AddFundsDialog
            isOpen={isAddFundsOpen}
            onOpenChange={setIsAddFundsOpen}
            userId={selectedProfile.id}
            userName={`${selectedProfile.first_name || ''} ${selectedProfile.last_name || ''}`}
            currentBalance={selectedProfile.wallet_balance || 0}
            onSuccess={handleFundsSuccess}
            onClose={() => setIsAddFundsOpen(false)}
          />
          
          <EditProfileDialog
            isOpen={isEditProfileOpen}
            onOpenChange={setIsEditProfileOpen}
            profile={selectedProfile}
            onSuccess={() => {
              // Refresh profile data
              window.location.reload();
            }}
          />
        </>
      )}
    </>
  );
}
