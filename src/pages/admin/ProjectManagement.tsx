
import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjectManagement } from '@/hooks/admin/useProjectManagement';
import SearchBar from '@/components/admin/projects/SearchBar';
import ProjectList from '@/components/admin/projects/ProjectList';
import ProjectForm from '@/components/admin/projects/ProjectForm';

export default function ProjectManagement() {
  const { adminUser } = useAdmin();
  
  const {
    projects,
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
  } = useProjectManagement(adminUser?.id);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <div className="flex gap-2">
          <Button
            onClick={() => fetchProjects()}
            variant="outline"
          >
            Actualiser
          </Button>
          
          <Button
            onClick={() => {
              resetForm();
              setIsAddProjectModalOpen(true);
            }}
            className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un projet
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ProjectList 
          projects={projects}
          isLoading={isLoading}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          handleEditProject={handleEditProject}
          handleDeleteProject={handleDeleteProject}
        />
      </div>
      
      {/* Add/Edit Project Modal */}
      {isAddProjectModalOpen && (
        <ProjectForm 
          formData={formData}
          handleFormChange={handleFormChange}
          handleSubmitProject={handleSubmitProject}
          formErrors={formErrors}
          editingProject={editingProject}
          onCancel={() => {
            resetForm();
            setIsAddProjectModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
