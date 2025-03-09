
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  Search, ArrowUp, ArrowDown, Calendar,
  Loader2, ArrowUpRight, ArrowDownLeft, Euro, Download, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function WalletManagement() {
  const { adminUser } = useAdmin();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    balance: 0,
    transactionCount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, [sortField, sortDirection, dateRange]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      // Apply date filters if set
      if (dateRange.from) {
        query = query.gte('created_at', dateRange.from);
      }
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setDate(toDate.getDate() + 1); // Include the end date
        query = query.lt('created_at', toDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const transactionData = data || [];
      setTransactions(transactionData);
      
      // Calculate statistics
      const deposits = transactionData.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
      const withdrawals = transactionData.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalDeposits: deposits,
        totalWithdrawals: withdrawals,
        balance: deposits - withdrawals,
        transactionCount: transactionData.length
      });
      
      // Fetch user data for each transaction
      const userIds = Array.from(new Set(transactionData.map(t => t.user_id)));
      
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
          
        if (userError) throw userError;
        
        const userMap: Record<string, any> = {};
        users?.forEach(user => {
          userMap[user.id] = user;
        });
        
        setUserData(userMap);
      }
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Erreur lors du chargement des transactions");
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

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' 
      ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> 
      : <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const getAmountClass = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const formatAmount = (amount: number, type: string) => {
    return type === 'deposit' ? `+${amount.toLocaleString()} €` : `-${amount.toLocaleString()} €`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const user = userData[transaction.user_id] || {};
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Portefeuilles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total des dépôts</p>
              <p className="text-xl font-bold text-green-600">{stats.totalDeposits.toLocaleString()} €</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total des retraits</p>
              <p className="text-xl font-bold text-red-600">{stats.totalWithdrawals.toLocaleString()} €</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Download className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-xl font-bold text-bgs-blue">{stats.balance.toLocaleString()} €</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Euro className="h-5 w-5 text-bgs-blue" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total des transactions</p>
              <p className="text-xl font-bold text-purple-600">{stats.transactionCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="pl-10 w-full md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div>
              <label htmlFor="from" className="block text-sm text-gray-500 mb-1">Du</label>
              <Input
                type="date"
                id="from"
                name="from"
                value={dateRange.from}
                onChange={handleDateRangeChange}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="to" className="block text-sm text-gray-500 mb-1">Au</label>
              <Input
                type="date"
                id="to"
                name="to"
                value={dateRange.to}
                onChange={handleDateRangeChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            Réinitialiser
          </Button>
          
          <Button
            onClick={() => fetchTransactions()}
            className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
          >
            Actualiser
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
          </div>
        ) : filteredTransactions.length === 0 ? (
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
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('amount')}
                    >
                      <span>Montant</span>
                      {sortField === 'amount' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center space-x-1 hover:text-bgs-blue"
                      onClick={() => handleSort('created_at')}
                    >
                      <span>Date</span>
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const user = userData[transaction.user_id] || {};
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
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
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
    </div>
  );
}
