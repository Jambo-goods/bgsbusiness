
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
  online_status?: 'online' | 'offline';
};

export default function ProfileManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log("ProfileManagement component mounted");
    fetchProfiles();
    const unsubscribe = subscribeToPresence();
    
    return () => {
      console.log("ProfileManagement component unmounted");
      unsubscribe();
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching profiles from Supabase...");
      
      // Fetch all profiles without any filtering
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      // Log the fetched data for debugging
      console.log('Profiles fetched successfully:', data);
      console.log('Total number of profiles:', count);
      console.log('Number of profiles fetched:', data?.length);
      
      // Map all profiles and mark their online status
      const profilesWithStatus: Profile[] = data?.map(profile => ({
        ...profile,
        online_status: onlineUsers.has(profile.id) ? 'online' : 'offline'
      })) || [];
      
      console.log('Processed profiles with status:', profilesWithStatus);
      
      setProfiles(profilesWithStatus);
      setTotalProfiles(count || 0);
      toast.success('Profils chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const subscribeToPresence = () => {
    console.log("Subscribing to presence channel");
    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineUserIds = new Set<string>();
        
        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              onlineUserIds.add(presence.user_id);
            }
          });
        });
        
        console.log('Online users IDs:', Array.from(onlineUserIds));
        setOnlineUsers(onlineUserIds);
        
        // Update only the online status without filtering the profiles
        setProfiles(prevProfiles => 
          prevProfiles.map(profile => ({
            ...profile,
            online_status: onlineUserIds.has(profile.id) ? 'online' : 'offline'
          }))
        );
      })
      .subscribe((status) => {
        console.log('Presence channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to presence channel');
        }
      });

    return () => {
      console.log("Unsubscribing from presence channel");
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = () => {
    console.log("Refreshing profiles...");
    setIsRefreshing(true);
    fetchProfiles();
  };

  const handleAddFundsToAll = async () => {
    try {
      setIsProcessing(true);
      
      const amount = parseInt(amountToAdd, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      const promises = profiles.map(async (profile) => {
        const { error } = await supabase.rpc('increment_wallet_balance', {
          user_id: profile.id,
          increment_amount: amount
        });
        
        if (error) {
          console.error(`Error adding funds to profile ${profile.id}:`, error);
          return false;
        }
        
        await supabase.from('wallet_transactions').insert({
          user_id: profile.id,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: 'Ajout de fonds par administrateur (opération groupée)'
        });
        
        return true;
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      await supabase.from('admin_logs').insert({
        description: `Ajout de ${amount}€ à tous les profils (${successCount}/${profiles.length} réussis)`,
        action_type: 'wallet_management',
        amount: amount
      });
      
      toast.success(`${successCount} profils mis à jour avec succès!`);
      setIsAddFundsDialogOpen(false);
      
      fetchProfiles();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout des fonds');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Gestion des Profils</h1>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {totalProfiles} utilisateurs
          </span>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddFundsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Ajouter des fonds à tous
          </Button>
          <StatusIndicator 
            systemStatus="operational" 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
          />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-md shadow">
        {isLoading ? (
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
        ) : (
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
                    {searchTerm ? "Aucun profil trouvé pour cette recherche" : "Aucun profil disponible"}
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
        )}
      </div>

      <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter des fonds à tous les profils</DialogTitle>
            <DialogDescription>
              Cette action ajoutera le montant spécifié à tous les {totalProfiles} profils dans la base de données.
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
              onClick={handleAddFundsToAll} 
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
