
import { supabase } from "@/integrations/supabase/client";
import { BankTransferItem } from "../types/bankTransfer";
import { notificationService } from "@/services/notifications";

class BankTransferService {
  async confirmDeposit(item: BankTransferItem, amount: number): Promise<boolean> {
    try {
      const updates = {
        status: "completed",
        amount: amount,
        processed: true,
        processed_at: new Date().toISOString()
      };

      // Update the bank transfer status
      if (item.source === "bank_transfers") {
        const { error } = await supabase
          .from("bank_transfers")
          .update(updates)
          .eq("id", item.id);

        if (error) {
          console.error("Error updating bank transfer:", error);
          return false;
        }
      } else if (item.source === "wallet_transactions") {
        const { error } = await supabase
          .from("wallet_transactions")
          .update({
            status: "completed",
            amount: amount,
            receipt_confirmed: true
          })
          .eq("id", item.id);

        if (error) {
          console.error("Error updating wallet transaction:", error);
          return false;
        }
      }

      // Update user wallet balance
      const { error: walletError } = await supabase.rpc("increment_wallet_balance", {
        user_id: item.user_id,
        increment_amount: amount
      });

      if (walletError) {
        console.error("Error updating wallet balance:", walletError);
      }

      // Log admin action
      const { error: logError } = await supabase.from("admin_logs").insert({
        action_type: "wallet_management",
        description: `Confirmed deposit of ${amount}€ (ref: ${item.reference})`,
        user_id: item.user_id,
        amount: amount
      });

      if (logError) {
        console.error("Error logging admin action:", logError);
      }

      // Send notification to user
      await notificationService.depositSuccess(amount);

      return true;
    } catch (error) {
      console.error("Error in confirmDeposit:", error);
      return false;
    }
  }

  async rejectDeposit(item: BankTransferItem): Promise<boolean> {
    try {
      const updates = {
        status: "rejected",
        processed: true,
        processed_at: new Date().toISOString()
      };

      if (item.source === "bank_transfers") {
        const { error } = await supabase
          .from("bank_transfers")
          .update(updates)
          .eq("id", item.id);

        if (error) {
          console.error("Error rejecting bank transfer:", error);
          return false;
        }
      } else if (item.source === "wallet_transactions") {
        const { error } = await supabase
          .from("wallet_transactions")
          .update({
            status: "rejected",
            receipt_confirmed: true
          })
          .eq("id", item.id);

        if (error) {
          console.error("Error rejecting wallet transaction:", error);
          return false;
        }
      }

      // Log admin action
      const { error: logError } = await supabase.from("admin_logs").insert({
        action_type: "wallet_management",
        description: `Rejected deposit request (ref: ${item.reference})`,
        user_id: item.user_id
      });

      if (logError) {
        console.error("Error logging admin action:", logError);
      }

      return true;
    } catch (error) {
      console.error("Error in rejectDeposit:", error);
      return false;
    }
  }

  async confirmReceipt(item: BankTransferItem): Promise<boolean> {
    try {
      const updates = {
        receipt_confirmed: true,
        status: "received"
      };

      if (item.source === "bank_transfers") {
        const { error } = await supabase
          .from("bank_transfers")
          .update({
            processed: true
          })
          .eq("id", item.id);

        if (error) {
          console.error("Error confirming receipt:", error);
          return false;
        }
      } else if (item.source === "wallet_transactions") {
        const { error } = await supabase
          .from("wallet_transactions")
          .update({
            receipt_confirmed: true
          })
          .eq("id", item.id);

        if (error) {
          console.error("Error confirming receipt:", error);
          return false;
        }
      }

      // Log admin action
      const { error: logError } = await supabase.from("admin_logs").insert({
        action_type: "wallet_management",
        description: `Confirmed receipt of transfer (ref: ${item.reference})`,
        user_id: item.user_id
      });

      if (logError) {
        console.error("Error logging admin action:", logError);
      }

      return true;
    } catch (error) {
      console.error("Error in confirmReceipt:", error);
      return false;
    }
  }
}

export const bankTransferService = new BankTransferService();
