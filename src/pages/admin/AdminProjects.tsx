
import React from 'react';
import { ProjectForm } from '@/components/admin/projects/ProjectForm';
import { ProjectList } from '@/components/admin/projects/ProjectList';
import { useProjectManagement } from '@/hooks/admin/useProjectManagement';
import { SearchBar } from '@/components/admin/projects/SearchBar';
import SidebarMenu from '@/components/layout/SidebarMenu';
import { Toaster } from 'sonner';

export default function AdminProjects() {
  const {
    projects,
    isLoading,
    selectedProject,
    searchTerm,
    setSearchTerm,
    handleProjectSelect,
    handleProjectDelete,
    handleProjectSubmit,
    isFormOpen,
    setIsFormOpen,
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
                  onProjectSelect={handleProjectSelect}
                  onProjectDelete={handleProjectDelete}
                />
              </div>
            </div>
            
            <div className="md:col-span-5">
              <ProjectForm 
                selectedProject={selectedProject}
                onSubmit={handleProjectSubmit}
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
