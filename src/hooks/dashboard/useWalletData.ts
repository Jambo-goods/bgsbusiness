
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WalletChange } from "./types";

export const useWalletData = (
  userId: string | null,
  walletBalance?: number
): { walletChange: WalletChange } => {
  const [walletChange, setWalletChange] = useState<WalletChange>({
    percentage: "+8.3%",
    value: "↑ 250€",
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

          if (walletBalance && walletBalance > 0) {
            const percentChange = Math.round((netChange / walletBalance) * 100);
            setWalletChange({
              percentage: `${netChange >= 0 ? "+" : "-"}${Math.abs(percentChange)}%`,
              value: `${netChange >= 0 ? "↑" : "↓"} ${Math.abs(netChange)}€`,
            });
            console.log(
              "Updated wallet change:",
              `${netChange >= 0 ? "+" : "-"}${Math.abs(percentChange)}%`
            );
          }
        } else {
          console.log("No wallet transactions found or error occurred");
        }
      } catch (error) {
        console.error("Error in fetchWalletTransactions:", error);
      }
    };

    fetchWalletTransactions();
  }, [userId, walletBalance]);

  return { walletChange };
};
