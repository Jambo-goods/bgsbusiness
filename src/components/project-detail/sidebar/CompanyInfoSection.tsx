
import React from "react";
import { Building, TrendingUp, MapPin } from "lucide-react";
import { Project } from "@/types/project";

interface CompanyInfoSectionProps {
  project: Project;
}

export default function CompanyInfoSection({ project }: CompanyInfoSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center mb-4">
        <Building className="h-5 w-5 text-bgs-blue mr-2" />
        <h3 className="font-medium text-bgs-blue">Informations de l'entreprise</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <div className="p-1.5 bg-blue-50 rounded-md mr-2">
            <Building className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70">Nom de l'entreprise</p>
            <p className="text-sm font-semibold text-bgs-blue">{project.company_name}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="p-1.5 bg-green-50 rounded-md mr-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70">Rentabilité estimée</p>
            <p className="text-sm font-semibold text-green-600">{project.yield}%</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="p-1.5 bg-amber-50 rounded-md mr-2">
            <MapPin className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70">Localisation</p>
            <p className="text-sm font-semibold text-bgs-blue">{project.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
