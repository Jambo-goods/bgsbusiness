
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "./notifications";

export type UserCredentials = {
  email: string;
  password: string;
};

export type UserRegistrationData = UserCredentials & {
  firstName: string;
  lastName: string;
  referralCode?: string | null;
};

export const registerUser = async (userData: UserRegistrationData) => {
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
      const { data: referralCodeData, error: referralError } = await supabase
        .from('referral_codes')
        .select('user_id, referral_codes.code')  // Spécifier explicitement la table pour la colonne 'code'
        .eq('referral_codes.code', userData.referralCode)  // Qualifier la colonne 'code' avec le nom de la table
        .single();
        
      if (referralError || !referralCodeData) {
        console.log("Code de parrainage invalide:", userData.referralCode);
        // On peut continuer l'inscription même si le code est invalide
      } else {
        console.log("Code de parrainage valide:", referralCodeData);
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
      // If there's a permission error, provide more specific feedback
      if (error.message.includes("permission denied")) {
        console.error("Permission error during signup:", error);
        return { 
          success: false, 
          error: "Erreur de permission lors de l'inscription. Veuillez contacter l'administrateur."
        };
      }
      throw error;
    }
    
    console.log("User registration successful:", data);
    
    // Si l'utilisateur est créé avec succès et qu'il y avait un code de parrainage valide,
    // créer l'entrée dans la table des parrainages
    if (data && referrerData) {
      try {
        // Ajouter une entrée dans la table des parrainages
        const { error: referralError } = await supabase
          .from('referrals')
          .insert([{
            referrer_id: referrerData.user_id,
            referred_id: data.user?.id,
            status: 'pending'
          }]);
          
        if (referralError) {
          console.error("Erreur lors de l'enregistrement du parrainage:", referralError);
        } else {
          console.log("Parrainage enregistré avec succès");
          
          // Ajouter le crédit de 25€ au filleul
          const { error: walletError } = await supabase
            .from('wallet_transactions')
            .insert([{
              user_id: data.user?.id,
              amount: 25,
              type: 'referral_bonus',
              description: 'Bonus de bienvenue - Parrainage',
              status: 'completed'
            }]);
            
          if (walletError) {
            console.error("Erreur lors de l'ajout du bonus de parrainage au filleul:", walletError);
          } else {
            console.log("Bonus de parrainage ajouté au filleul");
            
            // Mettre à jour le solde du filleul
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ wallet_balance: 25 })
              .eq('id', data.user?.id);
              
            if (profileError) {
              console.error("Erreur lors de la mise à jour du solde du filleul:", profileError);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors du traitement du parrainage:", err);
      }
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle specific registration errors
    if (error.message.includes("User already registered")) {
      toast.error("Cet email est déjà utilisé. Veuillez vous connecter.");
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    if (error.message.includes("permission denied")) {
      toast.error("Erreur de permission lors de l'inscription. L'administrateur a été notifié.");
      return { success: false, error: "Erreur de permission lors de l'inscription" };
    }

    toast.error(error.message || "Erreur lors de l'inscription");
    return { success: false, error: error.message || "Erreur lors de l'inscription" };
  }
};

export const loginUser = async ({ email, password }: UserCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Handle specific login errors
    if (error.message === "Invalid login credentials") {
      return { success: false, error: "Email ou mot de passe incorrect" };
    } else if (error.message.includes("rate limit")) {
      return { success: false, error: "Trop de tentatives de connexion. Veuillez réessayer plus tard." };
    }
    
    return { success: false, error: error.message || "Une erreur s'est produite lors de la connexion" };
  }
};

export const logoutUser = async () => {
  try {
    // Clean up all possible storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Try to sign out from Supabase
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn("Supabase signOut error:", error);
        // Continue with logout flow even if there's a Supabase error
      }
    } catch (signOutError) {
      console.warn("Exception during signOut:", signOutError);
      // Continue with logout flow even if signOut throws
    }
    
    console.log("Logout process completed");
    return { success: true };
  } catch (error: any) {
    console.error("Logout general error:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!data.session) {
      return { user: null };
    }
    
    return { user: data.session.user };
  } catch (error) {
    console.error("Get current user error:", error);
    return { user: null };
  }
};
