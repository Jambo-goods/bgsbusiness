
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
