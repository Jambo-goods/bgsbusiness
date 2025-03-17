
import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProjectManagement from './ProjectManagement';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const AdminProjects = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Gestion des Projets | Finance App</title>
      </Helmet>
      
      <div className="container mx-auto py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Accueil</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/scheduled-payments" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Paiements Programmés</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <ProjectManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
