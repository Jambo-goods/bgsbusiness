
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
        console.log("Number of transfers from bank_transfers:", bankTransfersData?.length || 0);
        
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
          
          // Make sure all required fields are present
          return {
            id: transfer.id,
            created_at: transfer.confirmed_at || new Date().toISOString(),
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
        
        console.log("Formatted transfers from bank_transfers:", formattedTransfers);

        // Now also fetch from wallet_transactions
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
          console.log("Raw wallet transactions:", walletData);
          
          // Filter transactions that mention "Virement bancaire" in their description or all deposits
          const bankTransfers = walletData.filter(transaction => 
            // Instead of filtering, include all deposit transactions
            transaction.type === 'deposit'
          );
          
          console.log("Filtered bank transfers from wallet:", bankTransfers.length);
          console.log("Filtered wallet transactions:", bankTransfers);
          
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
              
              // Make sure all required fields have values even if they are undefined
              return {
                id: transfer.id,
                created_at: transfer.created_at || new Date().toISOString(),
                user_id: transfer.user_id,
                amount: transfer.amount || 0,
                description: transfer.description || "Virement bancaire",
                status: transfer.status || "pending",
                receipt_confirmed: transfer.receipt_confirmed || false,
                reference: transfer.description || "Auto-" + transfer.id.substring(0, 8),
                processed: false,
                processed_at: null,
                notes: "",
                profile: {
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  email: profile.email
                }
              };
            });
            
            console.log("Before adding wallet transfers:", formattedTransfers.length);
            
            // Add wallet transfers to formatted transfers, avoiding duplicates by ID
            const existingIds = new Set(formattedTransfers.map(t => t.id));
            walletTransfers.forEach(transfer => {
              if (!existingIds.has(transfer.id)) {
                formattedTransfers.push(transfer);
                existingIds.add(transfer.id);
                console.log("Added wallet transfer:", transfer.id);
              } else {
                console.log("Skipped duplicate transfer:", transfer.id);
              }
            });
            
            console.log("After adding wallet transfers:", formattedTransfers.length);
          }
        }
        
        // Debug each transfer in the combined list
        console.log("BEFORE FILTERING - All transfers:", formattedTransfers.length);
        formattedTransfers.forEach((transfer, index) => {
          console.log(`Transfer ${index + 1}:`, transfer.id, transfer.status, transfer.amount, transfer.description);
        });
        
        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          const beforeCount = formattedTransfers.length;
          formattedTransfers = formattedTransfers.filter(item => {
            const matches = item.status === statusFilter;
            if (!matches) {
              console.log(`Filtered out transfer ${item.id} with status ${item.status} (filter: ${statusFilter})`);
            }
            return matches;
          });
          
          console.log(`Status filtering: ${beforeCount} → ${formattedTransfers.length} transfers (filter: ${statusFilter})`);
        }
        
        console.log("AFTER FILTERING - Final transfer list:", formattedTransfers.length);
        console.log("Final transfer IDs:", formattedTransfers.map(t => t.id));
        
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

  // Check if we're missing any transfers between tables
  const missingTransfersCheck = () => {
    if (!pendingTransfers) return;
    
    if (pendingTransfers.length < 3) {
      console.warn("WARNING: Expected at least 3 transfers, but only found", pendingTransfers.length);
      console.warn("This might indicate an issue with transfer retrieval or filtering");
    }
  };

  // Run the missing transfers check
  missingTransfersCheck();

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
