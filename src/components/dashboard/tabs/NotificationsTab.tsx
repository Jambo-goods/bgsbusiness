
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const NotificationsTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-bgs-blue">Notifications</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500 h-5 w-5" />
            Fonctionnalité désactivée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Le système de notifications est actuellement désactivé. Veuillez contacter l'administrateur
            pour plus d'informations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
