
import React from "react";
import HistoryList from "./history/HistoryList";
import EmptyState from "./history/EmptyState";
import ErrorState from "./history/ErrorState";
import LoadingState from "./history/LoadingState";
import HistoryHeader from "./history/HistoryHeader";
import { useWalletHistory } from "./history/useWalletHistory";

interface WalletHistoryProps {
  className?: string;
  refreshBalance?: (showLoading?: boolean) => Promise<void>;
}

export default function WalletHistory({ className, refreshBalance }: WalletHistoryProps) {
  const { 
    combinedHistory, 
    isLoading, 
    error, 
    refreshHistory 
  } = useWalletHistory();

  const handleRefresh = () => {
    refreshHistory();
    if (refreshBalance) {
      refreshBalance();
    }
  };

  return (
    <div className={className}>
      <HistoryHeader onRefresh={handleRefresh} isRefreshing={isLoading} />
      
      <div className="mt-4">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : combinedHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <HistoryList items={combinedHistory} />
        )}
      </div>
    </div>
  );
}
