
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankTransferItem } from "../types/bankTransfer";
import { toast } from "sonner";

export function useBankTransferData() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: pendingTransfers, isLoading, refetch, isError } = useQuery({
    queryKey: ["pendingBankTransfers", statusFilter],
    queryFn: async () => {
      try {
        console.log("Fetching bank transfers with status filter:", statusFilter);
        
        // First approach: check if bank_transfers table exists and fetch from it
        let { data: bankTransfersData, error: bankTransfersError } = await supabase
          .from("bank_transfers")
          .select("*")
          .order("confirmed_at", { ascending: false });
        
        if (bankTransfersData && bankTransfersData.length > 0) {
          console.log("Using bank_transfers table:", bankTransfersData);
          
          // Fetch user profiles in a single batch to reduce number of queries
          if (bankTransfersData.length === 0) {
            return [];
          }
          
          // Extract unique user IDs
          const userIds = [...new Set(bankTransfersData.map(transfer => transfer.user_id))];
          
          // Fetch all profiles in one query
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", userIds);
            
          if (profilesError) {
            console.error("Erreur lors de la récupération des profils:", profilesError);
            toast.error("Impossible de récupérer les données des utilisateurs");
          }
          
          // Create a map of user profiles for quick lookup
          const profilesMap = (profilesData || []).reduce((map, profile) => {
            map[profile.id] = profile;
            return map;
          }, {} as Record<string, any>);
          
          // Map bank transfers to expected format
          const formattedTransfers = bankTransfersData.map(transfer => {
            const profile = profilesMap[transfer.user_id] || {
              first_name: "Utilisateur",
              last_name: "Inconnu",
              email: null
            };
            
            // Apply status filter if not "all"
            if (statusFilter !== "all") {
              if (transfer.status !== statusFilter) {
                return null;
              }
            }
            
            return {
              id: transfer.id,
              created_at: transfer.confirmed_at,
              user_id: transfer.user_id,
              amount: transfer.amount || 0,
              description: `Virement bancaire (réf: ${transfer.reference})`,
              status: transfer.status || "pending",
              receipt_confirmed: transfer.processed || false,
              profile: {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email
              }
            };
          }).filter(item => item !== null) as BankTransferItem[];
          
          console.log("Formatted bank transfers:", formattedTransfers);
          return formattedTransfers;
        }
        
        // Fallback: Use wallet_transactions table (existing code)
        // Build the query for fetching bank transfers
        let query = supabase
          .from("wallet_transactions")
          .select(`
            id,
            created_at,
            user_id,
            amount,
            description,
            status,
            type,
            receipt_confirmed
          `)
          .eq("type", "deposit")
          .order("created_at", { ascending: false });
        
        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        
        const { data, error } = await query;

        if (error) {
          console.error("Erreur lors de la récupération des virements:", error);
          toast.error("Impossible de récupérer les données des virements");
          throw error;
        }

        console.log("Virements récupérés:", data);
        
        // Filter transactions that mention "Virement bancaire" in their description
        const bankTransfers = data?.filter(transaction => 
          transaction.description?.toLowerCase().includes("virement bancaire")
        ) || [];
        
        console.log("Virements bancaires filtrés:", bankTransfers);

        // Fetch user profiles in a single batch to reduce number of queries
        if (bankTransfers.length === 0) {
          return [];
        }
        
        // Extract unique user IDs
        const userIds = [...new Set(bankTransfers.map(transfer => transfer.user_id))];
        
        // Fetch all profiles in one query
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Erreur lors de la récupération des profils:", profilesError);
          toast.error("Impossible de récupérer les données des utilisateurs");
        }
        
        // Create a map of user profiles for quick lookup
        const profilesMap = (profilesData || []).reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {} as Record<string, any>);
        
        // Combine transfer data with profiles
        const transfersWithProfiles = bankTransfers.map(transfer => {
          const profile = profilesMap[transfer.user_id] || {
            first_name: "Utilisateur",
            last_name: "Inconnu",
            email: null
          };
          
          return {
            ...transfer,
            profile: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            }
          };
        });
        
        console.log("Virements avec profils:", transfersWithProfiles);
        return transfersWithProfiles as BankTransferItem[];
      } catch (error) {
        console.error("Erreur globale:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
        return [];
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds automatically
    staleTime: 10000, // Consider data fresh for 10 seconds
    retry: 2 // Retry failed requests up to 2 times
  });

  const handleManualRefresh = () => {
    toast.info("Actualisation des données...");
    refetch();
  };

  return {
    pendingTransfers,
    isLoading,
    isError,
    statusFilter,
    setStatusFilter,
    refetch,
    handleManualRefresh
  };
}
