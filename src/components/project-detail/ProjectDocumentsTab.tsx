
import React from "react";
import { FileText } from "lucide-react";

export default function ProjectDocumentsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">Documents du projet</h2>
      <div className="space-y-4">
        <div className="text-center py-8">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Aucun document disponible pour ce projet</p>
        </div>
      </div>
    </div>
  );
}
