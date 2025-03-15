
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fonction pour mettre à jour le nombre de vues d'un projet
export const incrementProjectViews = async (projectId: string): Promise<void> => {
  try {
    // Get current view count
    const { data, error } = await supabase
      .from('projects')
      .select('views')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error("Error fetching project views:", error);
      return;
    }
    
    const currentViews = data?.views || 0;
    
    // Update view count
    const { error: updateError } = await supabase
      .from('projects')
      .update({ views: currentViews + 1 })
      .eq('id', projectId);
    
    if (updateError) {
      console.error("Error updating project views:", updateError);
    }
  } catch (error) {
    console.error("Error in incrementProjectViews:", error);
  }
};

// Fonction pour calculer le montant d'un investissement en fonction d'unités
export const calculateInvestmentAmount = (
  unitPrice: number, 
  units: number, 
  minUnits: number
): number => {
  // Ensure at least minimum units
  const validUnits = Math.max(units, minUnits);
  return unitPrice * validUnits;
};

// Fonction pour calculer le rendement mensuel
export const calculateMonthlyYield = (amount: number, yieldRate: number): number => {
  return (amount * (yieldRate / 100));
};

// Fonction pour calculer le rendement annuel
export const calculateAnnualYield = (amount: number, yieldRate: number): number => {
  return calculateMonthlyYield(amount, yieldRate) * 12;
};

// Fonction pour vérifier si l'utilisateur a investi dans un projet
export const hasUserInvestedInProject = async (
  userId: string, 
  projectId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .limit(1);
    
    if (error) {
      console.error("Error checking user investments:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error in hasUserInvestedInProject:", error);
    return false;
  }
};

// Fonction pour mettre à jour les informations d'un projet
export const updateProject = async (project: Partial<Project> & { id: string }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', project.id);
    
    if (error) {
      console.error("Error updating project:", error);
      toast.error("Erreur lors de la mise à jour du projet", {
        description: error.message
      });
      return false;
    }
    
    toast.success("Projet mis à jour avec succès");
    return true;
  } catch (error) {
    console.error("Error in updateProject:", error);
    toast.error("Une erreur s'est produite");
    return false;
  }
};
