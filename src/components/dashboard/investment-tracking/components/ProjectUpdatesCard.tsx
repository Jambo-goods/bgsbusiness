
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellOff, Info, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectUpdatesCardProps {
  projectId: string;
}

interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  update_type: string;
  details: string;
  created_at: string;
}

const ProjectUpdatesCard: React.FC<ProjectUpdatesCardProps> = ({ projectId }) => {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('project_updates')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setUpdates(data || []);
      } catch (error) {
        console.error('Error fetching project updates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpdates();
    
    // Set up realtime subscription for updates
    const channel = supabase
      .channel('project_updates_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_updates',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchUpdates();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Function to get a badge color based on update type
  const getUpdateTypeBadge = (type: string) => {
    switch (type) {
      case 'progress':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'milestone':
        return 'bg-purple-100 text-purple-800';
      case 'delay':
        return 'bg-orange-100 text-orange-800';
      case 'completion':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to get a readable update type label
  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'progress':
        return 'Avancement';
      case 'financial':
        return 'Financière';
      case 'milestone':
        return 'Jalon';
      case 'delay':
        return 'Retard';
      case 'completion':
        return 'Achèvement';
      default:
        return 'Autre';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mises à jour du projet</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
          </div>
        ) : updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BellOff className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium mb-1">Aucune mise à jour</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Il n'y a pas encore de mises à jour pour ce projet. Vous serez notifié lorsque de nouvelles informations seront disponibles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div 
                key={update.id} 
                className="border border-gray-100 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{update.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getUpdateTypeBadge(update.update_type)}`}>
                      {getUpdateTypeLabel(update.update_type)}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(update.created_at), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{update.details}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectUpdatesCard;
