
import React, { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import MinimumInvestmentWarning from "./investment-options/MinimumInvestmentWarning";
import InsufficientBalanceWarning from "./investment-options/InsufficientBalanceWarning";
import InvestButton from "./investment-options/InvestButton";
import { useWalletStatus } from "@/hooks/useWalletStatus";

interface InvestmentOptionsSectionProps {
  project: Project;
  selectedAmount: number;
  selectedDuration: number;
  minInvestment: number;
  expectedYield: number;
  onInvestmentConfirmed: () => void;
}

export default function InvestmentOptionsSection({
  project,
  selectedAmount,
  selectedDuration,
  minInvestment,
  expectedYield,
  onInvestmentConfirmed
}: InvestmentOptionsSectionProps) {
  const { isLoggedIn, walletBalance, refreshWalletStatus } = useWalletStatus();
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    // Set up real-time updates for wallet balance
    const profileChannel = supabase.channel('profile-changes-invest').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles'
    }, payload => {
      const newBalance = payload.new.wallet_balance;
      if (newBalance !== undefined) {
        refreshWalletStatus();
      }
    }).subscribe();
    
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [refreshWalletStatus]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Votre investissement</h3>
      
      {selectedAmount < minInvestment && (
        <MinimumInvestmentWarning minInvestment={minInvestment} />
      )}
      
      {isLoggedIn && walletBalance < selectedAmount && (
        <InsufficientBalanceWarning 
          walletBalance={walletBalance}
          selectedAmount={selectedAmount}
        />
      )}
      
      <InvestButton
        project={project}
        isLoggedIn={isLoggedIn}
        walletBalance={walletBalance}
        selectedAmount={selectedAmount}
        selectedDuration={selectedDuration}
        minInvestment={minInvestment}
        expectedYield={expectedYield}
        isInvesting={isInvesting}
        setIsInvesting={setIsInvesting}
        onInvestmentConfirmed={onInvestmentConfirmed}
      />
    </div>
  );
}
