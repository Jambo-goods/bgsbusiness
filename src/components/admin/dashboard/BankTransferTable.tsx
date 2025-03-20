import React, { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankTransferTableProps, BankTransferItem } from "./types/bankTransfer";
import BankTransferTableRow from "./BankTransferTableRow";
import { useBankTransfers } from "./hooks/useBankTransfers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function BankTransferTable({ 
  pendingTransfers, 
  isLoading,
  refreshData
}: BankTransferTableProps) {
  const { processingId } = useBankTransfers();
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  console.log("Bank Transfer Table - Rendering transfers:", pendingTransfers?.length || 0);
  
  // Handle refresh after status update with debounce
  const handleStatusUpdate = useCallback(() => {
    setLastUpdateTime(Date.now());
    if (refreshData && !isRefreshing) {
      setIsRefreshing(true);
      toast.info("Actualisation des données en cours...");
      
      // Add a slight delay to ensure database operations have completed
      setTimeout(() => {
        refreshData();
        setIsRefreshing(false);
      }, 800);
    }
  }, [refreshData, isRefreshing]);

  // Subscribe to real-time updates on both tables
  useEffect(() => {
    // Subscribe to bank_transfers table
    const bankTransfersSubscription = supabase
      .channel('bank_transfers_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bank_transfers' }, 
        (payload) => {
          console.log('Changement détecté sur bank_transfers via subscription:', payload);
          
          if (!isRefreshing && refreshData) {
            setIsRefreshing(true);
            toast.info("Mise à jour détectée sur bank_transfers, actualisation en cours...");
            
            setTimeout(() => {
              refreshData();
              setIsRefreshing(false);
            }, 800);
          }
        }
      )
      .subscribe();
      
    // Subscribe to wallet_transactions table
    const walletTransactionsSubscription = supabase
      .channel('wallet_transactions_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallet_transactions' }, 
        (payload) => {
          console.log('Changement détecté sur wallet_transactions via subscription:', payload);
          
          if (!isRefreshing && refreshData) {
            setIsRefreshing(true);
            toast.info("Mise à jour détectée sur wallet_transactions, actualisation en cours...");
            
            setTimeout(() => {
              refreshData();
              setIsRefreshing(false);
            }, 800);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(bankTransfersSubscription);
      supabase.removeChannel(walletTransactionsSubscription);
    };
  }, [refreshData, isRefreshing]);

  // Force a refresh every 10 seconds to catch any updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (refreshData && !isRefreshing) {
        setIsRefreshing(true);
        refreshData();
        setTimeout(() => {
          setIsRefreshing(false);
        }, 800);
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [refreshData, isRefreshing]);

  // Initial data load
  useEffect(() => {
    if (refreshData) {
      refreshData();
    }
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  if (!pendingTransfers || pendingTransfers.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Aucun virement bancaire trouvé</p>
        <p className="text-sm text-gray-400 mt-2">Vérifiez les filtres ou rechargez la page</p>
      </div>
    );
  }

  // Helper function to determine the priority of a status
  const getStatusPriority = (status: string): number => {
    const statusPriorities: Record<string, number> = {
      'received': 5,
      'reçu': 5,
      'completed': 4,
      'processing': 3,
      'pending': 2,
      'rejected': 1,
      'cancelled': 0
    };
    return statusPriorities[status] || 0;
  };

  // Create a more effective deduplication map based on reference and amount
  const uniqueTransfersMap = new Map<string, BankTransferItem>();

  // First pass: group transfers by reference + amount and keep track of highest priority status
  const transfersGroups = new Map<string, BankTransferItem[]>();
  
  pendingTransfers.forEach((transfer) => {
    // Use both reference and amount as the key for more accurate deduplication
    const key = `${transfer.reference}-${transfer.amount}`;
    
    if (!transfersGroups.has(key)) {
      transfersGroups.set(key, []);
    }
    
    transfersGroups.get(key)?.push(transfer);
  });

  // Second pass: For each group, pick the item with the highest priority status
  // If statuses are equal, pick the most recent one
  transfersGroups.forEach((group, key) => {
    if (group.length === 0) return;
    
    // Sort the group by status priority (descending) and then by date (most recent first)
    group.sort((a, b) => {
      const priorityDiff = getStatusPriority(b.status) - getStatusPriority(a.status);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, use date as tiebreaker
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Take the first item (highest priority or most recent)
    uniqueTransfersMap.set(key, group[0]);
    
    // Log to help debug
    if (group.length > 1) {
      console.log(`Removed ${group.length - 1} duplicates for reference: ${group[0].reference}, amount: ${group[0].amount}`);
      console.log(`Kept: Status=${group[0].status}, ID=${group[0].id}, Date=${group[0].created_at}`);
    }
  });
  
  // Also add transfers with unique IDs that might have been missed
  pendingTransfers.forEach((transfer) => {
    const key = `${transfer.reference}-${transfer.amount}`;
    
    // If this ID isn't represented in our map, add it as a separate entry
    // This ensures we don't miss any unique transfers
    if (!Array.from(uniqueTransfersMap.values()).some(t => t.id === transfer.id) && 
        !uniqueTransfersMap.has(key)) {
      uniqueTransfersMap.set(transfer.id, transfer);
    }
  });

  // Convert map back to array
  const uniqueTransfers = Array.from(uniqueTransfersMap.values());
  
  console.log("Après filtrage des doublons amélioré:", uniqueTransfers.length);
  
  // Sort transfers by date, most recent first
  const sortedTransfers = uniqueTransfers.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransfers.map((item) => (
            <BankTransferTableRow
              key={`${item.id}-${lastUpdateTime}`}
              item={item}
              processingId={processingId}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </TableBody>
      </Table>
      {isRefreshing && (
        <div className="text-center p-2 text-xs text-gray-500">
          Actualisation en cours...
        </div>
      )}
    </div>
  );
}
