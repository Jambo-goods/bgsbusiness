
import React from "react";

// Sample project updates
const projectUpdates = [
  {
    date: "15 Juin 2023",
    title: "Lancement du projet",
    content: "Nous avons officiellement lancé le projet et commencé à collecter des fonds."
  },
  {
    date: "22 Juillet 2023",
    title: "Première phase de financement atteinte",
    content: "Nous avons atteint notre premier objectif de financement et commencé les premières acquisitions d'équipement."
  },
  {
    date: "10 Septembre 2023",
    title: "Déploiement sur le terrain",
    content: "Les premiers équipements ont été déployés sur le terrain et sont maintenant opérationnels."
  }
];

export default function ProjectUpdatesTab() {
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
