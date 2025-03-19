
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircle, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

export default function BankTransferInstructions() {
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");

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

  const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setTransferAmount(value);
  };

  const handleConfirmTransfer = async () => {
    try {
      if (!transferAmount || parseInt(transferAmount) < 100) {
        toast.error("Veuillez saisir un montant valide (minimum 100€)");
        return;
      }

      setIsConfirming(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      const userEmail = sessionData.session?.user.email;
      
      if (!userId) {
        toast.error("Vous devez être connecté pour confirmer un virement");
        return;
      }
      
      // Create notification directly with the deposit service
      await notificationService.deposit.depositRequested(parseInt(transferAmount), bankDetails.reference);
      
      await supabase.from('bank_transfers').insert({
        user_id: userId,
        reference: bankDetails.reference,
        amount: parseInt(transferAmount),
        status: 'pending',
        notes: 'Confirmation de virement par l\'utilisateur'
      });
      
      await supabase.from('wallet_transactions').insert({
        user_id: userId,
        amount: parseInt(transferAmount),
        type: "deposit",
        status: "pending",
        description: `Virement bancaire confirmé (réf: ${bankDetails.reference})`
      });
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
      
      const userName = profileData ? `${profileData.first_name} ${profileData.last_name}` : "Utilisateur";
      
      const { error: notificationError } = await supabase.functions.invoke('send-bank-transfer-notification', {
        body: {
          userName: userName,
          userId: userId,
          userEmail: userEmail || "Email non disponible",
          reference: bankDetails.reference,
          amount: parseInt(transferAmount)
        }
      });
      
      if (notificationError) {
        console.error("Erreur lors de l'envoi de la notification par email:", notificationError);
      } else {
        console.log("Notification par email envoyée avec succès");
      }
      
      toast.success("Confirmation de virement envoyée. Nous traiterons votre virement dès réception.");
      setTransferAmount("");
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
      
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div>
          <Label htmlFor="transferAmount">Montant du virement effectué (€)</Label>
          <Input
            id="transferAmount"
            type="text"
            value={transferAmount}
            onChange={handleTransferAmountChange}
            placeholder="Minimum 100€"
            className="mt-1"
          />
          {transferAmount && parseInt(transferAmount) < 100 && (
            <p className="text-red-500 text-sm mt-1">
              Le montant minimum est de 100€.
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-center">
          <Button 
            onClick={handleConfirmTransfer}
            disabled={isConfirming || !transferAmount || parseInt(transferAmount) < 100}
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
    </div>
  );
}
