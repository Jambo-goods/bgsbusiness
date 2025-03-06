
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CapitalTabProps {
  investmentTotal: number;
}

export default function CapitalTab({ investmentTotal }: CapitalTabProps) {
  const [investmentsByProject, setInvestmentsByProject] = useState<{
    projectName: string;
    amount: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvestmentsByProject();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:investments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        // When any change happens to investments, refetch
        fetchInvestmentsByProject();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInvestmentsByProject = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour accéder à vos investissements");
        return;
      }
      
      // Fetch user investments with project details
      const { data, error } = await supabase
        .from('investments')
        .select(`
          amount,
          projects(name)
        `)
        .eq('user_id', session.session.user.id)
        .eq('status', 'active');
        
      if (error) throw error;
      
      // Group investments by project
      const groupedInvestments: Record<string, number> = {};
      
      if (data) {
        data.forEach(inv => {
          const projectName = inv.projects?.name || 'Projet inconnu';
          if (!groupedInvestments[projectName]) {
            groupedInvestments[projectName] = 0;
          }
          groupedInvestments[projectName] += inv.amount;
        });
      }
      
      // Convert to array format for rendering
      const investmentsArray = Object.entries(groupedInvestments).map(([projectName, amount]) => ({
        projectName,
        amount
      }));
      
      setInvestmentsByProject(investmentsArray);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des investissements:", error);
      toast.error("Impossible de récupérer vos investissements");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Capital investi</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-bgs-blue mb-4">{investmentTotal.toLocaleString()} €</div>
          <p className="text-sm text-bgs-gray-medium mb-4">Montant total investi dans les projets actifs.</p>
          
          <div className="space-y-4">
            {investmentsByProject.length > 0 ? (
              investmentsByProject.map((investment, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-bgs-gray-medium">{investment.projectName}</span>
                    <span className="font-medium text-bgs-blue">{investment.amount} €</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-bgs-gray-medium">Aucun investissement actif.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
