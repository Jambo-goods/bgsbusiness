
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";
import { SearchIcon, FilterIcon, ArrowUpDownIcon } from "lucide-react";
import { useState } from "react";

interface InvestmentsProps {
  userInvestments: Project[];
}

export default function Investments({ userInvestments }: InvestmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterActive, setFilterActive] = useState(false);
  
  // Filtered and sorted investments
  const filteredInvestments = userInvestments
    .filter(project => 
      filterActive ? project.status === "active" : true
    )
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "yield") return b.yield - a.yield;
      // Default sort by date (newest first)
      return -1; // Simulating date sort (in a real app, we'd compare actual dates)
    });
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-bgs-blue">
            Mes investissements
          </h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bgs-gray-medium h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-bgs-orange"
              />
            </div>
            
            <button 
              onClick={() => setFilterActive(!filterActive)}
              className={`p-2 rounded-lg border ${filterActive ? 'bg-bgs-blue text-white border-bgs-blue' : 'border-gray-200 text-bgs-gray-medium'}`}
            >
              <FilterIcon className="h-4 w-4" />
            </button>
            
            <div className="relative">
              <button className="p-2 rounded-lg border border-gray-200 text-bgs-gray-medium">
                <ArrowUpDownIcon className="h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white shadow-md rounded-lg border border-gray-100 z-10 hidden">
                <div className="p-2">
                  <button 
                    onClick={() => setSortBy("date")}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                  >
                    Date (récent)
                  </button>
                  <button 
                    onClick={() => setSortBy("name")}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                  >
                    Nom (A-Z)
                  </button>
                  <button 
                    onClick={() => setSortBy("yield")}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                  >
                    Rendement (élevé-bas)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredInvestments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-bgs-gray-medium">Aucun investissement trouvé</p>
            </div>
          ) : (
            filteredInvestments.map((project) => (
              <div key={project.id} className="border bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="w-full md:w-48 h-40 object-cover"
                  />
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-bgs-blue text-lg mb-1">{project.name}</h3>
                        <p className="text-sm text-bgs-gray-medium mb-2">{project.location}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-blue-100 text-blue-600' 
                          : project.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Complété' : 'À venir'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-bgs-gray-medium">Progression</span>
                        <span className="font-medium text-bgs-blue">{project.fundingProgress}%</span>
                      </div>
                      <Progress value={project.fundingProgress} className="h-1.5 bg-gray-100" indicatorClassName="bg-bgs-orange" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Montant investi</p>
                        <p className="font-semibold text-bgs-blue">2500 €</p>
                      </div>
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Rendement</p>
                        <p className="font-semibold text-green-500">{project.yield}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Date</p>
                        <p className="font-semibold text-bgs-blue">15/03/2023</p>
                      </div>
                      <div>
                        <p className="text-xs text-bgs-gray-medium">Duration</p>
                        <p className="font-semibold text-bgs-blue">{project.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            to="/projects" 
            className="btn-primary inline-block"
          >
            Découvrir de nouveaux projets
          </Link>
        </div>
      </div>
    </div>
  );
}
