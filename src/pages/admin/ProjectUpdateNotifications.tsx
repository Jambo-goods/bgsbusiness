
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminHeader from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, PlusCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  company_name: string;
  status: string;
}

interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  update_type: string;
  details: string;
  created_at: string;
}

const ProjectUpdateNotifications: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [updateType, setUpdateType] = useState('progress');
  
  useEffect(() => {
    fetchProjects();
    
    // Set up real-time listener for project updates
    const channel = supabase
      .channel('project_updates_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'project_updates' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success("Mise à jour du projet ajoutée", {
              description: "La mise à jour sera visible immédiatement pour les investisseurs."
            });
            
            if (selectedProjectId) {
              fetchUpdatesForProject(selectedProjectId);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, company_name, status')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Erreur lors de la récupération des projets");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUpdatesForProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      // We need to cast this to any since the Supabase types don't know about our new table yet
      const { data, error } = await (supabase as any)
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching project updates:', error);
      toast.error("Erreur lors de la récupération des mises à jour");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      fetchUpdatesForProject(projectId);
    } else {
      setUpdates([]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjectId) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }
    
    if (!title || !details || !updateType) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      setIsSending(true);
      
      // Insert the update
      // We need to cast this to any since the Supabase types don't know about our new table yet
      const { data, error } = await (supabase as any)
        .from('project_updates')
        .insert({
          project_id: selectedProjectId,
          title,
          details,
          update_type: updateType
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Reset form
      setTitle('');
      setDetails('');
      setUpdateType('progress');
      
      toast.success("Mise à jour du projet envoyée avec succès");
      
      // Refetch updates
      fetchUpdatesForProject(selectedProjectId);
      
    } catch (error) {
      console.error('Error sending project update:', error);
      toast.error("Erreur lors de l'envoi de la mise à jour");
    } finally {
      setIsSending(false);
    }
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to get update type label
  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'progress': return 'Avancement';
      case 'financial': return 'Financière';
      case 'milestone': return 'Jalon';
      case 'delay': return 'Retard';
      case 'completion': return 'Achèvement';
      default: return type;
    }
  };
  
  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Mises à jour des projets" 
        description="Envoyez des notifications aux investisseurs concernant les mises à jour des projets."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Envoyer une mise à jour</CardTitle>
            <CardDescription>Les investisseurs seront notifiés de cette mise à jour.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Projet</Label>
                <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} - {project.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="update-type">Type de mise à jour</Label>
                <Select value={updateType} onValueChange={setUpdateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de mise à jour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Avancement</SelectItem>
                    <SelectItem value="financial">Financière</SelectItem>
                    <SelectItem value="milestone">Jalon</SelectItem>
                    <SelectItem value="delay">Retard</SelectItem>
                    <SelectItem value="completion">Achèvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Titre de la mise à jour"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="details">Détails</Label>
                <Textarea 
                  id="details" 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)} 
                  placeholder="Détails de la mise à jour"
                  rows={5}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Envoyer la mise à jour
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Historique des mises à jour</CardTitle>
            <CardDescription>
              {selectedProjectId 
                ? `Mises à jour envoyées pour le projet sélectionné` 
                : "Sélectionnez un projet pour voir ses mises à jour"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : !selectedProjectId ? (
              <div className="text-center py-10 text-gray-500">
                Veuillez sélectionner un projet pour voir ses mises à jour
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Aucune mise à jour n'a été envoyée pour ce projet
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{update.title}</h3>
                        <p className="text-sm text-gray-500">
                          {getUpdateTypeLabel(update.update_type)} • {formatDate(update.created_at)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-sm">{update.details}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectUpdateNotifications;
