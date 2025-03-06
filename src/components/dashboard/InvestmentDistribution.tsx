
import { Progress } from "@/components/ui/progress";
import { ChevronRightIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvestmentDistributionProps {
  setActiveTab: (tab: string) => void;
}

export default function InvestmentDistribution({ setActiveTab }: InvestmentDistributionProps) {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
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
      
    fetchUserInvestments();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  async function fetchUserInvestments() {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        setInvestments([]);
        setTotalInvested(0);
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
      
      // Calculate total invested amount
      const total = (data || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
      setTotalInvested(total);
      
      // Group investments by project
      const groupedInvestments = (data || []).reduce((acc, inv) => {
        const projectId = inv.project_id;
        if (!acc[projectId]) {
          acc[projectId] = {
            project: inv.projects,
            totalAmount: 0,
            investments: []
          };
        }
        acc[projectId].totalAmount += inv.amount;
        acc[projectId].investments.push(inv);
        return acc;
      }, {});
      
      setInvestments(Object.values(groupedInvestments));
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos investissements",
        variant: "destructive"
      });
      setInvestments([]);
      setTotalInvested(0);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-bgs-blue">
          Répartition
        </h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-bgs-orange"></div>
        </div>
      ) : investments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-bgs-gray-medium">Aucun investissement trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map((item: any, index) => (
            <div key={index}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-bgs-gray-medium">{item.project.name} ({item.project.yield}% par mois)</span>
                <span className="font-medium text-bgs-blue">{item.totalAmount} €</span>
              </div>
              <Progress 
                value={totalInvested > 0 ? (item.totalAmount / totalInvested) * 100 : 0} 
                className="h-1 bg-gray-100" 
                indicatorClassName={
                  index % 3 === 0 ? "bg-bgs-orange" : 
                  index % 3 === 1 ? "bg-blue-500" : "bg-green-500"
                } 
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button 
          onClick={() => setActiveTab("investments")}
          className="flex items-center justify-between w-full text-bgs-orange hover:text-bgs-orange-light transition-colors text-xs font-medium"
        >
          <span>Voir tous mes investissements</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
