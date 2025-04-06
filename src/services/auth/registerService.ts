
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRegistrationData, AuthResponse } from "./types";
import { notificationService } from "../notifications";

/**
 * Registers a new user with Supabase and handles referral code validation
 */
export const registerUser = async (userData: UserRegistrationData): Promise<AuthResponse> => {
  try {
    console.log("Tentative d'inscription avec:", { 
      firstName: userData.firstName, 
      lastName: userData.lastName, 
      email: userData.email,
      referralCode: userData.referralCode || 'Aucun'
    });
    
    // Vérifier d'abord si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', userData.email)
      .maybeSingle();
      
    if (existingUser) {
      return { 
        success: false, 
        error: "Cet email est déjà utilisé. Veuillez vous connecter."
      };
    }

    let referrerData = null;
    
    // Si un code de parrainage est fourni, vérifier sa validité
    if (userData.referralCode) {
      console.log("Vérification du code de parrainage:", userData.referralCode);
      
      // Résoudre complètement l'ambiguïté en utilisant un alias pour la colonne code
      const { data: referralCodeData, error: referralError } = await supabase
        .from('referral_codes')
        .select('user_id, code')
        .eq('code', userData.referralCode)
        .maybeSingle();
        
      if (referralError) {
        console.error("Erreur lors de la vérification du code de parrainage:", referralError);
      }
      
      if (!referralCodeData) {
        console.log("Code de parrainage invalide ou introuvable:", userData.referralCode);
      } else {
        console.log("Code de parrainage valide trouvé:", referralCodeData);
        referrerData = referralCodeData;
      }
    }
    
    // Inscription avec Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          referred_by: referrerData?.user_id || null,
          referral_code: userData.referralCode || null,
        },
      },
    });

    if (error) {
      console.error("Erreur d'inscription avec Supabase Auth:", error);
      
      // If there's a permission error, provide more specific feedback
      if (error.message.includes("permission denied")) {
        return { 
          success: false, 
          error: "Erreur de permission lors de l'inscription. Veuillez contacter l'administrateur."
        };
      }
      
      // Détailler les autres types d'erreurs pour un meilleur diagnostic
      if (error.message.includes("Database error saving new user")) {
        return {
          success: false,
          error: "Erreur de base de données lors de l'enregistrement du nouvel utilisateur. Veuillez réessayer plus tard."
        };
      }
      
      return {
        success: false,
        error: error.message || "Une erreur s'est produite lors de l'inscription"
      };
    }
    
    console.log("User registration successful:", data);
    
    // Si l'utilisateur est créé avec succès et qu'il y avait un code de parrainage valide,
    // créer l'entrée dans la table des parrainages
    if (data && referrerData) {
      await handleReferralBonus(data.user?.id, referrerData);
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle specific registration errors
    if (error.message?.includes("User already registered")) {
      toast.error("Cet email est déjà utilisé. Veuillez vous connecter.");
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    if (error.message?.includes("permission denied")) {
      toast.error("Erreur de permission lors de l'inscription. L'administrateur a été notifié.");
      return { success: false, error: "Erreur de permission lors de l'inscription" };
    }

    toast.error(error.message || "Erreur lors de l'inscription");
    return { success: false, error: error.message || "Erreur lors de l'inscription" };
  }
};

/**
 * Handles the referral bonus when a user registers with a valid referral code
 */
async function handleReferralBonus(userId: string | undefined, referrerData: any): Promise<void> {
  if (!userId) return;
  
  try {
    // Ajouter une entrée dans la table des parrainages
    const { error: referralError } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerData.user_id,
        referred_id: userId,
        status: 'pending'
      }]);
      
    if (referralError) {
      console.error("Erreur lors de l'enregistrement du parrainage:", referralError);
      return;
    }
    
    console.log("Parrainage enregistré avec succès");
    
    // Ajouter le crédit de 25€ au filleul
    const { error: walletError } = await supabase
      .from('wallet_transactions')
      .insert([{
        user_id: userId,
        amount: 25,
        type: 'referral_bonus',
        description: 'Bonus de bienvenue - Parrainage',
        status: 'completed'
      }]);
      
    if (walletError) {
      console.error("Erreur lors de l'ajout du bonus de parrainage au filleul:", walletError);
      return;
    }
    
    console.log("Bonus de parrainage ajouté au filleul");
    
    // Mettre à jour le solde du filleul
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ wallet_balance: 25 })
      .eq('id', userId);
      
    if (profileError) {
      console.error("Erreur lors de la mise à jour du solde du filleul:", profileError);
    }
  } catch (err) {
    console.error("Erreur lors du traitement du parrainage:", err);
  }
}
