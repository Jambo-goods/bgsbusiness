
import React from "react";
import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Investment } from "../types/investment";

interface GeneralInformationCardProps {
  investment: Investment;
}

export default function GeneralInformationCard({ investment }: GeneralInformationCardProps) {
  const project = investment.projects;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-start gap-4">
            <img 
              src={project.image} 
              alt={project.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-bgs-blue">{project.name}</h2>
              <p className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-1" />
                {project.category}
              </p>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="bg-bgs-orange h-full"
              style={{ width: `${project.funding_progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">Progression : {project.funding_progress}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
