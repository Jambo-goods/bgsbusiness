
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";

/**
 * Fetches projects from the Supabase database
 */
export const fetchProjectsFromDatabase = async (): Promise<Project[]> => {
  console.log("Début de la récupération des projets depuis la base de données");
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      throw error;
    }
    
    console.log(`${data?.length || 0} projets récupérés depuis la base de données`);
    return data || [];
  } catch (error) {
    console.error("Exception lors de la récupération des projets:", error);
    return [];
  }
};

/**
 * Fetches a single project by ID
 */
export const fetchProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération du projet ${projectId}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Exception lors de la récupération du projet ${projectId}:`, error);
    return null;
  }
};
