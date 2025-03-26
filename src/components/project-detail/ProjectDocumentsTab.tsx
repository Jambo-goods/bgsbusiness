
import React, { useState, useEffect } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDocument {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: string;
  created_at: string;
}

export default function ProjectDocumentsTab() {
  const { id: projectId } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('project_documents')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching project documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
    
    // Set up realtime subscription for document updates
    const channel = supabase
      .channel('project_documents_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_documents',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchDocuments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">Documents du projet</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-medium mb-1">Aucun document</p>
          <p className="text-sm text-gray-400">
            Il n'y a pas encore de documents disponibles pour ce projet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="bg-bgs-blue/10 p-3 rounded-lg mr-4">
                  <FileText className="h-5 w-5 text-bgs-blue" />
                </div>
                <div>
                  <h3 className="font-medium text-bgs-blue">{doc.name}</h3>
                  <p className="text-sm text-bgs-blue/60">{doc.file_type} • {doc.file_size}</p>
                </div>
              </div>
              <a 
                href={doc.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-bgs-orange hover:text-bgs-orange-light transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Télécharger</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
