
import React, { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDocument {
  name: string;
  type: string;
  size: string;
}

export default function ProjectDocumentsTab() {
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectDocuments() {
      try {
        // Here we would ideally fetch real documents from the database
        setLoading(true);
        
        // For now, just set an empty array until we have a real database source
        setProjectDocuments([]);
      } catch (error) {
        console.error("Error fetching project documents:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjectDocuments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
        <h2 className="text-xl font-semibold text-bgs-blue mb-6">Documents du projet</h2>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (projectDocuments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
        <h2 className="text-xl font-semibold text-bgs-blue mb-6">Documents du projet</h2>
        <div className="text-center py-10">
          <p className="text-gray-500">Aucun document disponible pour ce projet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">Documents du projet</h2>
      <div className="space-y-4">
        {projectDocuments.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="bg-bgs-blue/10 p-3 rounded-lg mr-4">
                <FileText className="h-5 w-5 text-bgs-blue" />
              </div>
              <div>
                <h3 className="font-medium text-bgs-blue">{doc.name}</h3>
                <p className="text-sm text-bgs-blue/60">{doc.type} • {doc.size}</p>
              </div>
            </div>
            <button className="flex items-center text-bgs-orange hover:text-bgs-orange-light transition-colors">
              <Download className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Télécharger</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
