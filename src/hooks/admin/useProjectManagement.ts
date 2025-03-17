
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { logAdminAction } from '@/services/adminAuthService';
import { validateProjectForm, FormDataType } from '@/components/admin/projects/ProjectFormValidator';

export const useProjectManagement = (adminUserId?: string) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    company_name: '',
    description: '',
    location: '',
    image: '',
    price: '',
    yield: '',
    min_investment: '',
    duration: '',
    category: '',
    status: 'active',
    funding_progress: '0',
    possible_durations: '',
    profitability: ''
  });

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Erreur lors du chargement des projets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = validateProjectForm(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Handling submit project");
    
    // Validate the form
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    
    try {
      // Parse numeric values
      const projectData = {
        ...formData,
        price: parseInt(formData.price),
        yield: parseFloat(formData.yield),
        profitability: parseFloat(formData.profitability),
        min_investment: parseInt(formData.min_investment),
        funding_progress: parseInt(formData.funding_progress) || 0,
        possible_durations: formData.possible_durations ? 
          formData.possible_durations.split(',').map(d => parseInt(d.trim())) : 
          [] // Ensure it's always an array, empty if no values
      };
      
      console.log("Submitting project data:", projectData);
      
      let result;
      
      if (editingProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)
          .select();
          
        if (error) {
          console.error("Error updating project:", error);
          throw error;
        }
        result = data?.[0];
        
        // Log admin action if adminUserId is provided
        if (adminUserId) {
          await logAdminAction(
            adminUserId,
            'project_management',
            `Modification du projet "${formData.name}"`,
            undefined,
            editingProject.id
          );
        }
        
        toast.success(`Le projet ${formData.name} a été mis à jour`);
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select();
          
        if (error) {
          console.error("Error details:", error);
          throw error;
        }
        result = data?.[0];
        
        // Log admin action if adminUserId is provided
        if (adminUserId) {
          await logAdminAction(
            adminUserId,
            'project_management',
            `Création du projet "${formData.name}"`,
            undefined,
            result?.id
          );
        }
        
        toast.success(`Le projet ${formData.name} a été créé`);
      }
      
      // Reset form and close modal
      resetForm();
      
      // Refresh project list
      fetchProjects();
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du projet:", error);
      toast.error("Une erreur s'est produite lors de la sauvegarde du projet");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      description: '',
      location: '',
      image: '',
      price: '',
      yield: '',
      min_investment: '',
      duration: '',
      category: '',
      status: 'active',
      funding_progress: '0',
      possible_durations: '',
      profitability: ''
    });
    setIsAddProjectModalOpen(false);
    setEditingProject(null);
    setFormErrors({});
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      company_name: project.company_name || '',
      description: project.description || '',
      location: project.location || '',
      image: project.image || '',
      price: project.price?.toString() || '',
      yield: project.yield?.toString() || '',
      min_investment: project.min_investment?.toString() || '',
      duration: project.duration || '',
      category: project.category || '',
      status: project.status || 'active',
      funding_progress: project.funding_progress?.toString() || '0',
      possible_durations: project.possible_durations ? project.possible_durations.join(', ') : '',
      profitability: project.profitability?.toString() || ''
    });
    setIsAddProjectModalOpen(true);
  };

  const handleDeleteProject = async (project: any) => {
    if (!adminUserId || !window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);
        
      if (error) throw error;
      
      // Log admin action
      await logAdminAction(
        adminUserId,
        'project_management',
        `Suppression du projet "${project.name}"`,
        undefined,
        project.id
      );
      
      toast.success(`Le projet ${project.name} a été supprimé`);
      
      // Refresh project list
      fetchProjects();
      
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      toast.error("Une erreur s'est produite lors de la suppression du projet");
    }
  };

  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (project.name || '').toLowerCase().includes(searchLower) ||
      (project.company_name || '').toLowerCase().includes(searchLower) ||
      (project.location || '').toLowerCase().includes(searchLower) ||
      (project.category || '').toLowerCase().includes(searchLower)
    );
  });

  return {
    projects: filteredProjects,
    isLoading,
    searchTerm,
    setSearchTerm,
    isAddProjectModalOpen,
    setIsAddProjectModalOpen,
    sortField,
    sortDirection,
    editingProject,
    formData,
    formErrors,
    handleSort,
    handleFormChange,
    handleSubmitProject,
    handleEditProject,
    handleDeleteProject,
    resetForm,
    fetchProjects
  };
};
