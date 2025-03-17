
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProjectManagement from './ProjectManagement';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminProjects = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Gestion des Projets | Finance App</title>
      </Helmet>
      
      <div className="container mx-auto py-6 max-w-7xl">
        <h1 className="text-2xl font-semibold text-bgs-blue mb-6">Gestion des Projets</h1>
        <ProjectManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
