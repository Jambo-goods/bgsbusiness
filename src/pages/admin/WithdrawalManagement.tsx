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
  const { adminUser } = useAdmin();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('requested_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();

    // Set up real-time listener for withdrawal requests
    const withdrawalChannel = supabase
      .channel('admin_withdrawal_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, (payload) => {
        console.log('Withdrawal change detected in admin:', payload);
        fetchWithdrawals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(withdrawalChannel);
    };
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

      const userIds = Array.from(new Set(withdrawalData.map(w => w.user_id)));
      if (userIds.length > 0) {
        const {
          data: users,
          error: userError
        } = await supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds);
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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleApproveWithdrawal = async (withdrawal: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir approuver ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    // Prevent multiple submissions
    if (isProcessing) {
      toast.error("Une autre demande est déjà en cours de traitement");
      return;
    }
    
    setIsProcessing(withdrawal.id);
    
    try {
      // Check if withdrawal is already scheduled or approved
      if (withdrawal.status === 'scheduled' || withdrawal.status === 'sheduled') {
        toast.error("Ce retrait est déjà programmé");
        setIsProcessing(null);
        return;
      }
      
      if (withdrawal.status === 'approved') {
        toast.error("Ce retrait est déjà approuvé");
        setIsProcessing(null);
        return;
      }
      
      // Verify user has sufficient balance before scheduling
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', withdrawal.user_id)
        .single();
        
      if (profileError) {
        console.error("Erreur lors de la vérification du solde:", profileError);
        toast.error("Impossible de vérifier le solde de l'utilisateur");
        setIsProcessing(null);
        return;
      }
      
      if (userProfile.wallet_balance < withdrawal.amount) {
        toast.error(`Solde insuffisant. L'utilisateur dispose de ${userProfile.wallet_balance}€ mais souhaite retirer ${withdrawal.amount}€`);
        
        // Mark withdrawal as rejected due to insufficient funds
        const { error: rejectionError } = await supabase
          .from('withdrawal_requests')
          .update({
            status: 'rejected',
            admin_id: adminUser.id,
            processed_at: new Date().toISOString(),
            notes: "Solde insuffisant"
          })
          .eq('id', withdrawal.id);
          
        if (rejectionError) throw rejectionError;
        
        await logAdminAction(
          adminUser.id, 
          'withdrawal_management', 
          `Rejet d'un retrait de ${withdrawal.amount}€ pour solde insuffisant`, 
          withdrawal.user_id, 
          undefined, 
          withdrawal.amount
        );
        
        // Create a notification for the user
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: withdrawal.user_id,
              title: 'Retrait refusé',
              message: `Votre demande de retrait de ${withdrawal.amount}€ a été refusée. Raison: solde insuffisant.`,
              type: 'withdrawal',
              seen: false,
              data: { amount: withdrawal.amount, status: 'rejected', category: 'error', reason: 'Solde insuffisant' }
            });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
        
        fetchWithdrawals();
        setIsProcessing(null);
        return;
      }
      
      // First mark the withdrawal as confirmed
      const { error: confirmationError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'confirmed',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (confirmationError) throw confirmationError;
      
      // Create a notification for the user about confirmation
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: withdrawal.user_id,
            title: 'Demande de retrait confirmée',
            message: `Votre demande de retrait de ${withdrawal.amount}€ a été confirmée et est en cours de traitement.`,
            type: 'withdrawal',
            seen: false,
            data: { amount: withdrawal.amount, status: 'confirmed', category: 'success' }
          });
      } catch (notifError) {
        console.error("Error creating confirmation notification:", notifError);
      }
      
      // Update user wallet balance using secure RPC function
      const { error: walletError } = await supabase.rpc('decrement_wallet_balance', {
        user_id: withdrawal.user_id,
        decrement_amount: withdrawal.amount
      });
      
      if (walletError) {
        console.error("Erreur lors de la mise à jour du solde:", walletError);
        toast.error("Erreur lors de la mise à jour du solde utilisateur");
        setIsProcessing(null);
        return;
      }
      
      // Then schedule the withdrawal
      const { error: schedulingError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'scheduled',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (schedulingError) throw schedulingError;
      
      // Use supabase functions to invoke backend function for transaction creation
      const { error: functionError } = await supabase.functions.invoke('create-wallet-transaction', {
        body: {
          userId: withdrawal.user_id,
          amount: withdrawal.amount,
          type: 'withdrawal',
          description: 'Retrait programmé',
          status: 'completed'
        }
      });
      
      if (functionError) {
        console.warn("Error invoking function, falling back to direct update:", functionError);
        // We won't block the process for this, just log it
      }
      
      // Create balance deduction notification
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: withdrawal.user_id,
            title: 'Montant débité',
            message: `Le montant de ${withdrawal.amount}€ a été débité de votre solde pour votre demande de retrait.`,
            type: 'withdrawal',
            seen: false,
            data: { amount: withdrawal.amount, status: 'balance_deducted', category: 'info' }
          });
      } catch (notifError) {
        console.error("Error creating balance deduction notification:", notifError);
      }
      
      // Then approve it
      const { error: approvalError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (approvalError) throw approvalError;

      await logAdminAction(
        adminUser.id, 
        'withdrawal_management', 
        `Approbation d'un retrait de ${withdrawal.amount}€`, 
        withdrawal.user_id, 
        undefined, 
        withdrawal.amount
      );
      
      // Create a notification for the user
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: withdrawal.user_id,
            title: 'Retrait approuvé',
            message: `Votre retrait de ${withdrawal.amount}€ a été approuvé et sera traité prochainement.`,
            type: 'withdrawal',
            seen: false,
            data: { amount: withdrawal.amount, status: 'approved', category: 'success' }
          });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
      
      toast.success(`Retrait de ${withdrawal.amount}€ approuvé`);
      fetchWithdrawals();
    } catch (error) {
      console.error("Erreur lors de l'approbation du retrait:", error);
      toast.error("Une erreur s'est produite lors de l'approbation du retrait");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleConfirmWithdrawal = async (withdrawal: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir confirmer ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    try {
      // Check if withdrawal is already confirmed or in a later state
      if (withdrawal.status === 'confirmed' || 
          withdrawal.status === 'scheduled' || 
          withdrawal.status === 'sheduled' || 
          withdrawal.status === 'approved' || 
          withdrawal.status === 'paid') {
        toast.error("Ce retrait est déjà confirmé ou dans un état ultérieur");
        return;
      }
      
      // Mark the withdrawal as confirmed
      const { error: confirmationError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'confirmed',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (confirmationError) throw confirmationError;

      await logAdminAction(
        adminUser.id, 
        'withdrawal_management', 
        `Confirmation d'un retrait de ${withdrawal.amount}€`, 
        withdrawal.user_id, 
        undefined, 
        withdrawal.amount
      );
      
      // Create a notification for the user
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: withdrawal.user_id,
            title: 'Demande de retrait confirmée',
            message: `Votre demande de retrait de ${withdrawal.amount}€ a été confirmée et est en cours de traitement.`,
            type: 'withdrawal',
            seen: false,
            data: { amount: withdrawal.amount, status: 'confirmed', category: 'success' }
          });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
      
      toast.success(`Retrait de ${withdrawal.amount}€ confirmé`);
      fetchWithdrawals();
    } catch (error) {
      console.error("Erreur lors de la confirmation du retrait:", error);
      toast.error("Une erreur s'est produite lors de la confirmation du retrait");
    }
  };

  const handleRejectWithdrawal = async (withdrawal: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir rejeter ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    setIsProcessing(withdrawal.id);
    
    try {
      // Check if funds have already been deducted from the user's wallet
      // This happens when the withdrawal was previously scheduled or approved
      const needsRefund = withdrawal.status === 'scheduled' || 
                          withdrawal.status === 'sheduled' || 
                          withdrawal.status === 'approved';
      
      if (needsRefund) {
        // Get the current balance
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', withdrawal.user_id)
          .single();
          
        if (userError) throw userError;
        
        // Update balance using the RPC function for increment instead of direct update
        const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
          user_id: withdrawal.user_id,
          increment_amount: withdrawal.amount
        });
        
        if (walletError) {
          console.error("Error incrementing wallet balance:", walletError);
          
          // Fallback to direct update if RPC fails
          const { error: directUpdateError } = await supabase
            .from('profiles')
            .update({ 
              wallet_balance: userData.wallet_balance + withdrawal.amount 
            })
            .eq('id', withdrawal.user_id);
            
          if (directUpdateError) throw directUpdateError;
        }
        
        // Create a refund transaction
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: withdrawal.user_id,
            amount: withdrawal.amount,
            type: 'deposit',
            description: 'Remboursement de retrait rejeté',
            status: 'completed',
            receipt_confirmed: true
          });
          
        if (transactionError) throw transactionError;
        
        console.log(`Funds returned to user ${withdrawal.user_id}: ${withdrawal.amount}€`);
      }
      
      // Mark the withdrawal as rejected
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (withdrawalError) throw withdrawalError;

      await logAdminAction(
        adminUser.id, 
        'withdrawal_management', 
        `Rejet d'un retrait de ${withdrawal.amount}€`, 
        withdrawal.user_id, 
        undefined, 
        withdrawal.amount
      );
      
      // Create a notification message based on whether a refund was processed
      const notificationMessage = needsRefund
        ? `Votre demande de retrait de ${withdrawal.amount}€ a été rejetée. Le montant a été recrédité sur votre solde.`
        : `Votre demande de retrait de ${withdrawal.amount}€ a été rejetée.`;
      
      // Create a notification for the user
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: withdrawal.user_id,
            title: 'Retrait rejeté',
            message: notificationMessage,
            type: 'withdrawal',
            seen: false,
            data: { 
              amount: withdrawal.amount, 
              status: 'rejected', 
              category: 'error',
              refunded: needsRefund
            }
          });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
      
      toast.success(`Retrait de ${withdrawal.amount}€ rejeté${needsRefund ? ' et montant remboursé' : ''}`);
      fetchWithdrawals();
    } catch (error) {
      console.error("Erreur lors du rejet du retrait:", error);
      toast.error("Une erreur s'est produite lors du rejet du retrait");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleMarkAsPaid = async (withdrawal: any) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir marquer ce retrait de ${withdrawal.amount}€ comme payé ?`)) {
      return;
    }
    
    setIsProcessing(withdrawal.id);
    
    try {
      // Check if withdrawal is already paid
      if (withdrawal.status === 'paid') {
        toast.error("Ce retrait est déjà marqué comme payé");
        setIsProcessing(null);
        return;
      }
      
      // Check if withdrawal is in an appropriate status to be marked as paid
      if (withdrawal.status !== 'approved' && withdrawal.status !== 'scheduled' && withdrawal.status !== 'sheduled' && withdrawal.status !== 'completed') {
        toast.error("Ce retrait doit d'abord être approuvé avant d'être marqué comme payé");
        setIsProcessing(null);
        return;
      }
      
      // Mark the withdrawal as paid
      const { error: paidError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'paid',
          admin_id: adminUser.id,
          processed_at: withdrawal.processed_at || new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (paidError) throw paidError;

      await logAdminAction(
        adminUser.id, 
        'withdrawal_management', 
        `Marquer un retrait de ${withdrawal.amount}€ comme payé`, 
        withdrawal.user_id, 
        undefined, 
        withdrawal.amount
      );
      
      // Use edge function to create notification and transaction
      const { error: functionError } = await supabase.functions.invoke('update-withdrawal-status', {
        body: {
          withdrawalId: withdrawal.id,
          userId: withdrawal.user_id,
          amount: withdrawal.amount,
          status: 'paid'
        }
      });
      
      if (functionError) {
        console.warn("Error invoking function, falling back to direct updates:", functionError);
        
        // Create a notification for the user
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: withdrawal.user_id,
              title: 'Retrait payé',
              message: `Votre retrait de ${withdrawal.amount}€ a été payé et le montant a été transféré sur votre compte bancaire.`,
              type: 'withdrawal',
              seen: false,
              data: { 
                amount: withdrawal.amount, 
                status: 'paid', 
                category: 'success',
                timestamp: new Date().toISOString()
              }
            });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
      
      toast.success(`Retrait de ${withdrawal.amount}€ marqué comme payé`);
      fetchWithdrawals();
    } catch (error) {
      console.error("Erreur lors du marquage du retrait comme payé:", error);
      toast.error("Une erreur s'est produite lors du marquage du retrait comme payé");
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>;
      case 'scheduled':
      case 'sheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ArrowLeftRight className="h-3 w-3 mr-1" />
            Programmé
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
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Payé
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
                        {withdrawal.status === 'pending' ? (
                          <div className="flex justify-end items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleConfirmWithdrawal(withdrawal)} 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              disabled={isProcessing === withdrawal.id}
                            >
                              {isProcessing === withdrawal.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Clock className="h-4 w-4 mr-1" />
                              )}
                              Confirmer
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApproveWithdrawal(withdrawal)} 
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              disabled={isProcessing === withdrawal.id}
                            >
                              {isProcessing === withdrawal.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approuver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRejectWithdrawal(withdrawal)} 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              disabled={isProcessing === withdrawal.id}
                            >
                              {isProcessing === withdrawal.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Rejeter
                            </Button>
                          </div>
                        ) : withdrawal.status === 'confirmed' ? (
                          <div className="flex justify-end items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleApproveWithdrawal(withdrawal)} 
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              disabled={isProcessing === withdrawal.id}
                            >
                              {isProcessing === withdrawal.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approuver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRejectWithdrawal(withdrawal)} 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              disabled={isProcessing === withdrawal.id}
                            >
                              {isProcessing === withdrawal.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Rejeter
                            </Button>
                          </div>
                        ) : withdrawal.status === 'approved' || withdrawal.status === 'scheduled' || withdrawal.status === 'sheduled' || withdrawal.status === 'completed' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleMarkAsPaid(withdrawal)} 
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            disabled={isProcessing === withdrawal.id}
                          >
                            {isProcessing === withdrawal.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Marquer comme payé
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-sm">Traité</span>
                        )}
                      </TableCell>
                    </TableRow>;
            })}
              </TableBody>
            </Table>
          </div>}
      </div>
    </div>;
}
