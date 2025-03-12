
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";

export function useInvestmentsData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterActive, setFilterActive] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [investments, setInvestments] = useState<any[]>([]);
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
          maxInvestment: inv.projects.max_investment,
          price: inv.projects.price,
          profitability: inv.projects.profitability,
          duration: inv.projects.duration,
          category: inv.projects.category,
          fundingProgress: inv.projects.funding_progress
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
      filterActive ? investment.projects?.status === "active" : true
    )
    .filter(investment => 
      investment.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.projects?.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.projects?.name.localeCompare(b.projects?.name);
      if (sortBy === "yield") return b.projects?.yield - a.projects?.yield;
      // Default sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
