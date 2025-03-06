
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const createProjectInDatabase = async (project: Project, toast: any) => {
  try {
    console.log("Création du projet dans la base de données:", project.name);
    
    // Vérifier si le projet existe déjà par son nom
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .eq('name', project.name)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erreur lors de la vérification du projet existant:", checkError);
    }
    
    // Si le projet existe déjà, retourner son ID
    if (existingProject) {
      console.log("Le projet existe déjà, utilisation de l'ID existant:", existingProject.id);
      return existingProject.id;
    }
    
    // Sinon, créer un nouveau projet
    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        company_name: project.companyName,
        description: project.description,
        duration: project.duration,
        location: project.location,
        min_investment: project.minInvestment,
        category: project.category,
        price: project.price,
        yield: project.yield,
        funding_progress: project.fundingProgress,
        featured: project.featured || false,
        possible_durations: project.possibleDurations,
        status: project.status || 'active',
        profitability: project.profitability,
        image: project.image
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error("Erreur lors de la création du projet:", insertError);
      throw new Error("Impossible de créer le projet dans la base de données");
    }
    
    console.log("Projet créé avec succès:", newProject);
    toast({
      title: "Projet créé",
      description: `Le projet ${project.name} a été créé avec succès dans la base de données.`
    });
    
    return newProject.id;
  } catch (error) {
    console.error("Erreur dans createProjectInDatabase:", error);
    throw error;
  }
};

// Fonction pour créer un projet de poules pondeuses
export const createLayingHensProject = async (toast: any) => {
  const layingHensProject: Project = {
    id: "laying-hens",
    name: "BGS Poules Pondeuses",
    companyName: "BGS Aviculture",
    description: "Acquisition de poules pondeuses et construction d'installations modernes pour la production d'œufs biologiques destinés aux marchés locaux et à l'exportation.",
    profitability: 14,
    duration: "18 mois",
    location: "Afrique Centrale",
    status: "active",
    minInvestment: 2000,
    category: "Agriculture",
    price: 85000,
    yield: 14,
    fundingProgress: 35,
    featured: true,
    possibleDurations: [6, 12, 18, 24],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1569283864533-f9c2b6ae940f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  };
  
  try {
    const projectId = await createProjectInDatabase(layingHensProject, toast);
    console.log("Projet de poules pondeuses créé avec l'ID:", projectId);
    return projectId;
  } catch (error) {
    console.error("Erreur lors de la création du projet de poules pondeuses:", error);
    toast({
      title: "Erreur",
      description: "Impossible de créer le projet de poules pondeuses. Veuillez réessayer.",
      variant: "destructive"
    });
    throw error;
  }
};
