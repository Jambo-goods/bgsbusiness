
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BankTransferItem } from "../types/bankTransfer";

export async function fetchBankTransfersData(authStatus: string, userRole: string) {
  try {
    console.log("Statut d'authentification:", authStatus);
    console.log("Rôle utilisateur:", userRole);
    console.log("Fetching bank transfers");
    
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
    
    return bankTransfersData;
  } catch (error) {
    console.error("Erreur globale lors de la récupération des données:", error);
    toast.error("Une erreur est survenue lors du chargement des données");
    return [];
  }
}

export async function fetchWalletTransactions() {
  try {
    // Retrieve wallet_transactions data without initial RLS filters
    const { data: txData, error: txError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("type", "deposit");
      
    if (txError) {
      console.error("Error fetching wallet transactions:", txError);
      console.error("Error details:", txError.details, txError.hint, txError.code);
      toast.error(`Erreur lors de la récupération des transactions: ${txError.message}`);
    } else {
      console.log("Données wallet récupérées:", txData?.length || 0);
    }
    
    console.log("Raw wallet_transactions data:", txData);
    console.log("Nombre de transactions trouvées:", txData?.length || 0);
    
    return txData || [];
  } catch (error) {
    console.error("Erreur lors de la récupération wallet:", error);
    return [];
  }
}

export async function fetchUserProfiles(bankTransfersData: any[], walletTransactions: any[]) {
  // Extract unique user IDs
  const userIdsFromTransfers = (bankTransfersData || []).map(transfer => transfer.user_id);
  const userIdsFromWallet = (walletTransactions || []).map(tx => tx.user_id);
  const uniqueUserIds = [...new Set([...userIdsFromTransfers, ...userIdsFromWallet])];
  
  // Retrieve all profiles in a single query
  let profilesData: any[] = [];
  
  if (uniqueUserIds.length > 0) {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", uniqueUserIds);
      
    profilesData = profiles || [];
    
    if (error) {
      console.error("Erreur lors de la récupération des profils:", error);
      toast.error("Impossible de récupérer les données des utilisateurs");
    }
  }
  
  // Create a map of user profiles for quick lookup
  return (profilesData || []).reduce((map, profile) => {
    map[profile.id] = profile;
    return map;
  }, {} as Record<string, any>);
}
