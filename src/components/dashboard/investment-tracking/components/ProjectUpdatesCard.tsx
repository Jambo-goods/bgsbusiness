
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellOff } from 'lucide-react';

interface ProjectUpdatesCardProps {
  projectId: string;
}

const ProjectUpdatesCard: React.FC<ProjectUpdatesCardProps> = ({ projectId }) => {
  // Future implementation - fetch updates based on projectId

  // Display empty state for now
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mises à jour du projet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BellOff className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium mb-1">Aucune mise à jour</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Il n'y a pas encore de mises à jour pour ce projet. Vous serez notifié lorsque de nouvelles informations seront disponibles.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectUpdatesCard;
