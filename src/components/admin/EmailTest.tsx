
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmailTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationType, setNotificationType] = useState<'withdrawal' | 'bankTransfer' | 'investment'>('withdrawal');
  const [amount, setAmount] = useState("1000");
  const [projectName, setProjectName] = useState("Projet Test");
  
  const handleSendTestEmail = async () => {
    try {
      setIsLoading(true);
      
      // Create dummy user data for testing
      const testUserData = {
        userId: "test-user-id",
        userName: "Utilisateur Test",
        userEmail: "test@example.com",
        notificationType,
        data: {
          amount: parseInt(amount),
          bankDetails: {
            accountName: "DUPONT Jean",
            bankName: "Banque Populaire",
            accountNumber: "FR76 1234 5678 9012 3456 7890 123"
          },
          reference: "REF-" + Math.floor(Math.random() * 1000000),
          projectName
        }
      };
      
      // Call the admin notification function
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: testUserData
      });
      
      if (error) throw error;
      
      console.log("Test email response:", data);
      toast.success("Email de test envoyé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de test:", error);
      toast.error("Erreur lors de l'envoi de l'email de test");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Test des notifications email administrateur</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="notification-type">Type de notification</Label>
          <Select
            value={notificationType}
            onValueChange={(value) => setNotificationType(value as any)}
          >
            <SelectTrigger id="notification-type" className="mt-1">
              <SelectValue placeholder="Sélectionner le type de notification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="withdrawal">Demande de retrait</SelectItem>
              <SelectItem value="bankTransfer">Virement bancaire</SelectItem>
              <SelectItem value="investment">Investissement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="amount">Montant (€)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>
        
        {notificationType === 'investment' && (
          <div>
            <Label htmlFor="project-name">Nom du projet</Label>
            <Input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        
        <Button 
          onClick={handleSendTestEmail} 
          disabled={isLoading}
          className="mt-2"
        >
          {isLoading ? "Envoi en cours..." : "Envoyer un email de test"}
        </Button>
        
        <p className="text-sm text-gray-500 mt-2">
          Un email de test sera envoyé à l'adresse administrateur: jambogoodsafrica@gmail.com
        </p>
      </div>
    </Card>
  );
}
