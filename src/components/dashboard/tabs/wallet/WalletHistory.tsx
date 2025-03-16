
import React, { useEffect, useState, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { History, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TransactionList from "./transactions/TransactionList";
import { useTransactions } from "./transactions/useTransactions";

interface WalletHistoryProps {
  refreshBalance?: () => Promise<void>;
}

export default function WalletHistory({ refreshBalance }: WalletHistoryProps) {
  const { 
    transactions, 
    isLoading, 
    error, 
    isRefreshing,
    handleRefresh
  } = useTransactions(refreshBalance);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-bgs-blue" />
          <h2 className="text-lg font-semibold text-bgs-blue">Historique des transactions</h2>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <TransactionList 
        transactions={transactions}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
