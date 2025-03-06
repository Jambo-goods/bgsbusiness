
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { YieldChange } from "./types";
import { toast } from "sonner";

export const useYieldData = (
  userId: string | null
): { monthlyYield: number; annualYield: number; yieldChange: YieldChange } => {
  const [monthlyYield, setMonthlyYield] = useState(0);
  const [yieldChange, setYieldChange] = useState<YieldChange>({
    value: "0%",
  });

  // Calculate yearly yield for display
  const annualYield = monthlyYield * 12;

  useEffect(() => {
    if (!userId) return;

    const fetchYieldData = async () => {
      try {
        // Calculate average yield rate from investments
        const { data: activeInvestments, error: activeInvestmentsError } = await supabase
          .from("investments")
          .select("amount, yield_rate")
          .eq("user_id", userId)
          .eq("status", "active");

        if (activeInvestmentsError) {
          console.error("Error fetching active investments:", activeInvestmentsError);
          return;
        }

        if (activeInvestments && activeInvestments.length > 0) {
          console.log(`Found ${activeInvestments.length} active investments`);
          const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
          const weightedYield = activeInvestments.reduce(
            (sum, inv) => sum + (inv.yield_rate || 0) * inv.amount,
            0
          );

          const avgMonthlyYield =
            totalInvestment > 0
              ? parseFloat((weightedYield / totalInvestment).toFixed(3))
              : 0;

          const previousYield = monthlyYield;
          setMonthlyYield(avgMonthlyYield);

          // Calculate yield change
          const yieldChangeValue = (avgMonthlyYield - previousYield).toFixed(2);
          setYieldChange({
            value: `${parseFloat(yieldChangeValue) >= 0 ? "+" : ""}${yieldChangeValue}%`,
          });
        } else {
          console.log("No active investments found");
          setMonthlyYield(0);
          setYieldChange({
            value: "0%",
          });
        }
      } catch (error) {
        console.error("Error in fetchYieldData:", error);
        toast.error("Erreur lors du calcul des rendements");
      }
    };

    fetchYieldData();
    
    // Set up real-time subscription for yield changes
    const yieldChannel = supabase
      .channel('yield_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments',
        filter: `user_id=eq.${userId}`
      }, () => {
        console.log('Investment data changed, refreshing yield data...');
        fetchYieldData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(yieldChannel);
    };
  }, [userId]);

  return { monthlyYield, annualYield, yieldChange };
};
