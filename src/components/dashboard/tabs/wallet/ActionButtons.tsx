import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, History, Calendar, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

export default function ActionButtons({ 
  onDeposit, 
  onWithdraw,
  refreshBalance 
}: { 
  onDeposit: () => void; 
  onWithdraw: () => void;
  refreshBalance: () => void;
}) {
  const [action, setAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleDepositClick = () => {
    onDeposit();
    navigate('/dashboard?tab=wallet&action=deposit');
  };
  
  const handleWithdrawClick = () => {
    onWithdraw();
    navigate('/dashboard?tab=wallet&action=withdraw');
  };
  
  const handleHistoryClick = () => {
    navigate('/dashboard?tab=wallet');
  };

  const handleScheduledPayment = async () => {
    try {
      setIsLoading(true);
      setAction('scheduled');
      
      // Simulate a scheduled payment
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }
      
      // Create a notification for the user
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: session.session.user.id,
        title: 'Paiement programmé',
        message: 'Un paiement de rendement a été programmé pour votre compte.',
        type: 'investment',
        seen: false
      });
      
      if (notifError) {
        console.error("Erreur lors de la création de la notification:", notifError);
      }
      
      // Update the wallet balance
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: session.session.user.id,
        increment_amount: 100
      });
      
      if (walletError) {
        console.error("Erreur lors de la mise à jour du solde:", walletError);
        toast.error("Une erreur est survenue lors de la mise à jour du solde");
        return;
      }
      
      // Refresh the balance
      refreshBalance();
      
      // Show notification
      notificationService.createNotification({
        type: 'investment',
        title: 'Rendement reçu',
        message: 'Un paiement de rendement de 100€ a été ajouté à votre portefeuille.'
      });
      
      toast.success("Paiement simulé avec succès", {
        description: "Un montant de 100€ a été ajouté à votre portefeuille"
      });
    } catch (error) {
      console.error("Erreur lors de la simulation du paiement:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-colors cursor-pointer" onClick={handleDepositClick}>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-green-200 rounded-full p-3">
            <ArrowDown className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Déposer des fonds</h3>
            <p className="text-sm text-green-700">Ajouter de l'argent à votre portefeuille</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-colors cursor-pointer" onClick={handleWithdrawClick}>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-amber-200 rounded-full p-3">
            <ArrowUp className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800">Retirer des fonds</h3>
            <p className="text-sm text-amber-700">Transférer de l'argent vers votre banque</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors cursor-pointer" onClick={handleHistoryClick}>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-blue-200 rounded-full p-3">
            <History className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Historique</h3>
            <p className="text-sm text-blue-700">Voir votre historique de transactions</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-colors cursor-pointer" onClick={handleScheduledPayment}>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-purple-200 rounded-full p-3">
            {isLoading && action === 'scheduled' ? (
              <RefreshCw className="h-6 w-6 text-purple-700 animate-spin" />
            ) : (
              <Calendar className="h-6 w-6 text-purple-700" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-purple-800">Simuler un rendement</h3>
            <p className="text-sm text-purple-700">Recevoir un paiement de test</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
