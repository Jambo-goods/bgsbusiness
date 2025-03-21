
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshBalanceButtonProps {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export default function RefreshBalanceButton({ onRefresh, disabled }: RefreshBalanceButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || disabled) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      // Add a small delay to show the animation
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      className="flex items-center gap-1"
      disabled={isRefreshing || disabled}
    >
      <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>Actualiser le solde</span>
    </Button>
  );
}
