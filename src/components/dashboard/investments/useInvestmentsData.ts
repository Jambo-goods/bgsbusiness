
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        
        setInvestments(data || []);
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
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:investments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        // When any change happens to investments, refetch
        fetchUserInvestments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
