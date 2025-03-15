
import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationManagement() {
  return (
    <>
      <Helmet>
        <title>Gestion des notifications | Admin BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestion des notifications</h1>
            
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Fonctionnalité désactivée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Le système de notifications a été désactivé. La table de notifications a été supprimée de la base de données.
              </p>
              <div className="flex gap-4 mt-6">
                <Link to="/admin/dashboard">
                  <Button>
                    Retourner au Tableau de bord
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Alternative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Si vous avez besoin d'envoyer des messages aux utilisateurs, vous pouvez utiliser d'autres méthodes comme:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Emails directs via le système de gestion des utilisateurs</li>
                <li>Messages système sur le tableau de bord utilisateur</li>
                <li>Mises à jour d'état des transactions ou des investissements</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
