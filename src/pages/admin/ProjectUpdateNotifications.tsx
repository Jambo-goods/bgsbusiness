
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/ui/icons-set';
import { Loader2, RefreshCw, Send } from 'lucide-react';
import { InvestmentNotificationService } from '@/services/notifications/InvestmentNotificationService';
import AdminLayout from '@/components/admin/AdminLayout';

interface Project {
  id: string;
  name: string;
  company_name: string;
  status: string;
}

export default function ProjectUpdateNotifications() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateType, setUpdateType] = useState('progress');
  const [updateDetails, setUpdateDetails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const notificationService = new InvestmentNotificationService();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, company_name, status')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendUpdate = async () => {
    if (!selectedProject || !updateTitle || !updateType || !updateDetails) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSending(true);
    
    try {
      // Get project name for the notification
      const project = projects.find(p => p.id === selectedProject);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Get all users who have invested in this project
      const { data: investments, error: investmentsError } = await supabase
        .from('investments')
        .select('user_id')
        .eq('project_id', selectedProject)
        .eq('status', 'active');
      
      if (investmentsError) throw investmentsError;
      
      // Create a notification for all investors of this project
      const investorIds = [...new Set(investments?.map(i => i.user_id) || [])];
      
      if (investorIds.length === 0) {
        toast.warning('Aucun investisseur trouvé pour ce projet');
      } else {
        // Store the update in the project_updates table
        const { error: updateError } = await supabase
          .from('project_updates')
          .insert({
            project_id: selectedProject,
            title: updateTitle,
            update_type: updateType,
            details: updateDetails,
            created_at: new Date().toISOString()
          });
        
        if (updateError) throw updateError;
        
        // For each investor, create a notification about the project update
        for (const userId of investorIds) {
          await createNotificationForUser(
            userId, 
            project.name, 
            updateType, 
            updateDetails,
            updateTitle
          );
        }
        
        toast.success(`Mise à jour envoyée à ${investorIds.length} investisseurs`);
        
        // Reset form
        setUpdateTitle('');
        setUpdateType('progress');
        setUpdateDetails('');
        setSelectedProject('');
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error sending project update:', error);
      toast.error('Erreur lors de l\'envoi de la mise à jour');
    } finally {
      setIsSending(false);
    }
  };

  const createNotificationForUser = async (
    userId: string, 
    projectName: string, 
    updateType: string, 
    details: string,
    title: string
  ) => {
    try {
      // Create notification in the database
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: `Mise à jour: ${projectName}`,
          message: `${title}: ${details}`,
          type: 'investment',
          data: { 
            category: 'info', 
            projectName,
            updateType,
            details,
            title
          }
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error creating notification for user:', error);
      throw error;
    }
  };

  const filteredProjects = searchTerm 
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  return (
    <>
      <Helmet>
        <title>Notifications de mise à jour | Admin BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Mises à jour de projets</h1>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchProjects}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              
              <Button onClick={() => setIsDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Nouvelle mise à jour
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun projet trouvé
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedProject(project.id);
                      setIsDialogOpen(true);
                    }}
                  >
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.company_name}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Send className="h-3 w-3 mr-1" />
                        Notifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
      
      {/* Create Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer une mise à jour de projet</DialogTitle>
            <DialogDescription>
              Cette mise à jour sera envoyée à tous les investisseurs du projet sélectionné.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Projet</label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                placeholder="Titre de la mise à jour"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de mise à jour</label>
              <Select
                value={updateType}
                onValueChange={setUpdateType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de mise à jour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Avancement du projet</SelectItem>
                  <SelectItem value="financial">Information financière</SelectItem>
                  <SelectItem value="milestone">Jalon atteint</SelectItem>
                  <SelectItem value="delay">Retard</SelectItem>
                  <SelectItem value="completion">Achèvement</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Détails</label>
              <Textarea
                placeholder="Détails de la mise à jour"
                value={updateDetails}
                onChange={(e) => setUpdateDetails(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendUpdate} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
