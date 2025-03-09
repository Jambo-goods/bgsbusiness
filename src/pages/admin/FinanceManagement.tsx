
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Search, RefreshCw, ArrowUp, ArrowDown, 
  UserCheck, Filter, Download, PlusCircle, 
  MinusCircle, Calendar, Wallet
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import SearchBar from '@/components/admin/users/SearchBar';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Types
type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wallet_balance: number | null;
  last_active_at: string | null;
  online_status?: 'online' | 'offline';
};

type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  description: string | null;
};

type FinancialSummary = {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBalance: number;
  averageYield: number;
};

type ChartData = {
  date: string;
  deposits: number;
  withdrawals: number;
};

export default function FinanceManagement() {
  const { adminUser } = useAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('0');
  const [adminPassword, setAdminPassword] = useState('');
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBalance: 0,
    averageYield: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [dateFilter, setDateFilter] = useState('last30days');
  const [typeFilter, setTypeFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  const [profileTransactions, setProfileTransactions] = useState<Transaction[]>([]);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Calculate financial summary
      const totalUsers = profilesData?.length || 0;
      const totalDeposits = transactionsData
        ?.filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalWithdrawals = transactionsData
        ?.filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const totalBalance = profilesData
        ?.reduce((sum, p) => sum + (p.wallet_balance || 0), 0) || 0;
      
      // Fetch investments for yield calculation
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('*');
      
      if (investmentsError) throw investmentsError;
      
      const yields = investmentsData?.map(i => i.yield_rate) || [];
      const averageYield = yields.length > 0 
        ? yields.reduce((sum, y) => sum + Number(y), 0) / yields.length 
        : 0;
      
      // Generate chart data for the last 30 days
      const chartData = generateChartData(transactionsData || []);
      
      setProfiles(profilesData || []);
      setTransactions(transactionsData || []);
      setFinancialSummary({
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        totalBalance,
        averageYield
      });
      setChartData(chartData);
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erreur lors du chargement des données financières');
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (transactions: Transaction[]): ChartData[] => {
    const now = new Date();
    const data: ChartData[] = [];
    
    // Generate data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.created_at).toISOString().split('T')[0];
        return transDate === dateString;
      });
      
      const deposits = dayTransactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const withdrawals = dayTransactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      data.push({
        date: dateString,
        deposits,
        withdrawals
      });
    }
    
    return data;
  };

  const handleProfileClick = async (profile: Profile) => {
    setSelectedProfile(profile);
    setIsAdminVerified(false);
    setIsVerifyingAdmin(true);
    setAdminPassword('');
    
    try {
      // Fetch user transactions
      const { data: userTransactions, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Fetch user investments
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select(`
          id, amount, date, status, yield_rate, duration,
          projects:project_id (name, category, image)
        `)
        .eq('user_id', profile.id);
      
      if (investmentsError) throw investmentsError;
      
      setProfileTransactions(userTransactions || []);
      setUserInvestments(investments || []);
      setIsProfileDialogOpen(true);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Erreur lors du chargement des données utilisateur');
    }
  };

  const verifyAdmin = () => {
    // In a real app, this would make a secure verification
    // For this demo, we'll just check against the stored password
    if (adminPassword === 'admin123') {
      setIsAdminVerified(true);
      setIsVerifyingAdmin(false);
      
      // Log admin action
      if (adminUser) {
        supabase.from('admin_logs').insert({
          admin_id: adminUser.id,
          action_type: 'user_management',
          description: `Accès aux informations sensibles du profil ${selectedProfile?.first_name} ${selectedProfile?.last_name}`,
          target_user_id: selectedProfile?.id
        });
      }
      
      toast.success('Vérification réussie');
    } else {
      toast.error('Mot de passe incorrect');
    }
  };

  const handleAddFunds = async () => {
    if (!selectedProfile || !adminUser) return;
    
    try {
      setIsProcessing(true);
      const amount = parseInt(fundAmount, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      // Update wallet balance
      const { error: updateError } = await supabase.rpc('increment_wallet_balance', {
        user_id: selectedProfile.id,
        increment_amount: amount
      });
      
      if (updateError) throw updateError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: selectedProfile.id,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: 'Ajout de fonds par administrateur'
        });
      
      if (transactionError) throw transactionError;
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_id: adminUser.id,
        action_type: 'wallet_management',
        description: `Ajout de ${amount}€ au compte de ${selectedProfile.first_name} ${selectedProfile.last_name}`,
        target_user_id: selectedProfile.id,
        amount: amount
      });
      
      toast.success(`${amount}€ ajoutés au compte de ${selectedProfile.first_name} ${selectedProfile.last_name}`);
      setIsAddFundsDialogOpen(false);
      
      // Refresh data
      fetchFinancialData();
      
      // Update profile transactions
      const { data: userTransactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', selectedProfile.id)
        .order('created_at', { ascending: false });
      
      setProfileTransactions(userTransactions || []);
      
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de fonds');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedProfile || !adminUser) return;
    
    try {
      setIsProcessing(true);
      const amount = parseInt(withdrawAmount, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      if ((selectedProfile.wallet_balance || 0) < amount) {
        throw new Error('Solde insuffisant pour effectuer ce retrait');
      }
      
      // Update wallet balance
      const { error: updateError } = await supabase.rpc('increment_wallet_balance', {
        user_id: selectedProfile.id,
        increment_amount: -amount
      });
      
      if (updateError) throw updateError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: selectedProfile.id,
          amount: amount,
          type: 'withdrawal',
          status: 'completed',
          description: 'Retrait effectué par administrateur'
        });
      
      if (transactionError) throw transactionError;
      
      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_id: adminUser.id,
        action_type: 'wallet_management',
        description: `Retrait de ${amount}€ du compte de ${selectedProfile.first_name} ${selectedProfile.last_name}`,
        target_user_id: selectedProfile.id,
        amount: amount
      });
      
      toast.success(`${amount}€ retirés du compte de ${selectedProfile.first_name} ${selectedProfile.last_name}`);
      setIsWithdrawDialogOpen(false);
      
      // Refresh data
      fetchFinancialData();
      
      // Update profile transactions
      const { data: userTransactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', selectedProfile.id)
        .order('created_at', { ascending: false });
      
      setProfileTransactions(userTransactions || []);
      
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error(error.message || 'Erreur lors du retrait');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="bg-green-100 text-green-800">
            Complété
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            En attente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Rejeté
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === 'deposit' 
      ? <ArrowUp className="w-4 h-4 text-green-500" /> 
      : <ArrowDown className="w-4 h-4 text-red-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower)) ||
      (profile.id && profile.id.toLowerCase().includes(searchLower))
    );
  });

  const filterTransactions = (transactions: Transaction[]) => {
    return transactions.filter(transaction => {
      let matchesDate = true;
      let matchesType = true;
      let matchesAmount = true;
      
      // Date filter
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        const transDate = new Date(transaction.created_at).toISOString().split('T')[0];
        matchesDate = transDate === today;
      } else if (dateFilter === 'thisWeek') {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        matchesDate = new Date(transaction.created_at) >= weekStart;
      } else if (dateFilter === 'thisMonth') {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesDate = new Date(transaction.created_at) >= monthStart;
      } else if (dateFilter === 'thisYear') {
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);
        matchesDate = new Date(transaction.created_at) >= yearStart;
      }
      
      // Type filter
      if (typeFilter === 'deposit') {
        matchesType = transaction.type === 'deposit';
      } else if (typeFilter === 'withdrawal') {
        matchesType = transaction.type === 'withdrawal';
      }
      
      // Amount filter
      if (amountFilter === 'small') {
        matchesAmount = transaction.amount < 100;
      } else if (amountFilter === 'medium') {
        matchesAmount = transaction.amount >= 100 && transaction.amount < 1000;
      } else if (amountFilter === 'large') {
        matchesAmount = transaction.amount >= 1000;
      }
      
      return matchesDate && matchesType && matchesAmount;
    });
  };

  const exportTransactions = () => {
    const filteredData = filterTransactions(transactions);
    const csv = [
      ['ID', 'Utilisateur', 'Montant', 'Type', 'Status', 'Date', 'Description'].join(','),
      ...filteredData.map(t => [
        t.id,
        t.user_id,
        t.amount,
        t.type,
        t.status,
        t.created_at,
        t.description || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Rapport exporté avec succès');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Finances</h1>
        <Button 
          onClick={fetchFinancialData} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Actualiser
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              comptes enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Solde Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialSummary.totalBalance.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">
              dans les portefeuilles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Dépôts / Retraits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{financialSummary.totalDeposits.toLocaleString()} € / 
              -{financialSummary.totalWithdrawals.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">
              transactions complétées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Rentabilité Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialSummary.averageYield.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              sur tous les investissements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Flux Financiers (30 derniers jours)</CardTitle>
          <CardDescription>
            Visualisation des dépôts et retraits sur la période
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deposits" name="Dépôts" fill="#4ade80" />
                <Bar dataKey="withdrawals" name="Retraits" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
          <TabsTrigger value="accounts">Comptes Utilisateurs</TabsTrigger>
          <TabsTrigger value="transactions">Historique des Transactions</TabsTrigger>
        </TabsList>
        
        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-full max-w-sm">
              <SearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                placeholder="Rechercher un utilisateur..."
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Dernière Activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-mono text-xs">
                          {profile.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell className="font-medium">
                          {profile.wallet_balance?.toLocaleString() || 0} €
                        </TableCell>
                        <TableCell>
                          {profile.last_active_at 
                            ? formatDate(profile.last_active_at) 
                            : 'Jamais'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleProfileClick(profile)}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <div>
                <Label htmlFor="dateFilter" className="mr-2">Date:</Label>
                <select 
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="last30days">30 derniers jours</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="thisWeek">Cette semaine</option>
                  <option value="thisMonth">Ce mois</option>
                  <option value="thisYear">Cette année</option>
                  <option value="all">Toutes les dates</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="typeFilter" className="mr-2">Type:</Label>
                <select 
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="all">Tous les types</option>
                  <option value="deposit">Dépôts</option>
                  <option value="withdrawal">Retraits</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="amountFilter" className="mr-2">Montant:</Label>
                <select 
                  id="amountFilter"
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="all">Tous les montants</option>
                  <option value="small">&lt; 100€</option>
                  <option value="medium">100€ - 1000€</option>
                  <option value="large">&gt; 1000€</option>
                </select>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={exportTransactions}
            >
              <Download size={16} />
              Exporter CSV
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterTransactions(transactions).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Aucune transaction trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filterTransactions(transactions).slice(0, 100).map((transaction) => {
                      const profile = profiles.find(p => p.id === transaction.user_id);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTransactionTypeIcon(transaction.type)}
                              {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.amount.toLocaleString()} €
                          </TableCell>
                          <TableCell>
                            {profile 
                              ? `${profile.first_name} ${profile.last_name}` 
                              : transaction.user_id.substring(0, 8) + '...'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {filterTransactions(transactions).length > 100 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  Affichage des 100 premières transactions sur {filterTransactions(transactions).length}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedProfile?.first_name} {selectedProfile?.last_name}
            </DialogTitle>
            <DialogDescription>
              Détails du compte utilisateur et transactions financières
            </DialogDescription>
          </DialogHeader>
          
          {isVerifyingAdmin && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                  <p>Pour accéder aux informations sensibles de ce compte, veuillez confirmer votre identité.</p>
                </div>
                <Input 
                  type="password" 
                  placeholder="Votre mot de passe administrateur" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                <Button onClick={verifyAdmin}>Vérifier</Button>
              </div>
            </div>
          )}
          
          {isAdminVerified && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Solde du Portefeuille
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-bgs-blue" />
                      {selectedProfile?.wallet_balance?.toLocaleString() || 0} €
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => setIsAddFundsDialogOpen(true)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <PlusCircle size={14} />
                        Ajouter
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsWithdrawDialogOpen(true)}
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <MinusCircle size={14} />
                        Retirer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Identité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">ID:</span>
                      <span className="font-mono text-xs">{selectedProfile?.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Email:</span>
                      <span>{selectedProfile?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Dernière activité:</span>
                      <span>
                        {selectedProfile?.last_active_at 
                          ? formatDate(selectedProfile.last_active_at) 
                          : 'Jamais'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Investissements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userInvestments.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      projets actifs
                    </p>
                    {userInvestments.length > 0 && (
                      <div className="mt-2 text-sm">
                        Rentabilité moyenne: {
                          userInvestments
                            .reduce((sum, inv) => sum + Number(inv.yield_rate), 0) / userInvestments.length
                        }%
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="transactions" className="w-full">
                <TabsList>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="investments">Investissements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactions">
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profileTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              Aucune transaction trouvée
                            </TableCell>
                          </TableRow>
                        ) : (
                          profileTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{formatDate(transaction.created_at)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {getTransactionTypeIcon(transaction.type)}
                                  {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {transaction.amount.toLocaleString()} €
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(transaction.status)}
                              </TableCell>
                              <TableCell>{transaction.description || '-'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="investments">
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Projet</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Rendement</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userInvestments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              Aucun investissement trouvé
                            </TableCell>
                          </TableRow>
                        ) : (
                          userInvestments.map((investment) => (
                            <TableRow key={investment.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {investment.projects?.image && (
                                    <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                                      <img 
                                        src={investment.projects.image} 
                                        alt={investment.projects.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium">{investment.projects?.name || 'Projet inconnu'}</div>
                                    <div className="text-xs text-gray-500">{investment.projects?.category}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {investment.amount.toLocaleString()} €
                              </TableCell>
                              <TableCell>
                                {investment.date ? formatDate(investment.date) : '-'}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {investment.yield_rate}%
                              </TableCell>
                              <TableCell>
                                {investment.duration} mois
                              </TableCell>
                              <TableCell>
                                {investment.status === 'active' ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">
                                    Actif
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                    {investment.status}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsDialogOpen} onOpenChange={setIsAddFundsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter des fonds</DialogTitle>
            <DialogDescription>
              Ajouter des fonds au compte de {selectedProfile?.first_name} {selectedProfile?.last_name}
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
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                min="1"
                className="col-span-3"
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
              onClick={handleAddFunds}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Traitement...' : 'Confirmer l\'ajout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Effectuer un retrait</DialogTitle>
            <DialogDescription>
              Retirer des fonds du compte de {selectedProfile?.first_name} {selectedProfile?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p>Solde actuel: {selectedProfile?.wallet_balance?.toLocaleString() || 0} €</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="withdraw-amount" className="text-right">
                Montant (€)
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                max={selectedProfile?.wallet_balance || 0}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsWithdrawDialogOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={isProcessing || (parseFloat(withdrawAmount) > (selectedProfile?.wallet_balance || 0))}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Traitement...' : 'Confirmer le retrait'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
