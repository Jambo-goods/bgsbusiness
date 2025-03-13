
import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, CreditCard, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    newUsersToday: 0,
    pendingTransactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch dashboard data from Supabase
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // Fetch total wallet balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('profiles')
        .select('wallet_balance');
      
      if (balanceError) throw balanceError;
      
      const totalBalance = balanceData.reduce((sum, user) => sum + (user.wallet_balance || 0), 0);
      
      // Fetch total deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'deposit')
        .eq('status', 'completed');
      
      if (depositsError) throw depositsError;
      
      const totalDeposits = depositsData.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Fetch total withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'withdrawal')
        .eq('status', 'completed');
      
      if (withdrawalsError) throw withdrawalsError;
      
      const totalWithdrawals = withdrawalsData.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Calculate new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: newUsersToday, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      if (newUsersError) throw newUsersError;
      
      // Count pending transactions
      const { count: pendingTransactions, error: pendingError } = await supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Fetch recent transactions
      const { data: recentTxData, error: recentTxError } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentTxError) throw recentTxError;
      
      // Fetch recent users
      const { data: recentUsersData, error: recentUsersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (recentUsersError) throw recentUsersError;
      
      // Update state with fetched data
      setStats({
        totalUsers: totalUsers || 0,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
        newUsersToday: newUsersToday || 0,
        pendingTransactions: pendingTransactions || 0
      });
      
      setRecentTransactions(recentTxData || []);
      setRecentUsers(recentUsersData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erreur lors du chargement des données du tableau de bord");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Handle refreshing the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };
  
  // Set up polling
  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchDashboardData]);
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Tableau de bord administrateur | BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Tableau de bord administrateur</h1>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Utilisateurs totaux</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                      <p className="text-xs text-green-600 mt-1">+{stats.newUsersToday} aujourd'hui</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Balance totale</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalBalance} €</h3>
                      <p className="text-xs text-blue-600 mt-1">Tous les utilisateurs</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Transactions en attente</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.pendingTransactions}</h3>
                      <p className="text-xs text-amber-600 mt-1">Nécessite vérification</p>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total des dépôts</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalDeposits} €</h3>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total des retraits</p>
                      <h3 className="text-2xl font-bold mt-1">{stats.totalWithdrawals} €</h3>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transactions récentes</CardTitle>
                    <CardDescription>Les 5 dernières transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentTransactions.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Aucune transaction récente</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>
                                {tx.created_at 
                                  ? new Date(tx.created_at).toLocaleDateString('fr-FR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    }) 
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {tx.profiles 
                                  ? tx.profiles.first_name 
                                  : 'Utilisateur inconnu'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {tx.amount} €
                              </TableCell>
                              <TableCell>
                                <Badge className={tx.type === 'deposit' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'}
                                >
                                  {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={tx.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="mt-4 text-right">
                      <Link to="/admin/transactions">
                        <Button variant="link" size="sm">Voir toutes les transactions</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nouveaux utilisateurs</CardTitle>
                    <CardDescription>Les 5 derniers utilisateurs inscrits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentUsers.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Aucun utilisateur récent</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Solde</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                {user.created_at 
                                  ? new Date(user.created_at).toLocaleDateString('fr-FR') 
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {user.first_name} {user.last_name}
                              </TableCell>
                              <TableCell>
                                {user.email}
                              </TableCell>
                              <TableCell>
                                {user.wallet_balance || 0} €
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="mt-4 text-right">
                      <Link to="/admin/users">
                        <Button variant="link" size="sm">Voir tous les utilisateurs</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
