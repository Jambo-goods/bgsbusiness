
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
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
import { toast } from 'sonner';
import { 
  Search, 
  RefreshCw, 
  UserCheck, 
  Download, 
  Upload, 
  DollarSign,
  CircleDollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FinanceDashboard() {
  // État général
  const [activeTab, setActiveTab] = useState('overview');
  const { adminUser } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState(false);

  // États des données
  const [profiles, setProfiles] = useState([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // États pour les statistiques financières
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBalance: 0,
    pendingWithdrawalsAmount: 0,
    transactionCount: 0
  });

  useEffect(() => {
    fetchDashboardData();

    // Configurer des abonnements en temps réel
    const profilesChannel = supabase
      .channel('finance_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('Profiles changed, refreshing...');
        fetchDashboardData();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('finance_transactions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        console.log('Transactions changed, refreshing...');
        fetchDashboardData();
      })
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('finance_withdrawals_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, () => {
        console.log('Withdrawal requests changed, refreshing...');
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(withdrawalsChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      
      // Récupérer tous les profils
      const { data: profilesData, error: profilesError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      setProfiles(profilesData || []);
      setTotalProfiles(count || 0);
      
      // Récupérer les demandes de retrait
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });
        
      if (withdrawalsError) throw withdrawalsError;
      
      setWithdrawalRequests(withdrawalsData || []);
      const pendingRequests = withdrawalsData?.filter(w => w.status === 'pending') || [];
      setPendingWithdrawals(pendingRequests.length);
      
      // Récupérer les transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (transactionsError) throw transactionsError;
      
      setTransactions(transactionsData || []);
      
      // Calculer les statistiques
      const deposits = transactionsData?.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0) || 0;
      const withdrawals = transactionsData?.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0) || 0;
      const pendingAmount = pendingRequests.reduce((sum, w) => sum + w.amount, 0);
      const totalBalance = profilesData?.reduce((sum, p) => sum + (p.wallet_balance || 0), 0) || 0;
      
      setStats({
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        totalBalance: totalBalance,
        pendingWithdrawalsAmount: pendingAmount,
        transactionCount: transactionsData?.length || 0
      });
      
      setRealTimeStatus('connected');
      toast.success('Données financières chargées avec succès');
      
    } catch (error) {
      console.error("Erreur lors du chargement des données financières:", error);
      toast.error("Erreur lors du chargement des données financières");
      setRealTimeStatus('error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleAddFundsToAll = async () => {
    try {
      setIsProcessing(true);
      
      // Convertir le montant en nombre
      const amount = parseInt(amountToAdd, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      // Ajouter des fonds à tous les profils
      const promises = profiles.map(async (profile) => {
        // Mettre à jour le solde du portefeuille directement
        const { error } = await supabase.rpc('increment_wallet_balance', {
          user_id: profile.id,
          increment_amount: amount
        });
        
        if (error) {
          console.error(`Erreur lors de l'ajout de fonds au profil ${profile.id}:`, error);
          return false;
        }
        
        // Créer un enregistrement de transaction de portefeuille
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
      
      // Enregistrer l'action d'administration
      await supabase.from('admin_logs').insert({
        description: `Ajout de ${amount}€ à tous les profils (${successCount}/${profiles.length} réussis)`,
        action_type: 'wallet_management',
        admin_id: adminUser?.id,
        amount: amount
      });
      
      toast.success(`${successCount} profils mis à jour avec succès!`);
      setIsAddFundsDialogOpen(false);
      
      // Rafraîchir les données pour afficher les soldes mis à jour
      fetchDashboardData();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout des fonds:", error);
      toast.error(error.message || "Erreur lors de l'ajout des fonds");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawal) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir approuver ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    try {
      // Vérifier d'abord si l'utilisateur a un solde suffisant
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', withdrawal.user_id)
        .single();
        
      if (userError) throw userError;
      
      if (userData.wallet_balance < withdrawal.amount) {
        toast.error("L'utilisateur n'a pas assez de fonds pour ce retrait");
        return;
      }
      
      // Mettre à jour le statut du retrait
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (withdrawalError) throw withdrawalError;
      
      // Créer un enregistrement de transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: withdrawal.user_id,
          amount: withdrawal.amount,
          type: 'withdrawal',
          description: 'Retrait approuvé'
        });
        
      if (transactionError) throw transactionError;
      
      // Mettre à jour le solde du portefeuille de l'utilisateur
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: withdrawal.user_id, increment_amount: -withdrawal.amount }
      );
      
      if (walletError) throw walletError;
      
      // Journaliser l'action d'administrateur
      await supabase.from('admin_logs').insert({
        description: `Approbation d'un retrait de ${withdrawal.amount}€`,
        action_type: 'withdrawal_management',
        admin_id: adminUser.id,
        target_user_id: withdrawal.user_id,
        amount: withdrawal.amount
      });
      
      toast.success(`Retrait de ${withdrawal.amount}€ approuvé`);
      
      // Rafraîchir les données
      fetchDashboardData();
      
    } catch (error) {
      console.error("Erreur lors de l'approbation du retrait:", error);
      toast.error("Une erreur s'est produite lors de l'approbation du retrait");
    }
  };

  const handleRejectWithdrawal = async (withdrawal) => {
    if (!adminUser || !window.confirm(`Êtes-vous sûr de vouloir rejeter ce retrait de ${withdrawal.amount}€ ?`)) {
      return;
    }
    
    try {
      // Mettre à jour le statut du retrait
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          admin_id: adminUser.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawal.id);
        
      if (withdrawalError) throw withdrawalError;
      
      // Journaliser l'action d'administrateur
      await supabase.from('admin_logs').insert({
        description: `Rejet d'un retrait de ${withdrawal.amount}€`,
        action_type: 'withdrawal_management',
        admin_id: adminUser.id,
        target_user_id: withdrawal.user_id,
        amount: withdrawal.amount
      });
      
      toast.success(`Retrait de ${withdrawal.amount}€ rejeté`);
      
      // Rafraîchir les données
      fetchDashboardData();
      
    } catch (error) {
      console.error("Erreur lors du rejet du retrait:", error);
      toast.error("Une erreur s'est produite lors du rejet du retrait");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const formatAmount = (amount: number, type?: string) => {
    if (type) {
      return type === 'deposit' ? `+${amount.toLocaleString()} €` : `-${amount.toLocaleString()} €`;
    }
    return `${amount.toLocaleString()} €`;
  };

  const getAmountClass = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' 
      ? <Upload className="h-4 w-4 text-green-600" /> 
      : <Download className="h-4 w-4 text-red-600" />;
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

  const filteredWithdrawals = withdrawalRequests.filter((withdrawal) => {
    const profile = profiles.find(p => p.id === withdrawal.user_id) || {};
    
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const userEmail = (profile.email || '').toLowerCase();
    
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord Financier</h1>
          <p className="text-slate-500">Gestion des finances et des transactions des utilisateurs</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsAddFundsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign className="mr-1 h-4 w-4" />
            Ajouter des fonds à tous
          </Button>
          <StatusIndicator 
            realTimeStatus={realTimeStatus} 
            isRefreshing={isRefreshing} 
            onRefresh={handleRefresh} 
          />
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total des dépôts</p>
                <p className="text-2xl font-bold text-green-600">{formatAmount(stats.totalDeposits)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total des retraits</p>
                <p className="text-2xl font-bold text-red-600">{formatAmount(stats.totalWithdrawals)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Download className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde total</p>
                <p className="text-2xl font-bold text-bgs-blue">{formatAmount(stats.totalBalance)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CircleDollarSign className="h-5 w-5 text-bgs-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retraits en attente</p>
                <p className="text-2xl font-bold text-amber-600">{pendingWithdrawals} ({formatAmount(stats.pendingWithdrawalsAmount)})</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold text-purple-600">{totalProfiles}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Champ de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profiles">Profils</TabsTrigger>
          <TabsTrigger value="withdrawals">Demandes de retrait</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        {/* Onglet des profils */}
        <TabsContent value="profiles" className="space-y-4">
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
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        {/* Onglet des demandes de retrait */}
        <TabsContent value="withdrawals" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-bgs-blue" />
              </div>
            ) : filteredWithdrawals.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                Aucune demande de retrait trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date de demande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de traitement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.map((withdrawal) => {
                      const profile = profiles.find(p => p.id === withdrawal.user_id) || {};
                      return (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                              <div className="text-sm text-gray-500">{profile.email}</div>
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
                                  onClick={() => handleApproveWithdrawal(withdrawal)}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approuver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectWithdrawal(withdrawal)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeter
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">Traité</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Onglet des transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-bgs-blue" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                Aucune transaction trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const profile = profiles.find(p => p.id === transaction.user_id) || {};
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {getTransactionIcon(transaction.type)}
                              <span className="ml-2">
                                {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                              <div className="text-sm text-gray-500">{profile.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className={`font-medium ${getAmountClass(transaction.type)}`}>
                            {formatAmount(transaction.amount, transaction.type)}
                          </TableCell>
                          <TableCell>
                            {transaction.description || '-'}
                          </TableCell>
                          <TableCell>
                            {transaction.created_at ? new Date(transaction.created_at).toLocaleString('fr-FR') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogue pour ajouter des fonds à tous les profils */}
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
