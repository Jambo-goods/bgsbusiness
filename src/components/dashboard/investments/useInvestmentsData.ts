
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";

export function useInvestmentsData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterActive, setFilterActive] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [investments, setInvestments] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserInvestments() {
      setIsLoading(true);
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          setInvestments([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('investments')
          .select(`
            *,
            projects(*)
          `)
          .eq('user_id', user.user.id);
          
        if (error) {
          console.error("Erreur lors du chargement des investissements:", error);
          throw error;
        }
        
        const mappedProjects: Project[] = data?.map(inv => ({
          id: inv.projects.id,
          name: inv.projects.name,
          image: inv.projects.image || '',
          companyName: inv.projects.company_name,
          status: inv.projects.status as "active" | "upcoming" | "completed",
          investedAmount: inv.amount,
          yield: inv.projects.yield,
          description: inv.projects.description || '',
          location: inv.projects.location || '',
          minInvestment: inv.projects.min_investment,
          maxInvestment: undefined, // Remove this property as it's not in the type
          price: inv.projects.price,
          profitability: inv.projects.profitability,
          duration: inv.projects.duration,
          category: inv.projects.category,
          fundingProgress: inv.projects.funding_progress,
          firstPaymentDelayMonths: inv.projects.first_payment_delay_months,
          featured: inv.projects.featured,
          possibleDurations: inv.projects.possible_durations,
          startDate: inv.projects.start_date,
          endDate: inv.projects.end_date,
          raised: inv.projects.raised,
          target: inv.projects.target
        })) || [];
        
        setInvestments(mappedProjects);
      } catch (error) {
        console.error("Erreur:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos investissements",
          variant: "destructive"
        });
        setInvestments([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserInvestments();
  }, [toast]);

  // Filtered and sorted investments
  const filteredInvestments = investments
    .filter(investment => 
      filterActive ? investment.status === "active" : true
    )
    .filter(investment => 
      investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "yield") return b.yield - a.yield;
      // Default sort by date (newest first)
      return new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime();
    });

  return {
    isLoading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterActive,
    setFilterActive,
    showSortMenu,
    setShowSortMenu,
    filteredInvestments
  };
}
