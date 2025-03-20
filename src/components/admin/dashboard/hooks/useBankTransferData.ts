
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankTransferItem } from "../types/bankTransfer";
import { toast } from "sonner";

export function useBankTransferData() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authStatus, setAuthStatus] = useState<string>("checking");
  const [userRole, setUserRole] = useState<string>("unknown");
  
  // Check authentication status at startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erreur d'authentification:", error.message);
          setAuthStatus("error");
          return;
        }
        
        setAuthStatus(data.session ? "authenticated" : "not authenticated");
        if (data.session) {
          // Check if the user is admin
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const role = userData.user.app_metadata?.role || "utilisateur";
            setUserRole(role);
            console.log("Rôle utilisateur:", role);
          }
        }
      } catch (e) {
        console.error("Erreur lors de la vérification d'auth:", e);
        setAuthStatus("error");
      }
    };
    
    checkAuth();
  }, []);
  
  const { data: pendingTransfers, isLoading, refetch, isError } = useQuery({
    queryKey: ["pendingBankTransfers", statusFilter, authStatus],
    queryFn: async () => {
      try {
        console.log("Statut d'authentification:", authStatus);
        console.log("Rôle utilisateur:", userRole);
        console.log("Fetching bank transfers with status filter:", statusFilter);
        
        // Utiliser la vue RPC admin_get_bank_transfers si disponible
        // Sinon, fallback à la méthode standard
        let bankTransfersData: any[] = [];
        let bankTransfersError: any = null;
        
        try {
          // Try using is_admin function as a check first
          const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin');
          
          if (!isAdminError && isAdminResult) {
            console.log("Admin status verified:", isAdminResult);
            
            // Try direct query now that we know we have admin access
            const { data: directData, error: directError } = await supabase
              .from("bank_transfers")
              .select("*")
              .order('confirmed_at', { ascending: false });
            
            bankTransfersData = directData || [];
            bankTransfersError = directError;
            
            if (directError) {
              console.error("Error fetching from bank_transfers:", directError);
              console.error("Error details:", directError.details, directError.hint, directError.code);
            } else {
              console.log("Données récupérées directement:", directData?.length || 0);
            }
          } else {
            console.warn("Not admin or admin check error:", isAdminError);
            
            // Fallback: retrieve data directly with RLS limitations
            const { data: directData, error: directError } = await supabase
              .from("bank_transfers")
              .select("*")
              .order('confirmed_at', { ascending: false });
            
            bankTransfersData = directData || [];
            bankTransfersError = directError;
          }
        } catch (e) {
          console.error("Erreur lors de la tentative RPC/directe:", e);
          
          // Last fallback: retrieve without restrictions
          const { data: directData, error: directError } = await supabase
            .from("bank_transfers")
            .select("*")
            .order('confirmed_at', { ascending: false });
          
          bankTransfersData = directData || [];
          bankTransfersError = directError;
        }
        
        if (bankTransfersError) {
          toast.error(`Erreur lors de la récupération des virements: ${bankTransfersError.message}`);
        }
        
        console.log("Raw bank_transfers data:", bankTransfersData);
        console.log("Nombre de virements trouvés:", bankTransfersData?.length || 0);
        
        // Retrieve wallet_transactions data without initial RLS filters
        let walletTransactions: any[] = [];
        let walletError: any = null;
        
        try {
          const { data: txData, error: txError } = await supabase
            .from("wallet_transactions")
            .select("*")
            .eq("type", "deposit");
            
          walletTransactions = txData || [];
          walletError = txError;
          
          if (txError) {
            console.error("Error fetching wallet transactions:", txError);
            console.error("Error details:", txError.details, txError.hint, txError.code);
          } else {
            console.log("Données wallet récupérées:", txData?.length || 0);
          }
        } catch (e) {
          console.error("Erreur lors de la récupération wallet:", e);
        }
        
        if (walletError) {
          toast.error(`Erreur lors de la récupération des transactions: ${walletError.message}`);
        }
        
        console.log("Raw wallet_transactions data:", walletTransactions);
        console.log("Nombre de transactions trouvées:", walletTransactions?.length || 0);
        
        // If no data was retrieved, try using a service_role or admin
        if ((!bankTransfersData || bankTransfersData.length === 0) && 
            (!walletTransactions || walletTransactions.length === 0)) {
          console.log("Aucune donnée trouvée. Cela pourrait être un problème de permissions RLS.");
          toast.warning("Aucune donnée trouvée. Vérifiez les permissions de la base de données.");
        }
        
        // Extract unique user IDs
        const userIdsFromTransfers = (bankTransfersData || []).map(transfer => transfer.user_id);
        const userIdsFromWallet = (walletTransactions || []).map(tx => tx.user_id);
        const uniqueUserIds = [...new Set([...userIdsFromTransfers, ...userIdsFromWallet])];
        
        // Retrieve all profiles in a single query
        let profilesData: any[] = [];
        let profilesError: any = null;
        
        if (uniqueUserIds.length > 0) {
          const { data: profiles, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", uniqueUserIds);
            
          profilesData = profiles || [];
          profilesError = error;
          
          if (profilesError) {
            console.error("Erreur lors de la récupération des profils:", profilesError);
            toast.error("Impossible de récupérer les données des utilisateurs");
          }
        }
        
        // Create a map of user profiles for quick lookup
        const profilesMap = (profilesData || []).reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {} as Record<string, any>);
        
        // Format bank transfers
        let formattedTransfers = (bankTransfersData || []).map(transfer => {
          const profile = profilesMap[transfer.user_id] || {
            first_name: "Utilisateur",
            last_name: "Inconnu",
            email: null
          };
          
          // Ensure all required fields are present
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
            source: "bank_transfers",
            profile: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            }
          };
        });
        
        // Format wallet transactions
        if (walletTransactions && walletTransactions.length > 0) {
          const walletTransfers = walletTransactions.map(tx => {
            const profile = profilesMap[tx.user_id] || {
              first_name: "Utilisateur",
              last_name: "Inconnu",
              email: null
            };
            
            return {
              id: tx.id,
              created_at: tx.created_at || new Date().toISOString(),
              user_id: tx.user_id,
              amount: tx.amount || 0,
              description: tx.description || "Dépôt bancaire",
              status: tx.status || "pending",
              receipt_confirmed: tx.receipt_confirmed || false,
              reference: tx.description || `Auto-${tx.id.substring(0, 8)}`,
              processed: tx.receipt_confirmed || false,
              processed_at: null,
              notes: "",
              source: "wallet_transactions",
              profile: {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email
              }
            };
          });
          
          // Add wallet transactions to formatted transfers, avoiding duplicates by ID
          const existingIds = new Set(formattedTransfers.map(t => t.id));
          walletTransfers.forEach(transfer => {
            if (!existingIds.has(transfer.id)) {
              formattedTransfers.push(transfer);
              existingIds.add(transfer.id);
            }
          });
        }
        
        // Log all transfers before filtering
        console.log("AVANT FILTRAGE - Tous les transferts:", formattedTransfers.length);
        formattedTransfers.forEach((transfer, index) => {
          console.log(`Transfert ${index + 1}:`, transfer.id, transfer.status, transfer.amount, transfer.description);
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
