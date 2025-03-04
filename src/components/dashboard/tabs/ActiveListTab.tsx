
import React from "react";
import { Project } from "@/types/project";

interface ActiveListTabProps {
  userInvestments: Project[];
}

export default function ActiveListTab({ userInvestments }: ActiveListTabProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Investissements actifs</h2>
      <div className="space-y-4">
        {userInvestments.map((project) => (
          <div key={project.id} className="border rounded-lg p-4 flex items-center space-x-4">
            <img 
              src={project.image} 
              alt={project.name} 
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-bgs-blue">{project.name}</h3>
              <p className="text-sm text-bgs-gray-medium">{project.location}</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-bgs-blue">2500 €</div>
              <div className="text-sm text-green-600">+{project.yield}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
