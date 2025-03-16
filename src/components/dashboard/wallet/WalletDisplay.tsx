
import React from "react";
import { useUserBalance } from "@/hooks/useUserBalance";
import { WalletCard } from "./WalletCard"; 

interface WalletDisplayProps {
  onRefresh?: () => void;
}

export default function WalletDisplay({ onRefresh }: WalletDisplayProps) {
  const { userBalance } = useUserBalance();
  
  const handleRetry = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };
  
  return <WalletCard balance={userBalance} />;
}
