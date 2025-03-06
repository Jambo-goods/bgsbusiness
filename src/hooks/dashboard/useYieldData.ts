
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { YieldChange } from "./types";

export const useYieldData = (
  userId: string | null
): { monthlyYield: number; annualYield: number; yieldChange: YieldChange } => {
  const [monthlyYield, setMonthlyYield] = useState(1.125);
  const [yieldChange, setYieldChange] = useState<YieldChange>({
    value: "+0.1%",
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
            (sum, inv) => sum + inv.yield_rate * inv.amount,
            0
          );

          const avgMonthlyYield =
            totalInvestment > 0
              ? parseFloat((weightedYield / totalInvestment).toFixed(3))
              : 1.125;

          const previousYield = monthlyYield;
          setMonthlyYield(avgMonthlyYield);

          // Calculate yield change
          const yieldChangeValue = (avgMonthlyYield - previousYield).toFixed(2);
          setYieldChange({
            value: `${parseFloat(yieldChangeValue) >= 0 ? "+" : ""}${yieldChangeValue}%`,
          });
          console.log(
            "Updated monthly yield:",
            avgMonthlyYield,
            "Change:",
            yieldChangeValue
          );
        } else {
          console.log("No active investments found");
        }
      } catch (error) {
        console.error("Error in fetchYieldData:", error);
      }
    };

    fetchYieldData();
  }, [userId, monthlyYield]);

  return { monthlyYield, annualYield, yieldChange };
};
