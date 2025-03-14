
import React from "react";
import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Investment } from "../types/investment";

interface GeneralInformationCardProps {
  investment: Investment;
}

export default function GeneralInformationCard({ investment }: GeneralInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-start gap-4">
            <img 
              src={investment.projects.image} 
              alt={investment.projects.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-bgs-blue">{investment.projects.name}</h2>
              <p className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-1" />
                {investment.projects.category}
              </p>
              <p className="text-sm text-gray-600">{investment.projects.description}</p>
            </div>
          </div>
          
          <Progress value={investment.projects.funding_progress} className="h-2" />
          <p className="text-sm text-gray-600">Progression : {investment.projects.funding_progress}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
