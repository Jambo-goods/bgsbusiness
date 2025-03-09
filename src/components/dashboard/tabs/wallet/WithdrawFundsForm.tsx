
import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { notificationService } from "@/services/notifications";
import WithdrawalRequestsTable from "./WithdrawalRequestsTable";

interface WithdrawFundsFormProps {
  balance: number;
  onWithdraw: () => Promise<void>;
}

export default function WithdrawFundsForm({ balance, onWithdraw }: WithdrawFundsFormProps) {
  const [amount, setAmount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAmount(value);
  };
  
  const isValidForm = () => {
    return (
      amount && 
      parseInt(amount) >= 100 && 
      parseInt(amount) <= balance &&
      bankName.trim().length >= 2 &&
      accountNumber.trim().length >= 8 &&
      accountHolder.trim().length >= 3
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidForm()) {
      toast.error("Veuillez remplir correctement tous les champs");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un retrait");
        return;
      }
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', session.session.user.id)
        .single();
        
      if (userError) {
        console.error("Erreur lors de la récupération des données utilisateur:", userError);
        throw new Error("Impossible de récupérer les données utilisateur");
      }
      
      // Insérer la demande de retrait avec toutes les informations bancaires
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: session.session.user.id,
          amount: parseInt(amount),
          bank_info: {
            accountName: accountHolder,
            bankName: bankName,
            accountNumber: accountNumber
          },
          status: 'pending',
          requested_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Envoyer une notification par email à l'administrateur
      try {
        const userName = `${userData.first_name} ${userData.last_name}`;
        
        await supabase.functions.invoke('send-withdrawal-notification', {
          body: {
            userId: session.session.user.id,
            userName,
            userEmail: userData.email,
            amount: parseInt(amount),
            bankDetails: {
              accountName: accountHolder,
              bankName: bankName,
              accountNumber: accountNumber
            }
          }
        });
        
        console.log("Notification de retrait envoyée avec succès");
      } catch (notifError) {
        console.error("Erreur lors de l'envoi de la notification de retrait:", notifError);
        // Nous ne voulons pas faire échouer la demande de retrait si la notification échoue
      }
      
      await notificationService.withdrawalValidated(parseInt(amount));
      
      toast.success("Demande de retrait soumise avec succès");
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolder("");
      
      await onWithdraw();
      
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur s'est produite lors de la demande de retrait");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Les retraits sont traités par virement bancaire sous 3-5 jours ouvrés.
          Le montant minimum de retrait est de 100€.
        </AlertDescription>
      </Alert>
      
      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Minimum 100€"
              className="mt-1"
            />
            {amount && parseInt(amount) > balance && (
              <p className="text-red-500 text-sm mt-1">
                Le montant ne peut pas dépasser votre solde actuel ({balance}€).
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="accountHolder">Titulaire du compte</Label>
            <Input
              id="accountHolder"
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="Nom et prénom du titulaire"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Nom de votre banque"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="accountNumber">Numéro de compte / IBAN</Label>
            <Input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
              placeholder="FR76..."
              className="mt-1 font-mono"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-bgs-blue hover:bg-bgs-blue-light"
            disabled={!isValidForm() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Demander un retrait"
            )}
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            En soumettant cette demande, vous acceptez que le traitement peut prendre jusqu'à 5 jours ouvrés.
            Les retraits sont soumis à vérification.
          </p>
        </form>
        
        <WithdrawalRequestsTable />
      </Card>
    </div>
  );
}
