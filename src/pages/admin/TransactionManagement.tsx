
import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import AdminLayout from "@/layouts/AdminLayout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Search, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/services/adminAuthService";

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");
  
  // Fetch transactions data from Supabase
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch transactions and join with profiles to get user information
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) {
        throw error;
      }
      
      setTransactions(data || []);
      applyFilters(data || [], searchTerm, filter);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erreur lors du chargement des transactions");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filter, sortField, sortDirection]);
  
  // Apply filters to the transactions list
  const applyFilters = (transactionsData: any[], search: string, typeFilter: string) => {
    let filtered = [...transactionsData];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(transaction => 
        (transaction.profiles?.email && transaction.profiles.email.toLowerCase().includes(searchLower)) ||
        (transaction.profiles?.first_name && transaction.profiles.first_name.toLowerCase().includes(searchLower)) ||
        (transaction.profiles?.last_name && transaction.profiles.last_name.toLowerCase().includes(searchLower)) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }
    
    setFilteredTransactions(filtered);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(transactions, value, filter);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: "all" | "deposit" | "withdrawal") => {
    setFilter(newFilter);
    applyFilters(transactions, searchTerm, newFilter);
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Refresh data with new sorting
    fetchTransactions();
  };
  
  // Handle refreshing the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setIsRefreshing(false);
    toast.success("Données actualisées");
  };
  
  // Approve a transaction
  const approveTransaction = async (transaction: any) => {
    try {
      // Start transaction
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', transaction.user_id)
        .single();
      
      if (userError) throw userError;
      
      // Call the increment_wallet_balance function for deposits
      if (transaction.type === 'deposit') {
        const { data, error } = await supabase.rpc(
          'increment_wallet_balance',
          { 
            user_id: transaction.user_id, 
            increment_amount: transaction.amount 
          }
        );
        
        if (error) throw error;
      }
      
      // Update transaction status
      const { error: updateError } = await supabase
        .from('wallet_transactions')
        .update({ 
          status: 'completed',
          receipt_confirmed: true
        })
        .eq('id', transaction.id);
      
      if (updateError) throw updateError;
      
      // Log admin action
      await logAdminAction(
        "admin", // Replace with actual admin ID
        "transaction_approval",
        `Approved ${transaction.type} of ${transaction.amount}€ for user ${transaction.profiles?.email}`,
        transaction.user_id,
        transaction.id,
        transaction.amount
      );
      
      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id ? { ...t, status: 'completed', receipt_confirmed: true } : t
      ));
      setFilteredTransactions(prev => prev.map(t => 
        t.id === transaction.id ? { ...t, status: 'completed', receipt_confirmed: true } : t
      ));
      
      toast.success(`Transaction approuvée avec succès`);
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error("Erreur lors de l'approbation de la transaction");
    }
  };
  
  // Reject a transaction
  const rejectTransaction = async (transaction: any) => {
    try {
      // Update transaction status
      const { error } = await supabase
        .from('wallet_transactions')
        .update({ 
          status: 'rejected',
          receipt_confirmed: false
        })
        .eq('id', transaction.id);
      
      if (error) throw error;
      
      // Log admin action
      await logAdminAction(
        "admin", // Replace with actual admin ID
        "transaction_rejection",
        `Rejected ${transaction.type} of ${transaction.amount}€ for user ${transaction.profiles?.email}`,
        transaction.user_id,
        transaction.id,
        transaction.amount
      );
      
      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === transaction.id ? { ...t, status: 'rejected', receipt_confirmed: false } : t
      ));
      setFilteredTransactions(prev => prev.map(t => 
        t.id === transaction.id ? { ...t, status: 'rejected', receipt_confirmed: false } : t
      ));
      
      toast.success(`Transaction rejetée`);
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast.error("Erreur lors du rejet de la transaction");
    }
  };
  
  // Set up polling
  useEffect(() => {
    fetchTransactions();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchTransactions();
    }, 30000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchTransactions]);
  
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
        <title>Gestion des transactions | BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Gestion des transactions</h1>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Rechercher une transaction..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => handleFilterChange('all')}
                >
                  Toutes
                </Button>
                <Button 
                  variant={filter === 'deposit' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => handleFilterChange('deposit')}
                >
                  Dépôts
                </Button>
                <Button 
                  variant={filter === 'withdrawal' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => handleFilterChange('withdrawal')}
                >
                  Retraits
                </Button>
              </div>
              
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
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune transaction trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                        Date
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                        Type
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                        Montant
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                        Statut
                        <ArrowUpDown className="h-4 w-4 inline-block ml-1" />
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.created_at 
                            ? new Date(transaction.created_at).toLocaleDateString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {transaction.profiles 
                            ? `${transaction.profiles.first_name} ${transaction.profiles.last_name}` 
                            : 'Utilisateur inconnu'}
                        </TableCell>
                        <TableCell>
                          <Badge className={transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'}
                          >
                            {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.amount} €
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description || '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={transaction.status} />
                        </TableCell>
                        <TableCell>
                          {transaction.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => approveTransaction(transaction)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => rejectTransaction(transaction)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </div>
                          )}
                          {(transaction.status === 'completed' || transaction.status === 'rejected') && (
                            <span className="text-gray-500 text-sm">Traité</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
