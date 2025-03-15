
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectUpdate {
  date: string;
  title: string;
  content: string;
}

export default function ProjectUpdatesTab() {
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectUpdates() {
      try {
        // Here we would ideally fetch real updates from the database
        setLoading(true);
        
        // For now, just set an empty array until we have a real database source
        setProjectUpdates([]);
      } catch (error) {
        console.error("Error fetching project updates:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjectUpdates();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
        <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mises à jour du projet</h2>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (projectUpdates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
        <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mises à jour du projet</h2>
        <div className="text-center py-10">
          <p className="text-gray-500">Aucune mise à jour disponible pour ce projet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mises à jour du projet</h2>
      <div className="space-y-6">
        {projectUpdates.map((update, index) => (
          <div key={index} className="relative pl-6 pb-6 border-l border-gray-200 last:pb-0">
            <div className="absolute -left-1.5 top-0">
              <div className="w-3 h-3 rounded-full bg-bgs-orange"></div>
            </div>
            <div>
              <p className="text-sm text-bgs-blue/60 mb-1">{update.date}</p>
              <h3 className="font-semibold text-bgs-blue mb-2">{update.title}</h3>
              <p className="text-bgs-blue/80">{update.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
