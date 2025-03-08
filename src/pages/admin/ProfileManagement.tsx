
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminUsers } from '@/contexts/AdminUsersContext';
import { toast } from 'sonner';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ProfilesTable from '@/components/admin/users/ProfilesTable';

export default function ProfileManagement() {
  const { 
    profiles, 
    filteredProfiles, 
    isLoading, 
    searchTerm, 
    setSearchTerm,
    refreshProfiles,
    addFundsToUser
  } = useAdminUsers();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState<string>("100");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfiles();
    setIsRefreshing(false);
  };

  const handleAddFunds = (userId: string) => {
    setSelectedUserId(userId);
    setIsAddFundsDialogOpen(true);
  };

  const handleConfirmAddFunds = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsProcessing(true);
      const amount = parseInt(amountToAdd, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      const success = await addFundsToUser(selectedUserId, amount);
      
      if (success) {
        setIsAddFundsDialogOpen(false);
        setAmountToAdd("100");
      }
    } catch (error) {
      console.error('Error processing funds:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mettre à jour le titre du document
  useEffect(() => {
    document.title = 'Gestion des utilisateurs | Admin';
  }, []);

  const selectedUser = selectedUserId ? profiles.find(p => p.id === selectedUserId) : null;

  return (
    <div className="container px-4 py-6 mx-auto">
      <Helmet>
        <title>Gestion des profils | Admin</title>
      </Helmet>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bgs-blue">Gestion des Profils</h1>
          <p className="text-gray-600 mt-1">Gérer et surveiller les profils utilisateurs</p>
        </div>
        
        <StatusIndicator
          systemStatus="operational"
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </header>
      
      <main className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ProfilesTable 
            profiles={profiles}
            filteredProfiles={filteredProfiles}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onAddFunds={handleAddFunds}
          />
        </div>
      </main>

      {/* Dialog for adding funds to a user */}
      <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter des fonds au portefeuille</DialogTitle>
            <DialogDescription>
              {selectedUser ? (
                <>Ajouter des fonds au portefeuille de {selectedUser.first_name} {selectedUser.last_name}</>
              ) : (
                <>Ajouter des fonds au portefeuille de l'utilisateur</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant (€)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddFundsDialogOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmAddFunds} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Traitement en cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
