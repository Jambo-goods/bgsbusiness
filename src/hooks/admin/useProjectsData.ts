
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  yield: number;
  duration: string;
  funding_progress: number;
  location: string;
  min_investment: number;
  price: number;
  profitability: number;
  status: string;
  company_name: string;
  created_at: string | null;
  updated_at: string | null;
  target: number | null;
  raised: number | null;
  featured: boolean | null;
}

export const useProjectsData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchProjects();
    
    // Rafraîchir les données toutes les 60 secondes
    const interval = setInterval(() => {
      fetchProjects();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching projects data...");
      
      const { data, error, count } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Erreur lors du chargement des projets');
        return;
      }

      console.log('Projects fetched successfully:', data);
      console.log('Total projects count:', count);
      
      setProjects(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    isLoading,
    totalCount,
    refreshProjects: fetchProjects
  };
};
