
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellRing, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notifications";

const NotificationsTab = () => {
  const [showDemo, setShowDemo] = useState(false);
  
  // Fonction pour démontrer les différents types de notifications
  const demonstrateNotifications = () => {
    setShowDemo(true);
    
    // Délai de 1 seconde entre chaque notification pour meilleure expérience
    setTimeout(() => {
      notificationService.depositSuccess(1000);
    }, 1000);
    
    setTimeout(() => {
      notificationService.investmentConfirmed(5000, "Projet Exemple", "123");
    }, 3000);
    
    setTimeout(() => {
      notificationService.yieldReceived(250, "Projet Exemple");
    }, 5000);
    
    setTimeout(() => {
      notificationService.withdrawalStatus(500, "pending");
    }, 7000);
    
    setTimeout(() => {
      notificationService.newInvestmentOpportunity("Nouveau Projet", "456");
    }, 9000);
    
    // Réinitialise après la démo
    setTimeout(() => {
      setShowDemo(false);
    }, 12000);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-bgs-blue">Notifications</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="text-bgs-blue h-5 w-5" />
            Système de notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Recevez des notifications en temps réel concernant vos investissements, rendements, et opportunités.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-bgs-blue" />
                  Notifications en temps réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Les notifications apparaissent automatiquement lors des événements importants de votre compte.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4 text-bgs-blue" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Configurez vos préférences de notification dans les paramètres de votre compte.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={demonstrateNotifications} 
              disabled={showDemo}
              className="mt-4"
            >
              {showDemo ? "Démo en cours..." : "Voir exemples de notifications"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="text-amber-500 h-5 w-5" />
            À propos des notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Le système de notifications vous informe des événements importants concernant votre compte:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-gray-600">
            <li>Confirmations d'investissements</li>
            <li>Dépôts et retraits</li>
            <li>Rendements reçus</li>
            <li>Nouvelles opportunités d'investissement</li>
            <li>Mises à jour importantes du système</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
