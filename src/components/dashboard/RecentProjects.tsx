
import { Project } from "@/types/project";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentProjectsProps {
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function RecentProjects({ userInvestments, setActiveTab }: RecentProjectsProps) {
  const [investmentDetails, setInvestmentDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadInvestmentDetails = async () => {
      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const { data, error } = await supabase
          .from('investments')
          .select(`
            amount, 
            date, 
            yield_rate, 
            status,
            projects(id, name, image, location, status, yield)
          `)
          .eq('user_id', session.session.user.id)
          .order('date', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        setInvestmentDetails(data || []);
      } catch (error) {
        console.error("Error loading investment details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInvestmentDetails();
  }, [userInvestments]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-sm font-medium text-bgs-blue mb-4">
        Projets récents
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Projet</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Montant</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Rendement mensuel</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                  Chargement des projets...
                </td>
              </tr>
            ) : investmentDetails.length > 0 ? (
              investmentDetails.map((investment, index) => (
                <tr key={index} className="hover:bg-bgs-gray-light/50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={investment.projects?.image || 'https://via.placeholder.com/40'} 
                        alt={investment.projects?.name || 'Projet'} 
                        className="h-8 w-8 rounded-md object-cover mr-2"
                      />
                      <div>
                        <div className="font-medium text-bgs-blue text-xs">{investment.projects?.name || 'Projet inconnu'}</div>
                        <div className="text-xs text-bgs-gray-medium">{investment.projects?.location || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-bgs-blue">
                    {investment.date ? new Date(investment.date).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-bgs-blue">
                    {investment.amount?.toLocaleString() || 0} €
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                      {investment.yield_rate || investment.projects?.yield || 0}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      investment.status === 'active' || investment.projects?.status === 'active'
                        ? 'bg-blue-100 text-blue-600' 
                        : investment.status === 'completed' || investment.projects?.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {investment.status === 'active' || investment.projects?.status === 'active' ? 'Actif' : 
                       investment.status === 'completed' || investment.projects?.status === 'completed' ? 'Complété' : 'À venir'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                  Aucun investissement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
        <button 
          onClick={() => setActiveTab("investments")}
          className="text-bgs-orange hover:text-bgs-orange-light transition-colors text-xs font-medium"
        >
          Voir tous mes investissements
        </button>
      </div>
    </div>
  );
}
