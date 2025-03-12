
import { useEffect, useState } from "react";
import { DashboardCardData, UserData } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardCardsData = (userData: UserData | null): DashboardCardData => {
  const [dashboardData, setDashboardData] = useState<DashboardCardData>({
    monthlyYield: 0,
    annualYield: 0,
    walletChange: { percentage: "0%", value: "0€" },
    investmentChange: { percentage: "0%", value: "0€" },
    projectsChange: { value: "0" },
    yieldChange: { value: "0%" }
  });

  useEffect(() => {
    if (!userData) return;
    
    // Fetch user's investments to calculate yield
    const fetchInvestmentsAndCalculateYield = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log("No active session found for yield calculation");
          return;
        }
        
        // Fetch user's investments with project data
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select(`
            amount, 
            yield_rate,
            project_id,
            projects (
              name,
              yield
            )
          `)
          .eq('user_id', sessionData.session.user.id)
          .eq('status', 'active');
          
        if (investmentsError) {
          console.error("Error fetching investments for yield calculation:", investmentsError);
          return;
        }
        
        if (!investmentsData || investmentsData.length === 0) {
          console.log("No active investments found for yield calculation");
          return;
        }
        
        // Calculate the weighted monthly yield
        let totalInvestment = 0;
        let weightedMonthlyYield = 0;
        
        investmentsData.forEach(investment => {
          const yieldRate = investment.yield_rate || investment.projects?.yield || 0;
          totalInvestment += investment.amount;
          weightedMonthlyYield += (yieldRate / 100) * investment.amount;
        });
        
        // Calculate the average monthly yield percentage
        const monthlyYieldPercentage = totalInvestment > 0 
          ? (weightedMonthlyYield / totalInvestment) * 100 
          : 0;
        
        // Calculate the annual yield (monthly * 12)
        const annualYieldPercentage = monthlyYieldPercentage * 12;
        
        // Update the dashboard data with calculated values
        setDashboardData(prevData => ({
          ...prevData,
          monthlyYield: parseFloat(monthlyYieldPercentage.toFixed(2)),
          annualYield: parseFloat(annualYieldPercentage.toFixed(2)),
          yieldChange: { value: `+${parseFloat((monthlyYieldPercentage * 0.05).toFixed(2))}%` }
        }));
        
      } catch (error) {
        console.error("Error calculating yield data:", error);
      }
    };
    
    fetchInvestmentsAndCalculateYield();
  }, [userData]);

  return dashboardData;
};
