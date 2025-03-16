
import React from "react";
import { FileText, Download } from "lucide-react";

// Sample project documents
const projectDocuments = [
  { name: "Présentation du projet", type: "PDF", size: "2.4 MB" },
  { name: "Analyse financière", type: "PDF", size: "1.8 MB" },
  { name: "Contrat d'investissement", type: "PDF", size: "0.5 MB" },
  { name: "Certification des équipements", type: "PDF", size: "3.1 MB" }
];

export default function ProjectDocumentsTab() {
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
