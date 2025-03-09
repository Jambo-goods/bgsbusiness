
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, Users, ArrowUpRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWalletBalance } from "@/hooks/useWalletBalance";

interface AdminDashboardStats {
  totalUsers: number;
  totalBalance: number;
  recentTransactions: any[];
  isLoading: boolean;
}

export default function AdminDashboardTab() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalBalance: 0,
    recentTransactions: [],
    isLoading: true
  });
  const { refreshBalance } = useWalletBalance();

  const fetchAdminStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }));
      
      // Fetch total users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('count');
      
      if (usersError) throw usersError;
      
      // Fetch total wallet balance across all users
      const { data: balanceData, error: balanceError } = await supabase
        .from('profiles')
        .select('wallet_balance');
      
      if (balanceError) throw balanceError;
      
      const totalBalance = balanceData.reduce((sum, user) => sum + (user.wallet_balance || 0), 0);
      
      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('id, amount, type, created_at, user_id, profiles(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (transactionsError) throw transactionsError;
      
      setStats({
        totalUsers: usersData[0]?.count || 0,
        totalBalance,
        recentTransactions: transactionsData,
        isLoading: false
      });
      
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      toast.error("Erreur lors de la récupération des statistiques");
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tableau de bord administrateur</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAdminStats}
          disabled={stats.isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${stats.isLoading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Utilisateurs
            </CardTitle>
            <CardDescription>Nombre total d'utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.isLoading ? "..." : stats.totalUsers}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-green-500" />
              Solde Total
            </CardTitle>
            <CardDescription>Fonds disponibles cumulés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.isLoading ? "..." : `${(stats.totalBalance / 100).toLocaleString('fr-FR')} €`}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Transactions récentes</CardTitle>
          <CardDescription>Les 5 dernières transactions du système</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Chargement...</TableCell>
                </TableRow>
              ) : stats.recentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Aucune transaction récente</TableCell>
                </TableRow>
              ) : (
                stats.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.type === 'withdrawal'
                          ? 'bg-orange-100 text-orange-800'
                          : transaction.type === 'investment'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type === 'deposit' 
                          ? 'Dépôt' 
                          : transaction.type === 'withdrawal'
                          ? 'Retrait'
                          : transaction.type === 'investment'
                          ? 'Investissement'
                          : transaction.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={transaction.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}>
                        {transaction.type === 'deposit' ? '+' : '-'}{(transaction.amount / 100).toLocaleString('fr-FR')} €
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
