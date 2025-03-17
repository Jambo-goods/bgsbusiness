
import { useState } from 'react';
import { CreditCard, ArrowDownToLine, ArrowUpFromLine, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WithdrawFundsForm from './WithdrawFundsForm';
import { useUserSession } from '@/hooks/dashboard/useUserSession';

export function ActionButtons() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { toast } = useToast();
  const { userId } = useUserSession();

  const handleAddFunds = async () => {
    try {
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour ajouter des fonds",
        });
        return;
      }

      // Create a bank transfer record
      const { data, error } = await supabase
        .from('bank_transfers')
        .insert({
          user_id: userId,
          amount: 1000, // Demo amount of 1000€
          status: 'pending',
          reference: `BGS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          description: "Dépôt de fonds (démo)"
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bank transfer:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter des fonds pour le moment",
        });
        return;
      }

      // Create wallet transaction record
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount: 1000,
          status: 'pending',
          description: `Dépôt de fonds via virement bancaire (réf: ${data.reference})`,
          transaction_id: data.id
        });

      toast({
        title: "Demande enregistrée",
        description: "Votre demande de dépôt a été enregistrée. Un administrateur traitera votre demande.",
      });
    } catch (err) {
      console.error('Error in handleAddFunds:', err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-lg font-medium mb-4 text-bgs-blue">Actions rapides</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 border-gray-200 hover:border-bgs-blue hover:bg-blue-50 transition-all" 
          onClick={handleAddFunds}
        >
          <ArrowDownToLine className="h-6 w-6 mb-2 text-bgs-blue" />
          <span className="text-sm font-medium">Ajouter des fonds</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 border-gray-200 hover:border-bgs-orange hover:bg-orange-50 transition-all" 
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          <ArrowUpFromLine className="h-6 w-6 mb-2 text-bgs-orange" />
          <span className="text-sm font-medium">Retirer des fonds</span>
        </Button>
      </div>
      
      {isWithdrawModalOpen && (
        <WithdrawFundsForm 
          onClose={() => setIsWithdrawModalOpen(false)} 
        />
      )}
    </div>
  );
}
