
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvestmentChange, ProjectsChange } from "./types";

export const useInvestmentData = (
  userId: string | null,
  investmentTotal: number
): { investmentChange: InvestmentChange; projectsChange: ProjectsChange } => {
  const [investmentChange, setInvestmentChange] = useState<InvestmentChange>({
    percentage: "+12.5%",
    value: "↑ 1250€",
  });
  const [projectsChange, setProjectsChange] = useState<ProjectsChange>({
    value: "+2",
  });

  useEffect(() => {
    if (!userId) return;

    const fetchInvestmentData = async () => {
      try {
        // Get investments for the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select("amount, project_id, date")
          .eq("user_id", userId)
          .gte("date", threeMonthsAgo.toISOString());

        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError);
          return;
        }

        if (investmentsData && investmentsData.length > 0) {
          console.log(`Found ${investmentsData.length} investments in the last 3 months`);

          // Calculate new projects count in last 3 months
          const uniqueProjectsLastThreeMonths = new Set(
            investmentsData.map((inv) => inv.project_id)
          ).size;
          setProjectsChange({
            value: `${uniqueProjectsLastThreeMonths > 0 ? "+" : ""}${uniqueProjectsLastThreeMonths}`,
          });
          console.log("Updated projects change:", uniqueProjectsLastThreeMonths);

          // Calculate investment change in last month
          const lastMonthInvestments = investmentsData
            .filter((inv) => new Date(inv.date) >= oneMonthAgo)
            .reduce((sum, inv) => sum + inv.amount, 0);

          if (investmentTotal > 0) {
            const investPercentChange = Math.round(
              (lastMonthInvestments / investmentTotal) * 100
            );
            setInvestmentChange({
              percentage: `${lastMonthInvestments > 0 ? "+" : ""}${investPercentChange}%`,
              value: `${lastMonthInvestments > 0 ? "↑" : "↓"} ${Math.abs(
                lastMonthInvestments
              )}€`,
            });
            console.log(
              "Updated investment change:",
              `${lastMonthInvestments > 0 ? "+" : ""}${investPercentChange}%`
            );
          }
        } else {
          console.log("No investments found in the last 3 months");
        }
      } catch (error) {
        console.error("Error in fetchInvestmentData:", error);
      }
    };

    fetchInvestmentData();
  }, [userId, investmentTotal]);

  return { investmentChange, projectsChange };
};
