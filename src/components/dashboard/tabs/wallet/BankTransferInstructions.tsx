
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BankTransferInstructions() {
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const bankDetails = {
    name: "BGS Invest",
    iban: "FR76 1234 5678 9101 1121 3141 516",
    bic: "BGSFRINVXXX",
    bank: "Banque Générale Française",
    reference: "DEP-" + Math.floor(100000 + Math.random() * 900000)
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConfirmTransfer = async () => {
    try {
      setIsConfirming(true);
      
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      const userEmail = sessionData.session?.user.email;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour confirmer un virement");
        return;
      }
      
      // Create a notification for the admin about the bank transfer
      await supabase.from('notifications').insert({
        user_id: userId,
        title: "Virement bancaire confirmé",
        description: `Un utilisateur a confirmé avoir effectué un virement bancaire avec la référence ${bankDetails.reference}`,
        type: "deposit",
        category: "finance",
        metadata: {
          reference: bankDetails.reference,
          timestamp: new Date().toISOString()
        }
      });
      
      // Add a record to the wallet_transactions table
      await supabase.from('wallet_transactions').insert({
        user_id: userId,
        amount: 0, // The actual amount will be updated by admin when they process it
        type: "deposit",
        status: "pending",
        description: `Virement bancaire confirmé (réf: ${bankDetails.reference})`
      });
      
      // Fetch user profile data for email notification
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
      
      const userName = profileData ? `${profileData.first_name} ${profileData.last_name}` : "Utilisateur";
      
      // Send email notification
      const { error: notificationError } = await supabase.functions.invoke('send-bank-transfer-notification', {
        body: {
          userName: userName,
          userId: userId,
          userEmail: userEmail || "Email non disponible",
          reference: bankDetails.reference
        }
      });
      
      if (notificationError) {
        console.error("Erreur lors de l'envoi de la notification par email:", notificationError);
      } else {
        console.log("Notification par email envoyée avec succès");
      }
      
      toast.success("Confirmation de virement envoyée. Nous traiterons votre virement dès réception.");
    } catch (error) {
      console.error("Erreur lors de la confirmation du virement:", error);
      toast.error("Une erreur est survenue lors de la confirmation");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Pour déposer des fonds, effectuez un virement bancaire avec les coordonnées ci-dessous. 
          Le dépôt minimum est de 100€. Vos fonds seront disponibles dans votre portefeuille 
          sous 24-48h ouvrées après réception.
        </AlertDescription>
      </Alert>
      
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Bénéficiaire</p>
                <p className="font-semibold">{bankDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Banque</p>
                <p className="font-semibold">{bankDetails.bank}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">BIC/SWIFT</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{bankDetails.bic}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => copyToClipboard(bankDetails.bic)}
                  >
                    {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-1">IBAN</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold tracking-wider">{bankDetails.iban}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => copyToClipboard(bankDetails.iban)}
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Référence à indiquer</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold tracking-wider text-bgs-blue">{bankDetails.reference}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => copyToClipboard(bankDetails.reference)}
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Assurez-vous d'inclure la référence exacte dans votre virement.
          Sans cette référence, l'identification de votre dépôt pourrait être retardée.
          Le montant minimum de dépôt est de 100€.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col items-center pt-4 border-t border-gray-200">
        <Button 
          onClick={handleConfirmTransfer}
          disabled={isConfirming}
          className="w-full md:w-auto bg-gradient-to-r from-bgs-blue to-bgs-blue-light text-white"
        >
          {isConfirming ? 
            "Confirmation en cours..." : 
            "J'ai effectué le virement bancaire"
          }
        </Button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Une fois le virement effectué, cliquez sur ce bouton pour nous informer
        </p>
      </div>
    </div>
  );
}
