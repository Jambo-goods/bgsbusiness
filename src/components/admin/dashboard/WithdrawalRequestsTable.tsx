
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { 
  Pagination, PaginationContent, PaginationItem, 
  PaginationLink, PaginationNext, PaginationPrevious 
} from '@/components/ui/pagination';

type WithdrawalRequest = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  admin_id: string | null;
  bank_info: any;
  notes: string | null;
};

type UserData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

interface WithdrawalRequestsTableProps {
  onRefresh?: () => void;
}

const WithdrawalRequestsTable: React.FC<WithdrawalRequestsTableProps> = ({ onRefresh }) => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<Record<string, UserData>>({});
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchWithdrawalRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Withdrawal requests fetched:", data?.length || 0);
      
      if (data && data.length > 0) {
        setWithdrawalRequests(data);
        
        // Fetch user data for each request
        const userIds = Array.from(new Set(data.map(req => req.user_id)));
        
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
          
        if (userError) throw userError;
        
        const userMap: Record<string, UserData> = {};
        if (users) {
          users.forEach(user => {
            userMap[user.id] = user;
          });
        }
        
        setUserData(userMap);
      } else {
        console.log("No withdrawal requests found in the database");
        setWithdrawalRequests([]);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      toast.error('Erreur lors du chargement des demandes de retrait');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
    
    // Set up an interval to refresh data periodically
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing withdrawal requests list...");
      fetchWithdrawalRequests();
    }, 60000); // Every minute
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Function to display status badge
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

  // Calculate pagination
  const totalPages = Math.ceil(withdrawalRequests.length / itemsPerPage);
  const paginatedRequests = withdrawalRequests.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => setPage(i)}
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
            </PaginationItem>
          )}
          
          {pages}
          
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des demandes de retrait...</p>
        </div>
      ) : withdrawalRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune demande de retrait trouvée</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date de demande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de traitement</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => {
                const user = userData[request.user_id] || {
                  first_name: '',
                  last_name: '',
                  email: ''
                };
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.first_name || ''} {user.last_name || ''}</div>
                        <div className="text-sm text-gray-500">{user.email || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{request.amount?.toLocaleString()} €</TableCell>
                    <TableCell>
                      {request.requested_at ? new Date(request.requested_at).toLocaleString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {request.processed_at ? new Date(request.processed_at).toLocaleString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {request.notes || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default WithdrawalRequestsTable;
