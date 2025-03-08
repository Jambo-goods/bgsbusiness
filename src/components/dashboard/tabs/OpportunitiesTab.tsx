
import React, { useState, useEffect } from "react";
import { Award, Search } from "lucide-react";
import ProjectsList from "@/components/projects/ProjectsList";
import { projects } from "@/data/projects";
import { Input } from "@/components/ui/input";
import { notificationService } from "@/services/notifications";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function OpportunitiesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    // Démonstration: créer une notification quand l'utilisateur accède à l'onglet des opportunités
    const demoNotification = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session) {
          // Ne créez cette notification que si l'utilisateur est connecté
          const featuredProject = projects.find(p => p.featured);
          
          if (featuredProject) {
            console.log("Creating demo notification for featured project:", featuredProject.name);
            await notificationService.newOpportunityAlert(
              featuredProject.name,
              featuredProject.id,
              `${featuredProject.yield}%`
            );
            
            toast.info("Nouvelle opportunité", {
              description: `Découvrez notre projet ${featuredProject.name}!`
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
      }
    };
    
    // Appeler la fonction pour la démonstration
    // Note: En production, vous voudriez probablement supprimer cette partie
    // et déclencher les notifications uniquement lorsque de nouvelles opportunités sont ajoutées
    demoNotification();
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
          <ProjectsList projects={filteredProjects} />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune opportunité ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
