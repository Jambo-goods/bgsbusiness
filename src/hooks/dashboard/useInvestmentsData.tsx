
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { projects } from "@/data/projects";

interface InvestmentsDataReturn {
  userInvestments: Project[];
  isLoading: boolean;
  refreshInvestmentsData: () => Promise<void>;
}

export const useInvestmentsData = (userId: string | null): InvestmentsDataReturn => {
  const [userInvestments, setUserInvestments] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestmentsData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('project_id, amount, duration, yield_rate, date, status')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (investmentsError) {
        console.error("Investments fetch error:", investmentsError);
      }
      
      // Get actual project details for each investment
      let userProjects: Project[] = [];
      
      if (investmentsData && investmentsData.length > 0) {
        // Get unique project IDs
        const projectIds = [...new Set(investmentsData.map(inv => inv.project_id))];
        
        // Fetch project details from Supabase
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);
          
        if (projectsError) {
          console.error("Projects fetch error:", projectsError);
        }
        
        if (projectsData) {
          // Combine with investment data and map to Project type
          userProjects = projectsData.map(project => {
            const investment = investmentsData.find(inv => inv.project_id === project.id);
            return {
              id: project.id,
              name: project.name,
              companyName: project.company_name,
              description: project.description,
              profitability: project.profitability,
              duration: project.duration,
              location: project.location,
              status: project.status as "upcoming" | "active" | "completed",
              minInvestment: project.min_investment,
              image: project.image,
              category: project.category,
              price: project.price,
              yield: project.yield,
              fundingProgress: project.funding_progress,
              featured: project.featured,
              possibleDurations: project.possible_durations,
              startDate: project.start_date,
              endDate: project.end_date,
              raised: project.raised,
              target: project.target,
              investedAmount: investment ? investment.amount : 0,
              investmentDate: investment ? investment.date : null,
              firstPaymentDelayMonths: project.first_payment_delay_months || 1
            };
          });
        }
      }
      
      // Check for recent investment to add
      const recentInvestment = localStorage.getItem("recentInvestment");
      if (recentInvestment) {
        const investmentData = JSON.parse(recentInvestment);
        
        // Find the project in the projects list
        const project = projects.find(p => p.id === investmentData.projectId);
        
        // If the project exists and it's not already in the investments list
        if (project && !userProjects.some(i => i.id === project.id)) {
          // Add the project to the beginning of the list
          userProjects = [project as Project, ...userProjects];
        }
        
        // Remove from local storage to prevent showing again on refresh
        localStorage.removeItem("recentInvestment");
      }
      
      setUserInvestments(userProjects);
      
    } catch (error) {
      console.error("Error fetching investments data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchInvestmentsData();
    }
  }, [userId, fetchInvestmentsData]);

  return {
    userInvestments,
    isLoading,
    refreshInvestmentsData: fetchInvestmentsData
  };
};
