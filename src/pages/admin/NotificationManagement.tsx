
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHeader from "@/components/admin/AdminHeader";
import { Bell, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateNotificationForm from "@/components/admin/notifications/CreateNotificationForm";

export default function NotificationManagement() {
  const [showMarketingForm, setShowMarketingForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  return (
    <>
      <Helmet>
        <title>Gestion des Notifications | BGS Admin</title>
      </Helmet>

      <div className="space-y-6">
        <AdminHeader 
          title="Gestion des Notifications" 
          description="Gérer et envoyer des notifications aux utilisateurs"
        />

        <Tabs defaultValue="system">
          <TabsList className="mb-4">
            <TabsTrigger value="system">Notifications Système</TabsTrigger>
            <TabsTrigger value="marketing">Notifications Marketing</TabsTrigger>
            <TabsTrigger value="custom">Notifications Personnalisées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-blue-100 p-3 mb-4">
                      <Bell className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium">Gestion des Notifications Système</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-md">
                      Cette section vous permet de gérer les notifications système envoyées aux utilisateurs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketing">
            <Card>
              <CardContent className="pt-6">
                {showMarketingForm ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Créer une notification marketing</h3>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowMarketingForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Cette notification sera envoyée à tous les utilisateurs de la plateforme.
                    </p>
                    <CreateNotificationForm 
                      notificationType="marketing" 
                      onSuccess={() => setShowMarketingForm(false)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-green-100 p-3 mb-4">
                      <Bell className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium">Notifications Marketing</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-md mb-6">
                      Gérez les campagnes marketing et les notifications promotionnelles.
                    </p>
                    <Button 
                      onClick={() => setShowMarketingForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Send size={16} />
                      Créer une notification marketing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="custom">
            <Card>
              <CardContent className="pt-6">
                {showCustomForm ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Créer une notification personnalisée</h3>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowCustomForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Envoyez une notification à un utilisateur spécifique.
                    </p>
                    <CreateNotificationForm 
                      notificationType="custom" 
                      onSuccess={() => setShowCustomForm(false)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-purple-100 p-3 mb-4">
                      <Bell className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-medium">Notifications Personnalisées</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-md mb-6">
                      Créez et envoyez des notifications personnalisées à des utilisateurs spécifiques.
                    </p>
                    <Button 
                      onClick={() => setShowCustomForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Send size={16} />
                      Créer une notification personnalisée
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
