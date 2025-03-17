
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import BankTransferSearch from "@/components/bank-transfers/BankTransferSearch";
import BankTransferTable from "@/components/bank-transfers/BankTransferTable";
import useBankTransfers from "@/components/bank-transfers/useBankTransfers";

export default function BankTransfersPage() {
  const {
    filteredTransfers,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    userData,
    error,
    handleSort,
    fetchBankTransfers
  } = useBankTransfers();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Virements Bancaires</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <BankTransferSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <Button 
              variant="outline"
              onClick={fetchBankTransfers}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          <BankTransferTable
            isLoading={isLoading}
            filteredTransfers={filteredTransfers}
            userData={userData}
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
        </div>
      </div>
    </div>
  );
}
