
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProfileTabProps {
  userData: any;
}

export default function ProfileTab({ userData }: ProfileTabProps) {
  if (!userData) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon Profil</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Prénom</label>
              <Input value={userData.first_name || ''} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nom</label>
              <Input value={userData.last_name || ''} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={userData.email || ''} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Téléphone</label>
              <Input value={userData.phone || 'Non renseigné'} readOnly />
            </div>
          </div>
          <Button className="mt-6" variant="outline">Modifier mes informations</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Statistiques du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Investissement total</p>
              <p className="text-xl font-bold">{userData.investment_total || 0} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Projets actifs</p>
              <p className="text-xl font-bold">{userData.projects_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membre depuis</p>
              <p className="text-xl font-bold">
                {userData.created_at 
                  ? new Date(userData.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
