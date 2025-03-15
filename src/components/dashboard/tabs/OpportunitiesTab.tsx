
import React, { useState, useEffect } from "react";
import { Award, Search, Bell } from "lucide-react";
import ProjectsList from "@/components/projects/ProjectsList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

export default function OpportunitiesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifiedProjects, setNotifiedProjects] = useState<Set<string>>(new Set());

  // Load projects from database only
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        const dbProjects = await fetchProjectsFromDatabase();
        setProjects(dbProjects || []);
        setFilteredProjects(dbProjects || []);
      } catch (error) {
        console.error("Error loading database projects:", error);
        toast.error("Erreur de chargement", {
          description: "Impossible de charger les projets depuis la base de données."
        });
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);

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

  // Fonction pour notifier manuellement une opportunité
  const notifyOpportunity = (project: Project) => {
    if (notifiedProjects.has(project.id)) {
      toast.info("Déjà notifié", {
        description: `${project.name} a déjà été notifié comme opportunité.`
      });
      return;
    }

    notificationService.newInvestmentOpportunity(project.name, project.id);
    
    // Marquer comme notifié
    setNotifiedProjects(prev => {
      const updated = new Set(prev);
      updated.add(project.id);
      return updated;
    });
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
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une opportunité..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 bg-gray-50"
            />
          </div>
          
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Bell className="h-4 w-4 mr-2" />
            Activer les notifications
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
          </div>
        ) : (
          filteredProjects.length > 0 ? (
            <div className="space-y-4">
              {/* Section d'opportunités avec boutons de notification */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredProjects.slice(0, 3).map(project => (
                  <div key={`featured-${project.id}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-blue-700">{project.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => notifyOpportunity(project)}
                        className="text-xs"
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Notifier
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.companyName}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{project.yield}% rendement</span>
                      <span>{project.location}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <ProjectsList projects={filteredProjects} />
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucune opportunité ne correspond à votre recherche.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
