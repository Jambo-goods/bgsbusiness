
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
        
        if (bankTransfersError) {
          console.error("Error fetching from bank_transfers:", bankTransfersError);
          throw bankTransfersError;
        }
        
        console.log("Raw bank_transfers data:", bankTransfersData);
        
        // Extract unique user IDs
        const userIds = [...new Set((bankTransfersData || []).map(transfer => transfer.user_id))];
        
        // Fetch all profiles in one query
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);
          
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
        let formattedTransfers = (bankTransfersData || []).map(transfer => {
          const profile = profilesMap[transfer.user_id] || {
            first_name: "Utilisateur",
            last_name: "Inconnu",
            email: null
          };
          
          return {
            id: transfer.id,
            created_at: transfer.confirmed_at,
            user_id: transfer.user_id,
            amount: transfer.amount || 0,
            description: `Virement bancaire (réf: ${transfer.reference})`,
            status: transfer.status || "pending",
            receipt_confirmed: transfer.processed || false,
            reference: transfer.reference,
            processed: transfer.processed,
            processed_at: transfer.processed_at,
            notes: transfer.notes,
            profile: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            }
          };
        });
        
        // Now also fetch from wallet_transactions as fallback
        let { data: walletData, error: walletError } = await supabase
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
        
        if (walletError) {
          console.error("Error fetching wallet transactions:", walletError);
        } else if (walletData && walletData.length > 0) {
          console.log("Found wallet transactions:", walletData.length);
          
          // Filter transactions that mention "Virement bancaire" in their description
          const bankTransfers = walletData.filter(transaction => 
            transaction.description?.toLowerCase().includes("virement bancaire")
          );
          
          console.log("Filtered bank transfers from wallet:", bankTransfers.length);
          
          if (bankTransfers.length > 0) {
            // Get any new user IDs not already fetched
            const newUserIds = [...new Set(bankTransfers.map(t => t.user_id))].filter(id => !profilesMap[id]);
            
            // Fetch additional profiles if needed
            if (newUserIds.length > 0) {
              const { data: additionalProfiles } = await supabase
                .from("profiles")
                .select("id, first_name, last_name, email")
                .in("id", newUserIds);
                
              // Add to existing profiles map
              (additionalProfiles || []).forEach(profile => {
                profilesMap[profile.id] = profile;
              });
            }
            
            // Map wallet transactions to BankTransferItem format and add to formatted transfers
            const walletTransfers = bankTransfers.map(transfer => {
              const profile = profilesMap[transfer.user_id] || {
                first_name: "Utilisateur",
                last_name: "Inconnu",
                email: null
              };
              
              return {
                id: transfer.id,
                created_at: transfer.created_at,
                user_id: transfer.user_id,
                amount: transfer.amount || 0,
                description: transfer.description || "Virement bancaire",
                status: transfer.status || "pending",
                receipt_confirmed: transfer.receipt_confirmed || false,
                profile: {
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  email: profile.email
                }
              };
            });
            
            // Add wallet transfers to formatted transfers, avoiding duplicates by ID
            const existingIds = new Set(formattedTransfers.map(t => t.id));
            walletTransfers.forEach(transfer => {
              if (!existingIds.has(transfer.id)) {
                formattedTransfers.push(transfer);
                existingIds.add(transfer.id);
              }
            });
          }
        }
        
        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          formattedTransfers = formattedTransfers.filter(item => item.status === statusFilter);
        }
        
        console.log("All formatted transfers after filtering:", formattedTransfers.length);
        console.log("Transfer IDs:", formattedTransfers.map(t => t.id));
        return formattedTransfers as BankTransferItem[];
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
