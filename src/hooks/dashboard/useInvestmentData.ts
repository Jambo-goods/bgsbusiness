
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InvestmentChange, ProjectsChange } from "./types";
import { toast } from "sonner";

export const useInvestmentData = (
  userId: string | null
): { 
  investmentChange: InvestmentChange; 
  projectsChange: ProjectsChange;
  investmentTotal: number;
  activeProjectsCount: number;
} => {
  const [investmentChange, setInvestmentChange] = useState<InvestmentChange>({
    percentage: "0%",
    value: "0€",
  });
  const [projectsChange, setProjectsChange] = useState<ProjectsChange>({
    value: "0",
  });
  const [investmentTotal, setInvestmentTotal] = useState<number>(0);
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;

    const fetchInvestmentData = async () => {
      try {
        // Get all active investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select("amount, project_id, date, status")
          .eq("user_id", userId)
          .eq("status", "active");

        if (investmentsError) {
          console.error("Error fetching investments:", investmentsError);
          return;
        }

        if (investmentsData && investmentsData.length > 0) {
          console.log(`Found ${investmentsData.length} investments`);

          // Calculate active projects count
          const uniqueActiveProjects = new Set(
            investmentsData.map((inv) => inv.project_id)
          );
          
          const activeProjects = uniqueActiveProjects.size;
          setActiveProjectsCount(activeProjects);
          
          // Calculate total investment amount from active investments
          const totalInvestment = investmentsData
            .reduce((sum, inv) => sum + inv.amount, 0);
          
          setInvestmentTotal(totalInvestment);

          // Calculate new projects count in last 3 months for change indicator
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          const recentInvestments = investmentsData
            .filter((inv) => new Date(inv.date) >= threeMonthsAgo);
          
          const uniqueProjectsLastThreeMonths = new Set(
            recentInvestments.map((inv) => inv.project_id)
          ).size;
          
          setProjectsChange({
            value: `${uniqueProjectsLastThreeMonths > 0 ? "+" : ""}${uniqueProjectsLastThreeMonths}`,
          });

          // Calculate investment change in last month
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          const lastMonthInvestments = investmentsData
            .filter((inv) => new Date(inv.date) >= oneMonthAgo)
            .reduce((sum, inv) => sum + inv.amount, 0);

          if (totalInvestment > 0) {
            const investPercentChange = Math.round(
              (lastMonthInvestments / totalInvestment) * 100
            );
            setInvestmentChange({
              percentage: `${lastMonthInvestments > 0 ? "+" : ""}${investPercentChange}%`,
              value: `${lastMonthInvestments > 0 ? "↑" : "↓"} ${Math.abs(
                lastMonthInvestments
              )}€`,
            });
          } else if (lastMonthInvestments > 0) {
            // If no total but there are new investments
            setInvestmentChange({
              percentage: "+100%",
              value: `↑ ${lastMonthInvestments}€`,
            });
          }
        } else {
          // No investments found
          setProjectsChange({
            value: "0",
          });
          setInvestmentChange({
            percentage: "0%",
            value: "0€",
          });
          setInvestmentTotal(0);
          setActiveProjectsCount(0);
        }
      } catch (error) {
        console.error("Error in fetchInvestmentData:", error);
        toast.error("Erreur lors de la récupération des données d'investissement");
      }
    };

    fetchInvestmentData();
    
    // Set up real-time subscription for investments
    const investmentsChannel = supabase
      .channel('investments_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments',
        filter: `user_id=eq.${userId}`
      }, () => {
        console.log('Investment data changed, refreshing investment data...');
        fetchInvestmentData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(investmentsChannel);
    };
  }, [userId]);

  return { 
    investmentChange, 
    projectsChange, 
    investmentTotal, 
    activeProjectsCount 
  };
};
