
import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NotificationManagement() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des notifications</h1>
        </div>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fonctionnalité désactivée</AlertTitle>
          <AlertDescription>
            La gestion des notifications a été temporairement désactivée. Les utilisateurs ne reçoivent plus de notifications.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications désactivées</CardTitle>
            <CardDescription>
              La table des notifications a été supprimée de la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Le système de notifications a été supprimé de l'application. Si vous souhaitez restaurer cette fonctionnalité, veuillez contacter l'équipe de développement.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
