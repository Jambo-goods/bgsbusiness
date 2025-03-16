
import React from "react";
import HistoryHeader from "./history/HistoryHeader";
import HistoryList from "./history/HistoryList";
import LoadingState from "./history/LoadingState";
import ErrorState from "./history/ErrorState";
import useWalletHistory from "./history/useWalletHistory";

interface WalletHistoryProps {
  refreshBalance?: () => Promise<void>;
}

export default function WalletHistory({ refreshBalance }: WalletHistoryProps) {
  const { combinedItems, isLoading, isRefreshing, error, handleRefresh } = useWalletHistory();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
      <HistoryHeader onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <HistoryList items={combinedItems} />
      )}
    </div>
  );
}
