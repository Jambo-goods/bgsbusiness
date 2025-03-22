
import React from "react";
import HistoryList from "./history/HistoryList";
import EmptyState from "./history/EmptyState";
import ErrorState from "./history/ErrorState";
import LoadingState from "./history/LoadingState";
import HistoryHeader from "./history/HistoryHeader";
import { useWalletHistory } from "./history/useWalletHistory";

interface WalletHistoryProps {
  className?: string;
}

export default function WalletHistory({ className }: WalletHistoryProps) {
  const { 
    combinedHistory, 
    isLoading, 
    error, 
    refreshHistory 
  } = useWalletHistory();

  return (
    <div className={className}>
      <HistoryHeader onRefresh={refreshHistory} />
      
      <div className="mt-4">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refreshHistory} />
        ) : combinedHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <HistoryList items={combinedHistory} />
        )}
      </div>
    </div>
  );
}
