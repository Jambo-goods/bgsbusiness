
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BankTransferItem } from "../types/bankTransfer";
import { useAuthenticationStatus } from "./useAuthenticationStatus";
import { fetchBankTransfersData, fetchWalletTransactions, fetchUserProfiles } from "./useFetchTransfers";
import { formatBankTransferData, deduplicateByReferenceAndStatus } from "../utils/dataTransformUtils";

export function useBankTransferData() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { authStatus, userRole } = useAuthenticationStatus();
  
  const { data: pendingTransfers, isLoading, refetch, isError } = useQuery({
    queryKey: ["pendingBankTransfers", statusFilter, authStatus],
    queryFn: async () => {
      try {
        // Fetch data from the database
        const bankTransfersData = await fetchBankTransfersData(authStatus, userRole);
        const walletTransactions = await fetchWalletTransactions();
        
        // If no data was retrieved, show a warning
        if ((!bankTransfersData || bankTransfersData.length === 0) && 
            (!walletTransactions || walletTransactions.length === 0)) {
          console.log("Aucune donnée trouvée. Cela pourrait être un problème de permissions RLS.");
          toast.warning("Aucune donnée trouvée. Vérifiez les permissions de la base de données.");
        }
        
        // Fetch user profiles
        const profilesMap = await fetchUserProfiles(bankTransfersData, walletTransactions);
        
        // Format the data
        let formattedTransfers = formatBankTransferData(
          bankTransfersData, 
          walletTransactions,
          profilesMap
        );
        
        // Remove duplicates
        formattedTransfers = deduplicateByReferenceAndStatus(formattedTransfers);
        
        // Log all transfers before filtering
        console.log("APRÈS DÉDUPLICATION - Tous les transferts:", formattedTransfers.length);
        formattedTransfers.forEach((transfer, index) => {
          console.log(`Transfert ${index + 1}:`, transfer.id, transfer.status, transfer.amount, transfer.reference);
        });
        
        // Apply status filter if not "all"
        if (statusFilter !== "all" && formattedTransfers.length > 0) {
          console.log(`Application du filtre statut: ${statusFilter}`);
          formattedTransfers = formattedTransfers.filter(item => {
            const matches = statusFilter === "all" || item.status === statusFilter;
            return matches;
          });
          
          console.log(`Après filtrage par statut: ${formattedTransfers.length} transferts restants`);
        }
        
        // Log the final list of transfers
        console.log("FINAL - Liste des transferts:", formattedTransfers);
        console.log("IDs des transferts finaux:", formattedTransfers.map(t => t.id));
        
        return formattedTransfers as BankTransferItem[];
      } catch (error) {
        console.error("Erreur globale lors de la récupération des données:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
        return [];
      }
    },
    refetchInterval: 15000, // Automatically refresh every 15 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
    retry: 3 // Retry failed requests up to 3 times
  });

  const handleManualRefresh = () => {
    toast.info("Actualisation des données...");
    refetch();
  };

  return {
    pendingTransfers: pendingTransfers || [],
    isLoading,
    isError,
    statusFilter,
    setStatusFilter,
    refetch,
    handleManualRefresh,
    authStatus,
    userRole
  };
}
