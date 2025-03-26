
import React, { useState, useEffect } from 'react';
import { File, Upload, X, FileCheck, AlertCircle, FileX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DocumentUploadTabProps {
  projectId: string | undefined;
}

interface ProjectDocument {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: string;
  created_at: string;
}

const DocumentUploadTab: React.FC<DocumentUploadTabProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch existing documents for this project
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
        toast.error('Erreur lors du chargement des documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [projectId]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId) {
      toast.error('Veuillez d\'abord sauvegarder le projet');
      return;
    }
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is a PDF
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} n'est pas un PDF`);
          continue;
        }
        
        // Generate a unique file path
        const filePath = `${projectId}/${Date.now()}_${file.name}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project_documents')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Get public URL for the file
        const { data: urlData } = supabase.storage
          .from('project_documents')
          .getPublicUrl(filePath);
          
        // Add record to project_documents table
        const { data: docData, error: docError } = await supabase
          .from('project_documents')
          .insert([
            {
              project_id: projectId,
              name: file.name,
              file_url: urlData.publicUrl,
              file_type: file.type,
              file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
            }
          ])
          .select();
          
        if (docError) throw docError;
        
        // Add new document to state
        if (docData && docData.length > 0) {
          setDocuments(prev => [docData[0], ...prev]);
        }
        
        toast.success(`Document "${file.name}" ajouté avec succès`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (document: ProjectDocument) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${document.name}" ?`)) {
      return;
    }
    
    try {
      // Extract file path from the URL
      const fileUrl = document.file_url;
      const filePath = fileUrl.split('/').slice(-2).join('/');
      
      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('project_documents')
        .remove([filePath]);
        
      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
        // Continue anyway to delete the database record
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id);
        
      if (dbError) throw dbError;
      
      // Update state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast.success(`Document "${document.name}" supprimé`);
      
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erreur lors de la suppression du document');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-bgs-blue">Documents du projet</h3>
      
      {/* Upload section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
        <Upload className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-4 text-center">
          Déposez vos PDF ici ou cliquez pour parcourir
        </p>
        <input
          type="file"
          id="document-upload"
          multiple
          accept="application/pdf"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading || !projectId}
        />
        <label htmlFor="document-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !projectId}
            className="cursor-pointer"
          >
            {uploading ? 'Chargement...' : 'Ajouter des documents'}
          </Button>
        </label>
        {!projectId && (
          <p className="text-xs text-amber-500 mt-2 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Veuillez d'abord sauvegarder le projet
          </p>
        )}
      </div>
      
      {/* Documents list */}
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Chargement des documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-4 border rounded-lg bg-gray-50">
          <FileX className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Aucun document disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded mr-3">
                  <File className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.file_size} • {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 p-1 hover:text-blue-700"
                >
                  <FileCheck className="h-5 w-5" />
                </a>
                <button 
                  onClick={() => handleDeleteDocument(doc)}
                  className="text-red-500 p-1 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadTab;
