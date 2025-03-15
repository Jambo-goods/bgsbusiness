
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { logAdminAction } from '@/services/adminAuthService';
import { Search, ArrowUp, ArrowDown, ArrowLeftRight, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function WithdrawalManagement() {
  const {
    adminUser
  } = useAdmin();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('requested_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userData, setUserData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    fetchWithdrawals();
  }, [sortField, sortDirection]);
  
  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from('withdrawal_requests').select('*').order(sortField, {
        ascending: sortDirection === 'asc'
      });
      if (error) throw error;
      const withdrawalData = data || [];
      setWithdrawals(withdrawalData);

      // Fetch user data for each withdrawal
      const userIds = Array.from(new Set(withdrawalData.map(w => w.user_id)));
      if (userIds.length > 0) {
        const {
          data: users,
          error: userError
        } = await supabase.from('profiles').select('id, first_name, last_name, email, wallet_balance').in('id', userIds);
        if (userError) throw userError;
        const userMap: Record<string, any> = {};
        users?.forEach(user => {
          userMap[user.id] = user;
        });
        setUserData(userMap);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error("Erreur lors du chargement des demandes de retrait");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const handleApproveWithdrawal = async (withdrawal: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir approuver ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    try {
      // First check if user has enough balance
      const {
        data: userData,
        error: userError
      } = await supabase.from('profiles').select('wallet_balance').eq('id', withdrawal.user_id).single();
      
      if (userError) throw userError;
      
      if (userData.wallet_balance < withdrawal.amount) {
        toast.error("L'utilisateur n'a pas assez de fonds pour ce retrait");
        return;
      }

      // Deduct the amount from the user's wallet balance
      const {
        error: walletError
      } = await supabase.from('profiles').update({
        wallet_balance: userData.wallet_balance - withdrawal.amount
      }).eq('id', withdrawal.user_id);
      
      if (walletError) throw walletError;

      // Update withdrawal status
      const {
        error: withdrawalError
      } = await supabase.from('withdrawal_requests').update({
        status: 'approved',
        admin_id: adminUser.id,
        processed_at: new Date().toISOString()
      }).eq('id', withdrawal.id);
      
      if (withdrawalError) throw withdrawalError;

      // Create wallet transaction record
      const {
        error: transactionError
      } = await supabase.from('wallet_transactions').insert({
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
        type: 'withdrawal',
        status: 'completed',
        description: 'Retrait approuvé'
      });
      
      if (transactionError) throw transactionError;

      // Log admin action
      await logAdminAction(adminUser.id, 'withdrawal_management', `Approbation d'un retrait de ${withdrawal.amount}€`, withdrawal.user_id, undefined, withdrawal.amount);
      
      // Force a recalculation of the user's wallet balance
      try {
        await supabase.functions.invoke('recalculate-wallet-balance', {
          body: { userId: withdrawal.user_id }
        });
      } catch (recalcError) {
        console.error("Error recalculating wallet balance:", recalcError);
        // Continue even if recalculation fails - we've already updated the balance directly
      }
      
      toast.success(`Retrait de ${withdrawal.amount}€ approuvé`, {
        description: "Le solde de l'utilisateur a été mis à jour"
      });

      // Refresh withdrawal list
      fetchWithdrawals();
    } catch (error) {
      console.error("Erreur lors de l'approbation du retrait:", error);
      toast.error("Une erreur s'est produite lors de l'approbation du retrait");
    }
  };
  
  const handleRejectWithdrawal = async (withdrawal: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir rejeter ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    try {
      // Update withdrawal status
      const {
        error: withdrawalError
      } = await supabase.from('withdrawal_requests').update({
        status: 'rejected',
        admin_id: adminUser.id,
        processed_at: new Date().toISOString()
      }).eq('id', withdrawal.id);
      if (withdrawalError) throw withdrawalError;

      // Log admin action
      await logAdminAction(adminUser.id, 'withdrawal_management', `Rejet d'un retrait de ${withdrawal.amount}€`, withdrawal.user_id, undefined, withdrawal.amount);
      toast.success(`Retrait de ${withdrawal.amount}€ rejeté`);

      // Refresh withdrawal list
      fetchWithdrawals();
    } catch (error) {
      console.error("Erreur lors du rejet du retrait:", error);
      toast.error("Une erreur s'est produite lors du rejet du retrait");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </span>;
      default:
        return <span>{status}</span>;
    }
  };
  
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const searchLower = searchTerm.toLowerCase();
    const user = userData[withdrawal.user_id] || {};
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });
  
  return <div>
      <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Demandes de Retrait</h1>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input type="text" placeholder="Rechercher un utilisateur..." className="pl-10 w-full md:w-80" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
          </div> : filteredWithdrawals.length === 0 ? <div className="text-center p-8 text-gray-500">
            Aucune demande de retrait trouvée
          </div> : <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>
                    <button className="flex items-center space-x-1 hover:text-bgs-blue" onClick={() => handleSort('amount')}>
                      <span>Montant</span>
                      {sortField === 'amount' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center space-x-1 hover:text-bgs-blue" onClick={() => handleSort('requested_at')}>
                      <span>Date de demande</span>
                      {sortField === 'requested_at' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                    </button>
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>
                    <button className="flex items-center space-x-1 hover:text-bgs-blue" onClick={() => handleSort('processed_at')}>
                      <span>Date de traitement</span>
                      {sortField === 'processed_at' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map(withdrawal => {
              const user = userData[withdrawal.user_id] || {};
              return <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">Solde: {user.wallet_balance || 0}€</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{withdrawal.amount?.toLocaleString()} €</TableCell>
                      <TableCell>
                        {withdrawal.requested_at ? new Date(withdrawal.requested_at).toLocaleString('fr-FR') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell>
                        {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleString('fr-FR') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {withdrawal.status === 'pending' ? <div className="flex justify-end items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleApproveWithdrawal(withdrawal)} className="text-green-600 hover:text-green-800 hover:bg-green-50">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectWithdrawal(withdrawal)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div> : <span className="text-gray-500 text-sm">Traité</span>}
                      </TableCell>
                    </TableRow>;
            })}
              </TableBody>
            </Table>
          </div>}
      </div>
    </div>;
}
