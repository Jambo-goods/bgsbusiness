
import React, { useEffect, useState } from "react";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";
import { RefreshCcw, AlertTriangle, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BankTransferStats from "@/components/admin/dashboard/BankTransferStats";
import BankTransferFilters from "@/components/admin/dashboard/BankTransferFilters";
import { useBankTransferData } from "@/components/admin/dashboard/hooks/useBankTransferData";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BankTransferManagement() {
  const { 
    pendingTransfers, 
    isLoading, 
    isError, 
    statusFilter, 
    setStatusFilter, 
    refetch, 
    handleManualRefresh,
    authStatus,
    userRole
  } = useBankTransferData();
  
  const [rawBankTransfers, setRawBankTransfers] = useState<any[]>([]);
  const [rawWalletTransactions, setRawWalletTransactions] = useState<any[]>([]);

  // Check both tables on component load and periodically
  useEffect(() => {
    fetchAllTransfers();
    
    // Set up a timer to periodically check the database
    const intervalId = setInterval(fetchAllTransfers, 30000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const fetchAllTransfers = async () => {
    try {
      // Check the bank_transfers table
      const { data: bankTransfers, error: bankTransfersError } = await supabase
        .from("bank_transfers")
        .select("*")
        .order('confirmed_at', { ascending: false });
      
      if (bankTransfersError) {
        console.error("Erreur lors de la récupération des bank_transfers:", bankTransfersError);
      } else {
        setRawBankTransfers(bankTransfers || []);
        console.log("TOUS les enregistrements bank_transfers:", bankTransfers);
      }
      
      // Check the wallet_transactions table
      const { data: walletTransactions, error: walletError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("type", "deposit");
      
      if (walletError) {
        console.error("Erreur lors de la récupération des wallet_transactions:", walletError);
      } else {
        setRawWalletTransactions(walletTransactions || []);
        console.log("TOUS les enregistrements wallet_transactions (dépôts):", walletTransactions);
      }
    } catch (error) {
      console.error("Erreur dans fetchAllTransfers:", error);
    }
  };

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
        
        {/* Authentication alert */}
        {authStatus !== "authenticated" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Problème d'authentification</AlertTitle>
            <AlertDescription>
              Vous n'êtes pas authentifié ou votre session a expiré. Cela peut empêcher l'accès aux données. 
              Statut actuel: {authStatus}
            </AlertDescription>
          </Alert>
        )}
        
        {/* No data alert */}
        {!isLoading && (!rawBankTransfers || rawBankTransfers.length === 0) && 
         (!rawWalletTransactions || rawWalletTransactions.length === 0) && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>Aucune donnée trouvée</AlertTitle>
            <AlertDescription>
              Aucun enregistrement n'a été trouvé dans les tables bank_transfers et wallet_transactions.
              Cela peut être dû à l'absence de données ou à des problèmes de permissions (RLS).
            </AlertDescription>
          </Alert>
        )}
        
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm">Impossible de récupérer les données des virements. Veuillez réessayer.</p>
          </div>
        )}

        <BankTransferStats 
          transfers={pendingTransfers || rawBankTransfers} 
          isLoading={isLoading} 
        />
        
        <BankTransferFilters 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={pendingTransfers?.length || rawBankTransfers?.length || 0}
          isLoading={isLoading}
        />

        <div>
          <Card>
            <CardContent className="p-0">
              <BankTransferTable 
                pendingTransfers={pendingTransfers && pendingTransfers.length > 0 ? pendingTransfers : rawBankTransfers}
                isLoading={isLoading}
                refreshData={refetch}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
