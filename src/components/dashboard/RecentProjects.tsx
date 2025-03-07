
import { Project } from "@/types/project";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, MapPin, BarChart } from "lucide-react";

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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-bgs-blue">
          Projets récents
        </h2>
        <button 
          onClick={() => setActiveTab("investments")}
          className="text-bgs-orange hover:text-bgs-orange-light transition-colors text-xs font-medium flex items-center"
        >
          Voir tous
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </button>
      </div>
      
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle px-6">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendement mensuel</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-bgs-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Chargement des projets...</span>
                    </div>
                  </td>
                </tr>
              ) : investmentDetails.length > 0 ? (
                investmentDetails.map((investment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={investment.projects?.image || 'https://via.placeholder.com/40'} 
                          alt={investment.projects?.name || 'Projet'} 
                          className="h-10 w-10 rounded-md object-cover mr-3 border border-gray-100"
                        />
                        <div>
                          <div className="font-medium text-bgs-blue text-sm">{investment.projects?.name || 'Projet inconnu'}</div>
                          <div className="text-xs text-bgs-gray-medium flex items-center mt-0.5">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {investment.projects?.location || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-bgs-blue">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        {investment.date ? new Date(investment.date).toLocaleDateString('fr-FR') : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-bgs-blue">
                      {investment.amount?.toLocaleString() || 0} €
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <BarChart className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          {investment.yield_rate || investment.projects?.yield || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        investment.status === 'active' || investment.projects?.status === 'active'
                          ? 'bg-blue-50 text-blue-700' 
                          : investment.status === 'completed' || investment.projects?.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {investment.status === 'active' || investment.projects?.status === 'active' ? 'Actif' : 
                         investment.status === 'completed' || investment.projects?.status === 'completed' ? 'Complété' : 'À venir'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-blue-50 p-3 rounded-full mb-2">
                        <BarChart className="h-6 w-6 text-bgs-blue" />
                      </div>
                      <p className="text-gray-500 font-medium">Aucun investissement trouvé</p>
                      <p className="text-sm text-gray-400 mb-2">Commencez à investir pour voir vos projets ici</p>
                      <button 
                        onClick={() => setActiveTab("investments")}
                        className="mt-2 text-sm text-white bg-bgs-blue px-4 py-2 rounded-lg hover:bg-bgs-blue-light transition-colors"
                      >
                        Découvrir les projets
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
