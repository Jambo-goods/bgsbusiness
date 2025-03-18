
import React from 'react';
import ProjectForm from '@/components/admin/projects/ProjectForm';
import ProjectList from '@/components/admin/projects/ProjectList';
import { useProjectManagement } from '@/hooks/admin/useProjectManagement';
import SearchBar from '@/components/admin/projects/SearchBar';
import SidebarMenu from '@/components/layout/SidebarMenu';
import { Toaster } from 'sonner';

export default function AdminProjects() {
  const {
    projects,
    isLoading,
    editingProject,
    searchTerm,
    setSearchTerm,
    handleEditProject,
    handleDeleteProject,
    handleSubmitProject,
    isAddProjectModalOpen,
    setIsAddProjectModalOpen,
    formData,
    handleFormChange,
    formErrors,
    resetForm,
    sortField,
    sortDirection,
    handleSort
  } = useProjectManagement();
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster />
      
      {/* Add the sidebar menu */}
      <SidebarMenu />
      
      <div className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Projets</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                
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
            </div>
            
            <div className="md:col-span-5">
              {isAddProjectModalOpen && (
                <ProjectForm 
                  formData={formData}
                  handleFormChange={handleFormChange}
                  handleSubmitProject={handleSubmitProject}
                  formErrors={formErrors}
                  editingProject={editingProject}
                  onCancel={resetForm}
                />
              )}
              
              {!isAddProjectModalOpen && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Ajouter un projet</h2>
                  <p className="text-gray-600 mb-4">
                    Cliquez sur le bouton ci-dessous pour ajouter un nouveau projet.
                  </p>
                  <button
                    onClick={() => setIsAddProjectModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Ajouter un projet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
