
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";
import { SearchIcon, FilterIcon, ArrowUpDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvestmentsProps {
  userInvestments: Project[];
}

export default function Investments({ userInvestments }: InvestmentsProps) {
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
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-base font-medium text-bgs-blue">
            Mes investissements
          </h2>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-60">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-bgs-gray-medium h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 w-full border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-bgs-orange"
              />
            </div>
            
            <button 
              onClick={() => setFilterActive(!filterActive)}
              className={`p-1.5 rounded-md border ${filterActive ? 'bg-bgs-blue text-white border-bgs-blue' : 'border-gray-200 text-bgs-gray-medium'}`}
            >
              <FilterIcon className="h-3.5 w-3.5" />
            </button>
            
            <div className="relative">
              <button 
                className="p-1.5 rounded-md border border-gray-200 text-bgs-gray-medium"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <ArrowUpDownIcon className="h-3.5 w-3.5" />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white shadow-md rounded-md border border-gray-100 z-10">
                  <div className="p-1">
                    <button 
                      onClick={() => {
                        setSortBy("date");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-50"
                    >
                      Date (récent)
                    </button>
                    <button 
                      onClick={() => {
                        setSortBy("name");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-50"
                    >
                      Nom (A-Z)
                    </button>
                    <button 
                      onClick={() => {
                        setSortBy("yield");
                        setShowSortMenu(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-xs rounded-md hover:bg-gray-50"
                    >
                      Rendement (élevé-bas)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-orange"></div>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-bgs-gray-medium">Aucun investissement trouvé</p>
            </div>
          ) : (
            filteredInvestments.map((investment) => (
              <div key={investment.id} className="border bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <img 
                    src={investment.projects?.image} 
                    alt={investment.projects?.name} 
                    className="w-full md:w-40 h-32 object-cover"
                  />
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-bgs-blue text-sm mb-0.5">{investment.projects?.name}</h3>
                        <p className="text-xs text-bgs-gray-medium mb-2">{investment.projects?.location}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        investment.projects?.status === 'active' 
                          ? 'bg-blue-100 text-blue-600' 
                          : investment.projects?.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {investment.projects?.status === 'active' ? 'Actif' : investment.projects?.status === 'completed' ? 'Complété' : 'À venir'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-bgs-blue/80 mb-3 line-clamp-1">
                      {investment.projects?.description}
                    </p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-bgs-gray-medium">Progression</span>
                        <span className="font-medium text-bgs-blue">{investment.projects?.fundingProgress}%</span>
                      </div>
                      <Progress value={investment.projects?.fundingProgress} className="h-1 bg-gray-100" indicatorClassName="bg-bgs-orange" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Montant investi</p>
                        <p className="font-medium text-bgs-blue text-sm">{investment.amount} €</p>
                      </div>
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Rendement mensuel</p>
                        <p className="font-medium text-green-500 text-sm">{investment.projects?.yield}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Date</p>
                        <p className="font-medium text-bgs-blue text-sm">{new Date(investment.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Duration</p>
                        <p className="font-medium text-bgs-blue text-sm">{investment.duration} mois</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            to="/projects" 
            className="text-sm text-bgs-blue hover:text-bgs-orange px-4 py-1.5 rounded-md border border-bgs-blue hover:border-bgs-orange transition-colors inline-block"
          >
            Découvrir de nouveaux projets
          </Link>
        </div>
      </div>
    </div>
  );
}
