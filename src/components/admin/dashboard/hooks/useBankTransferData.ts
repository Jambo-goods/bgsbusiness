
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankTransferItem } from "../types/bankTransfer";
import { toast } from "sonner";

interface ProfileData {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

export function useBankTransferData() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authStatus, setAuthStatus] = useState<string>("checking");
  const [userRole, setUserRole] = useState<string>("unknown");
  
  // Vérifier le statut d'authentification au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erreur d'authentification:", error.message);
          setAuthStatus("error");
          return;
        }
        
        setAuthStatus(data.session ? "authenticated" : "not authenticated");
        if (data.session) {
          // Vérifier si l'utilisateur est admin
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
        
        // Récupérer les données de la table bank_transfers directement sans filtres RLS initiaux
        let { data: bankTransfersData, error: bankTransfersError } = await supabase
          .from("bank_transfers")
          .select("*, profiles:user_id(first_name, last_name, email)");
        
        if (bankTransfersError) {
          console.error("Error fetching from bank_transfers:", bankTransfersError);
          console.error("Error details:", bankTransfersError.details, bankTransfersError.hint, bankTransfersError.code);
          toast.error(`Erreur lors de la récupération des virements: ${bankTransfersError.message}`);
          bankTransfersData = []; // Initialize as empty array if there's an error
        }
        
        console.log("Raw bank_transfers data:", bankTransfersData);
        console.log("Nombre de virements trouvés:", bankTransfersData?.length || 0);
        
        // Récupérer les données de wallet_transactions sans filtres RLS initiaux
        let { data: walletTransactions, error: walletError } = await supabase
          .from("wallet_transactions")
          .select("*, profiles:user_id(first_name, last_name, email)")
          .eq("type", "deposit");
          
        if (walletError) {
          console.error("Error fetching wallet transactions:", walletError);
          console.error("Error details:", walletError.details, walletError.hint, walletError.code);
          toast.error(`Erreur lors de la récupération des transactions: ${walletError.message}`);
          walletTransactions = []; // Initialize as empty array if there's an error
        }
        
        console.log("Raw wallet_transactions data:", walletTransactions);
        console.log("Nombre de transactions trouvées:", walletTransactions?.length || 0);
        
        // Si aucune donnée n'a été récupérée, afficher un message approprié
        if ((!bankTransfersData || bankTransfersData.length === 0) && 
            (!walletTransactions || walletTransactions.length === 0)) {
          console.log("Aucune donnée trouvée. Cela pourrait être un problème de permissions RLS.");
          toast.warning("Aucune donnée trouvée. Vérifiez les permissions de la base de données.");
          
          if (authStatus !== "authenticated") {
            toast.error("Vous n'êtes pas authentifié. Veuillez vous connecter.");
          } else if (userRole !== "admin") {
            toast.warning(`Rôle utilisateur insuffisant: ${userRole}. Seuls les administrateurs peuvent voir ces données.`);
          }
        }
        
        // Formater les virements bancaires
        let formattedTransfers = (bankTransfersData || []).map(transfer => {
          // Safely handle the profiles relation
          const profileData: ProfileData = transfer.profiles ? {
            first_name: transfer.profiles.first_name || null,
            last_name: transfer.profiles.last_name || null,
            email: transfer.profiles.email || null
          } : {
            first_name: null,
            last_name: null,
            email: null
          };
          
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
              first_name: profileData.first_name || "Utilisateur",
              last_name: profileData.last_name || "Inconnu",
              email: profileData.email || null
            }
          };
        });
        
        // Formater les transactions de portefeuille
        if (walletTransactions && walletTransactions.length > 0) {
          const walletTransfers = walletTransactions.map(tx => {
            // Safely handle the profiles relation
            const profileData: ProfileData = tx.profiles ? {
              first_name: tx.profiles.first_name || null,
              last_name: tx.profiles.last_name || null,
              email: tx.profiles.email || null
            } : {
              first_name: null,
              last_name: null,
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
                first_name: profileData.first_name || "Utilisateur",
                last_name: profileData.last_name || "Inconnu",
                email: profileData.email || null
              }
            };
          });
          
          // Ajouter les transactions wallet aux transferts formatés, en évitant les doublons par ID
          const existingIds = new Set(formattedTransfers.map(t => t.id));
          walletTransfers.forEach(transfer => {
            if (!existingIds.has(transfer.id)) {
              formattedTransfers.push(transfer);
              existingIds.add(transfer.id);
            }
          });
        }
        
        // Journaliser tous les transferts avant filtrage
        console.log("AVANT FILTRAGE - Tous les transferts:", formattedTransfers.length);
        formattedTransfers.forEach((transfer, index) => {
          console.log(`Transfert ${index + 1}:`, transfer.id, transfer.status, transfer.amount, transfer.description);
        });
        
        // Appliquer le filtre de statut si ce n'est pas "all"
        if (statusFilter !== "all" && formattedTransfers.length > 0) {
          console.log(`Application du filtre statut: ${statusFilter}`);
          formattedTransfers = formattedTransfers.filter(item => {
            const matches = statusFilter === "all" || item.status === statusFilter;
            return matches;
          });
          
          console.log(`Après filtrage par statut: ${formattedTransfers.length} transferts restants`);
        }
        
        // Journaliser la liste finale des transferts
        console.log("FINAL - Liste des transferts:", formattedTransfers);
        console.log("IDs des transferts finaux:", formattedTransfers.map(t => t.id));
        
        return formattedTransfers as BankTransferItem[];
      } catch (error) {
        console.error("Erreur globale lors de la récupération des données:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
        return [];
      }
    },
    refetchInterval: 15000, // Rafraîchir automatiquement toutes les 15 secondes
    staleTime: 10000, // Considérer les données fraîches pendant 10 secondes
    retry: 3 // Réessayer les requêtes échouées jusqu'à 3 fois
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
