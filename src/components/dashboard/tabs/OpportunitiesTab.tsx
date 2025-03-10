
import React, { useState } from "react";
import { Award, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { projects } from "@/data/projects";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";

export default function OpportunitiesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        project => 
          project.name.toLowerCase().includes(query) ||
          project.companyName.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query)
      );
      setFilteredProjects(filtered);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non définie";
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error("Date parsing error:", error);
      return "Date non valide";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-bgs-blue" />
          <h2 className="text-2xl font-semibold text-bgs-blue">Opportunités d'investissement</h2>
        </div>
      </div>
      
      <p className="text-gray-600">
        Découvrez toutes les opportunités d'investissement disponibles et investissez directement depuis votre tableau de bord.
      </p>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une opportunité..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 bg-gray-50"
          />
        </div>
        
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <Link to={`/project/${project.id}`} key={project.id} className="glass-card overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="w-full h-48 object-cover"
                  />
                  {project.featured && (
                    <div className="absolute top-3 right-3 bg-bgs-orange text-white text-xs font-medium px-2 py-1 rounded-full">
                      Populaire
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-bgs-orange/10 text-bgs-orange mb-2">
                    {project.category}
                  </span>
                  <h3 className="text-lg font-semibold text-bgs-blue mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-bgs-blue/70 mb-2">
                    {project.location}
                  </p>
                  <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-bgs-blue/70">Progression</span>
                      <span className="text-xs font-medium text-bgs-blue">
                        {project.fundingProgress}%
                      </span>
                    </div>
                    <Progress value={project.fundingProgress} className="h-1.5" />
                  </div>
                  
                  {project.firstPaymentDate && (
                    <div className="flex items-center mb-4 text-xs text-bgs-blue/70">
                      <Calendar size={14} className="mr-1 text-bgs-blue/60" />
                      <span>Premier versement: {formatDate(project.firstPaymentDate)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-bgs-blue/60">Prix</p>
                      <p className="text-base font-semibold text-bgs-blue">
                        {project.price.toLocaleString()} €
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-bgs-blue/60">Rendement</p>
                      <p className="text-base font-semibold text-green-500">
                        {project.yield}% mensuel
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune opportunité ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
