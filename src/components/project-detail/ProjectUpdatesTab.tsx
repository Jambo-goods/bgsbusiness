
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BellOff } from "lucide-react";

interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  update_type: string;
  details: string;
  created_at: string;
}

export default function ProjectUpdatesTab() {
  const { id: projectId } = useParams<{ id: string }>();
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectUpdates = async () => {
      try {
        setLoading(true);
        
        if (!projectId) {
          console.error("Project ID is missing");
          return;
        }
        
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectUpdates();
    
    // Set up realtime subscription for updates
    const channel = supabase
      .channel('project_updates_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_updates',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchProjectUpdates();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mises à jour du projet</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className="relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
              <div className="absolute -left-1.5 top-0">
                <div className={`w-3 h-3 rounded-full ${getUpdateTypeBadge(update.update_type).replace('bg-', 'bg-').replace('text-', '')}`}></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-bgs-blue/60">{formatDate(update.created_at)}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getUpdateTypeBadge(update.update_type)}`}>
                    {getUpdateTypeLabel(update.update_type)}
                  </span>
                </div>
                <h3 className="font-semibold text-bgs-blue mb-2">{update.title}</h3>
                <p className="text-bgs-blue/80">{update.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
