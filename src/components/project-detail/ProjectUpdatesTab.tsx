
import React from "react";

export default function ProjectUpdatesTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mises à jour du projet</h2>
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune mise à jour disponible pour ce projet</p>
        </div>
      </div>
    </div>
  );
}
