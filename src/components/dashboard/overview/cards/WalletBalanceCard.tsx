
import { useEffect, useState } from "react";
import { Banknote } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { WalletChange } from "@/hooks/dashboard/types";
import { supabase } from "@/integrations/supabase/client";

interface WalletBalanceCardProps {
  walletBalance?: number;
  walletChange: WalletChange;
}

export default function WalletBalanceCard({ walletBalance = 0, walletChange }: WalletBalanceCardProps) {
  const [updatedBalance, setUpdatedBalance] = useState<number>(walletBalance);

  useEffect(() => {
    setUpdatedBalance(walletBalance);
    
    // Set up real-time subscription for wallet balance changes
    const setupSubscription = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) return;
      
      console.log("Setting up wallet balance real-time subscription in dashboard card");
      
      const profileChannel = supabase
        .channel('dashboard-wallet-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log("Profile updated in dashboard:", payload);
            if (payload.new && typeof payload.new.wallet_balance === 'number') {
              console.log("Updating wallet balance in dashboard card:", payload.new.wallet_balance);
              setUpdatedBalance(payload.new.wallet_balance);
            }
          }
        )
        .subscribe();
        
      return profileChannel;
    };
    
    const subscription = setupSubscription();
    
    return () => {
      subscription.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [walletBalance]);

  return (
    <DashboardCard
      title="Solde disponible"
      value={`${updatedBalance?.toLocaleString() || "0"} €`}
      icon={<Banknote />}
      iconBgColor="bg-purple-100"
      iconColor="text-purple-600"
      changePercentage={walletChange.percentage || "0%"}
      changeValue={walletChange.value || "0€"}
      changeTimeframe="le dernier mois"
      description="Méthode : Virement bancaire"
    />
  );
}
