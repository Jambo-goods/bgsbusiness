
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
        
        // Récupérer les données de la table bank_transfers
        // Modifier pour permettre l'accès même sans authentification
        let { data: bankTransfersData, error: bankTransfersError } = await supabase
          .from("bank_transfers")
          .select("*");
        
        if (bankTransfersError) {
          console.error("Error fetching from bank_transfers:", bankTransfersError);
          console.error("Error details:", bankTransfersError.details, bankTransfersError.hint, bankTransfersError.code);
          toast.error(`Erreur lors de la récupération des virements: ${bankTransfersError.message}`);
          bankTransfersData = []; // Initialize as empty array if there's an error
        }
        
        console.log("Raw bank_transfers data:", bankTransfersData);
        console.log("Nombre de virements trouvés:", bankTransfersData?.length || 0);
        
        // Récupérer les données des profils pour obtenir les informations utilisateur
        const userIds = [...new Set((bankTransfersData || []).map(transfer => transfer.user_id))];
        let profilesData: Record<string, ProfileData> = {};
        
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .in("id", userIds);
            
          if (profilesError) {
            console.error("Error fetching profiles:", profilesError);
          } else if (profiles) {
            // Créer un dictionnaire des profils par ID
            profiles.forEach(profile => {
              profilesData[profile.id] = {
                first_name: profile.first_name,
                last_name: profile.last_name,
                email: profile.email
              };
            });
          }
        }
        
        // Récupérer les données de wallet_transactions
        let { data: walletTransactions, error: walletError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("type", "deposit");
          
        if (walletError) {
          console.error("Error fetching wallet transactions:", walletError);
          toast.error(`Erreur lors de la récupération des transactions: ${walletError.message}`);
          walletTransactions = []; // Initialize as empty array if there's an error
        }
        
        console.log("Raw wallet_transactions data:", walletTransactions);
        console.log("Nombre de transactions trouvées:", walletTransactions?.length || 0);
        
        // Récupérer les IDs utilisateurs des transactions wallet
        const walletUserIds = [...new Set((walletTransactions || []).map(tx => tx.user_id))];
        
        // Ajouter ces IDs à notre liste d'IDs utilisateurs s'ils n'y sont pas déjà
        for (const id of walletUserIds) {
          if (!profilesData[id] && !userIds.includes(id)) {
            userIds.push(id);
          }
        }
        
        // Récupérer les profils manquants
        if (walletUserIds.length > 0) {
          const missingUserIds = walletUserIds.filter(id => !profilesData[id]);
          if (missingUserIds.length > 0) {
            const { data: additionalProfiles, error: additionalProfilesError } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, email")
              .in("id", missingUserIds);
              
            if (additionalProfilesError) {
              console.error("Error fetching additional profiles:", additionalProfilesError);
            } else if (additionalProfiles) {
              // Ajouter ces profils à notre dictionnaire
              additionalProfiles.forEach(profile => {
                profilesData[profile.id] = {
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  email: profile.email
                };
              });
            }
          }
        }
        
        // Si aucune donnée n'a été récupérée, afficher un message approprié
        if ((!bankTransfersData || bankTransfersData.length === 0) && 
            (!walletTransactions || walletTransactions.length === 0)) {
          console.log("Aucune donnée trouvée. Cela pourrait être un problème de permissions RLS.");
          toast.warning("Aucune donnée trouvée. Vérifiez les permissions de la base de données.");
        }
        
        // Formater les virements bancaires
        let formattedTransfers = (bankTransfersData || []).map(transfer => {
          // Récupérer les données de profil pour cet utilisateur
          const profileData: ProfileData = profilesData[transfer.user_id] || {};
          
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
            // Récupérer les données de profil pour cet utilisateur
            const profileData: ProfileData = profilesData[tx.user_id] || {};
            
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
