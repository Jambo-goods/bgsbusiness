
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProjectManagement from './ProjectManagement';
import AdminLayout from '@/layouts/AdminLayout';

const AdminProjects = () => {
  console.log("Rendering AdminProjects component");
  return (
    <AdminLayout>
      <Helmet>
        <title>Gestion des Projets | Finance App</title>
      </Helmet>
      
      <div className="container mx-auto py-6 max-w-7xl">
        <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Projets</h1>
        
        {/* Use a try-catch to isolate potential errors in ProjectManagement */}
        {(() => {
          try {
            return <ProjectManagement />;
          } catch (error) {
            console.error("Error rendering ProjectManagement:", error);
            return (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Erreur lors du chargement de la gestion de projets.
              </div>
            );
          }
        })()}
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
