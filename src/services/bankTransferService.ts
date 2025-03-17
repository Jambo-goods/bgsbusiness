import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const bankTransferService = {
  // Confirmer un dépôt
  async confirmDeposit(item: any, amount: number) {
    try {
      console.log("Confirming deposit:", item, "Amount:", amount);
      
      // 1. Mettre à jour le statut du virement
      const { error: updateError } = await supabase
        .from(item.source === "bank_transfers" ? "bank_transfers" : "wallet_transactions")
        .update({ 
          status: "confirmed",
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq("id", item.id);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du virement:", updateError);
        toast.error("Erreur lors de la confirmation du virement");
        return false;
      }
      
      // 2. Ajouter les fonds au portefeuille de l'utilisateur
      const { error: walletError } = await supabase.rpc("increment_wallet_balance", {
        p_user_id: item.user_id,
        p_amount: amount
      });
      
      if (walletError) {
        console.error("Erreur lors de l'ajout de fonds:", walletError);
        toast.error("Erreur lors de l'ajout de fonds au portefeuille");
        return false;
      }
      
      // 3. Créer une notification pour l'utilisateur
      await supabase.from("notifications").insert({
        user_id: item.user_id,
        type: "deposit",
        title: "Dépôt confirmé",
        message: `Votre dépôt de ${amount}€ a été confirmé et ajouté à votre portefeuille.`,
        data: {
          amount,
          reference: item.reference
        }
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error);
      return false;
    }
  },
  
  // Rejeter un dépôt
  async rejectDeposit(item: any) {
    try {
      console.log("Rejecting deposit:", item);
      
      // Mettre à jour le statut du virement
      const { error } = await supabase
        .from(item.source === "bank_transfers" ? "bank_transfers" : "wallet_transactions")
        .update({ 
          status: "rejected", 
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq("id", item.id);
      
      if (error) {
        console.error("Erreur lors du rejet du virement:", error);
        toast.error("Erreur lors du rejet du virement");
        return false;
      }
      
      // Créer une notification pour l'utilisateur
      await supabase.from("notifications").insert({
        user_id: item.user_id,
        type: "deposit_rejected",
        title: "Dépôt rejeté",
        message: `Votre dépôt avec la référence ${item.reference} a été rejeté. Veuillez contacter le support pour plus d'informations.`,
        data: {
          reference: item.reference
        }
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors du rejet du dépôt:", error);
      return false;
    }
  },
  
  // Confirmer la réception d'un virement
  async confirmReceipt(item: any) {
    try {
      console.log("Confirming receipt:", item);
      
      // Mettre à jour le statut du virement à "reçu"
      const { error } = await supabase
        .from(item.source === "bank_transfers" ? "bank_transfers" : "wallet_transactions")
        .update({ 
          status: "received",
          receipt_confirmed: true
        })
        .eq("id", item.id);
      
      if (error) {
        console.error("Erreur lors de la confirmation de réception:", error);
        toast.error("Erreur lors de la confirmation de réception");
        return false;
      }
      
      // Créer une notification pour l'utilisateur
      await supabase.from("notifications").insert({
        user_id: item.user_id,
        type: "receipt_confirmed",
        title: "Virement reçu",
        message: `Votre virement avec la référence ${item.reference} a bien été reçu et est en cours de traitement.`,
        data: {
          reference: item.reference
        }
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      return false;
    }
  },
  
  // Créer un virement bancaire de test pour les admins
  async createTestBankTransfer() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour créer un virement de test");
        return false;
      }
      
      const reference = `TEST-${Math.floor(100000 + Math.random() * 900000)}`;
      const amount = Math.floor(1000 + Math.random() * 9000);
      
      console.log("Creating test transfer:", { userId, reference, amount });
      
      const { data, error } = await supabase.from("bank_transfers").insert({
        user_id: userId,
        reference: reference,
        amount: amount,
        status: "pending",
        notes: "Virement de test créé par un administrateur"
      }).select();
      
      if (error) {
        console.error("Erreur lors de la création du virement de test:", error);
        toast.error("Erreur lors de la création du virement de test");
        return false;
      }
      
      console.log("Test transfer created:", data);
      
      toast.success("Virement de test créé avec succès", {
        description: `Référence: ${reference}, Montant: ${amount}€`
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la création du virement de test:", error);
      return false;
    }
  }
};
