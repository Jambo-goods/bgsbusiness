
import React from "react";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BankTransferStats from "@/components/admin/dashboard/BankTransferStats";
import BankTransferFilters from "@/components/admin/dashboard/BankTransferFilters";
import { useBankTransferData } from "@/components/admin/dashboard/hooks/useBankTransferData";

export default function BankTransferManagement() {
  const { 
    pendingTransfers, 
    isLoading, 
    isError, 
    statusFilter, 
    setStatusFilter, 
    refetch, 
    handleManualRefresh 
  } = useBankTransferData();

  console.log("Bank Transfer Management - Transfers loaded:", pendingTransfers?.length);
  console.log("Transfer IDs:", pendingTransfers?.map(t => t.id));

  return (
    <>
      <Helmet>
        <title>Gestion des Virements Bancaires | BGS Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Virements Bancaires</h1>
          <button 
            onClick={handleManualRefresh} 
            className="flex items-center gap-2 px-4 py-2 bg-bgs-blue text-white rounded-md hover:bg-bgs-blue-dark transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
        
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm">Impossible de récupérer les données des virements. Veuillez réessayer.</p>
          </div>
        )}

        <BankTransferStats 
          transfers={pendingTransfers} 
          isLoading={isLoading} 
        />
        
        <BankTransferFilters 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={pendingTransfers?.length || 0}
          isLoading={isLoading}
        />

        <div>
          <Card>
            <CardContent className="p-0">
              <BankTransferTable 
                pendingTransfers={pendingTransfers || []}
                isLoading={isLoading}
                refreshData={refetch}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Debug information panel to show all transfers in detail */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-semibold mb-2">Données de débogage détaillées ({pendingTransfers?.length || 0} virements)</h3>
          <div className="text-xs mb-2">
            <span className="font-semibold">IDs des virements:</span> {pendingTransfers?.map(t => t.id).join(', ')}
          </div>
          <div className="text-xs mb-2">
            <span className="font-semibold">Filtrage actuel:</span> {statusFilter}
          </div>
          <div className="space-y-2">
            {pendingTransfers?.map((transfer, index) => (
              <div key={transfer.id} className="p-2 bg-white rounded border border-gray-200">
                <h4 className="font-semibold">Virement #{index + 1}: {transfer.id}</h4>
                <p>Statut: <span className="font-semibold">{transfer.status}</span></p>
                <p>Montant: {transfer.amount}€</p>
                <p>Utilisateur: {transfer.profile?.first_name} {transfer.profile?.last_name}</p>
                <p>Référence: {transfer.reference || 'Non spécifiée'}</p>
              </div>
            ))}
          </div>
          <details className="mt-4">
            <summary className="text-xs font-semibold cursor-pointer">Voir les données JSON complètes</summary>
            <pre className="text-xs overflow-auto max-h-60 p-2 bg-white rounded border border-gray-200 mt-2">
              {JSON.stringify(pendingTransfers, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </>
  );
}
