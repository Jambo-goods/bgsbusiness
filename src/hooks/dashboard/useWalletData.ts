
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WalletChange } from "./types";
import { toast } from "sonner";

export const useWalletData = (
  userId: string | null,
  walletBalance?: number
): { walletChange: WalletChange } => {
  const [walletChange, setWalletChange] = useState<WalletChange>({
    percentage: "0%",
    value: "0€",
  });

  useEffect(() => {
    if (!userId) return;

    const fetchWalletTransactions = async () => {
      try {
        // Get wallet transactions for the last month
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const { data: walletData, error: walletError } = await supabase
          .from("wallet_transactions")
          .select("amount, type, created_at")
          .eq("user_id", userId)
          .gte("created_at", oneMonthAgo.toISOString());

        if (walletError) {
          console.error("Error fetching wallet data:", walletError);
          return;
        }

        if (walletData && walletData.length > 0) {
          console.log(`Found ${walletData.length} wallet transactions in the last month`);
          const depositsLastMonth = walletData
            .filter((t) => t.type === "deposit")
            .reduce((sum, t) => sum + t.amount, 0);

          const withdrawalsLastMonth = walletData
            .filter((t) => t.type === "withdrawal")
            .reduce((sum, t) => sum + t.amount, 0);

          const netChange = depositsLastMonth - withdrawalsLastMonth;

          // Only calculate percentage if we have balance data and it's not zero
          if (walletBalance && walletBalance > 0) {
            const percentChange = Math.round((netChange / walletBalance) * 100);
            setWalletChange({
              percentage: `${netChange >= 0 ? "+" : ""}${Math.abs(percentChange)}%`,
              value: `${netChange >= 0 ? "↑" : "↓"} ${Math.abs(netChange)}€`,
            });
          } else {
            // Just show absolute change if we can't calculate percentage
            setWalletChange({
              percentage: `${netChange >= 0 ? "+" : ""}${Math.abs(netChange)}€`,
              value: `${netChange >= 0 ? "↑" : "↓"} ${Math.abs(netChange)}€`,
            });
          }
        } else {
          // No transactions found, set neutral values
          setWalletChange({
            percentage: "0%",
            value: "0€",
          });
        }
      } catch (error) {
        console.error("Error in fetchWalletTransactions:", error);
        toast.error("Erreur lors de la récupération des données de votre portefeuille");
      }
    };

    fetchWalletTransactions();
    
    // Set up real-time subscription for wallet transactions
    const walletChannel = supabase
      .channel('wallet_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `user_id=eq.${userId}`
      }, () => {
        console.log('Wallet transaction detected, refreshing wallet data...');
        fetchWalletTransactions();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(walletChannel);
    };
  }, [userId, walletBalance]);

  return { walletChange };
};
