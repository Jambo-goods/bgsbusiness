
import React, { useEffect, useState } from "react";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BankTransferStats from "@/components/admin/dashboard/BankTransferStats";
import BankTransferFilters from "@/components/admin/dashboard/BankTransferFilters";
import { useBankTransferData } from "@/components/admin/dashboard/hooks/useBankTransferData";
import { supabase } from "@/integrations/supabase/client";

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
  
  const [rawBankTransfers, setRawBankTransfers] = useState<any[]>([]);
  const [rawWalletTransactions, setRawWalletTransactions] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Directly check both tables on component mount and periodically
  useEffect(() => {
    fetchAllTransfers();
    
    // Set up a timer to periodically check the database
    const intervalId = setInterval(fetchAllTransfers, 20000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchAllTransfers = async () => {
    try {
      setDebugInfo("Fetching all transfers from both tables...");
      
      // Check bank_transfers table
      const { data: bankTransfers, error: bankTransfersError } = await supabase
        .from("bank_transfers")
        .select("*");
      
      if (bankTransfersError) {
        console.error("Error fetching all bank_transfers:", bankTransfersError);
        setDebugInfo(prev => prev + "\nError fetching bank_transfers: " + bankTransfersError.message);
      } else {
        setRawBankTransfers(bankTransfers || []);
        console.log("ALL bank_transfers records:", bankTransfers);
        setDebugInfo(prev => prev + `\nFound ${bankTransfers?.length || 0} records in bank_transfers table`);
      }
      
      // Check wallet_transactions table
      const { data: walletTransactions, error: walletError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("type", "deposit");
      
      if (walletError) {
        console.error("Error fetching all wallet transactions:", walletError);
        setDebugInfo(prev => prev + "\nError fetching wallet_transactions: " + walletError.message);
      } else {
        setRawWalletTransactions(walletTransactions || []);
        console.log("ALL wallet_transactions (deposit) records:", walletTransactions);
        setDebugInfo(prev => prev + `\nFound ${walletTransactions?.length || 0} deposit records in wallet_transactions table`);
      }
      
      // Check database permissions
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        setDebugInfo(prev => prev + "\nError checking auth session: " + authError.message);
      } else {
        const hasSession = !!authData.session;
        setDebugInfo(prev => prev + `\nAuthenticated session exists: ${hasSession}`);
        
        if (hasSession) {
          setDebugInfo(prev => prev + `\nUser role: ${authData.session?.user.role || 'unknown'}`);
        }
      }
    } catch (error) {
      console.error("Error in fetchAllTransfers:", error);
      setDebugInfo(prev => prev + "\nUnexpected error: " + String(error));
    }
  };

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
            onClick={() => {
              handleManualRefresh();
              fetchAllTransfers();
            }} 
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
        
        {/* Enhanced debug information panel */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Informations de débogage détaillées</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold">Données brutes - bank_transfers ({rawBankTransfers.length})</h4>
              <div className="bg-white p-2 rounded border h-40 overflow-auto">
                <pre className="text-xs">{JSON.stringify(rawBankTransfers, null, 2)}</pre>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Données brutes - wallet_transactions ({rawWalletTransactions.length})</h4>
              <div className="bg-white p-2 rounded border h-40 overflow-auto">
                <pre className="text-xs">{JSON.stringify(rawWalletTransactions, null, 2)}</pre>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 border border-blue-200 rounded mb-4">
            <h4 className="text-sm font-semibold text-blue-700">Statut des données</h4>
            <p className="text-xs text-blue-700">Virements chargés dans l'interface: {pendingTransfers?.length || 0}</p>
            <p className="text-xs text-blue-700">Filtre actuel: {statusFilter}</p>
            <p className="text-xs text-blue-700">IDs des virements affichés: {pendingTransfers?.map(t => t.id).join(', ') || 'aucun'}</p>
          </div>
          
          <div className="bg-yellow-50 p-3 border border-yellow-200 rounded mb-4">
            <h4 className="text-sm font-semibold text-yellow-700">Journal de débogage</h4>
            <pre className="text-xs text-yellow-700 whitespace-pre-wrap">{debugInfo || "Aucune information de débogage"}</pre>
          </div>
          
          <button 
            onClick={fetchAllTransfers}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
          >
            Rafraîchir les données brutes
          </button>
        </div>
      </div>
    </>
  );
}
