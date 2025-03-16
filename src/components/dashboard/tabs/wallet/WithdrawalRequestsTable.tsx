
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingState from "./withdrawal-table/LoadingState";
import EmptyState from "./withdrawal-table/EmptyState";
import WithdrawalTableRow from "./withdrawal-table/WithdrawalTableRow";
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  bank_info: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  } | Record<string, any>;
}

export default function WithdrawalRequestsTable() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawalRequests();

    // Set up real-time listener for withdrawal_requests table
    const withdrawalChannel = supabase
      .channel('withdrawal_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawal_requests'
      }, (payload) => {
        console.log('Withdrawal request change detected:', payload);
        
        // If a withdrawal status is changed to "scheduled", show a notification
        if (payload.eventType === 'UPDATE' && 
            payload.new.status === 'scheduled' && 
            payload.old.status !== 'scheduled') {
          toast.info(`Retrait programmé de ${payload.new.amount}€`, {
            description: "Le montant a été déduit de votre solde disponible."
          });
        }
        
        // Refresh the withdrawal requests list
        fetchWithdrawalRequests();
      })
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(withdrawalChannel);
    };
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        return;
      }

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      
      // Transformation des données pour s'assurer que bank_info est correctement formaté
      const formattedData = data.map(item => ({
        ...item,
        bank_info: typeof item.bank_info === 'object' ? item.bank_info : {}
      }));
      
      setWithdrawalRequests(formattedData as WithdrawalRequest[]);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes de retrait:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (withdrawalRequests.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mt-6">
      <h3 className="font-medium text-lg mb-4">Historique des demandes de retrait</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Banque</TableHead>
              <TableHead>Compte</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawalRequests.map((request) => (
              <WithdrawalTableRow key={request.id} request={request} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
