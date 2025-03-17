
import React, { useEffect, useState } from "react";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";
import { RefreshCcw, AlertTriangle, Database, Shield } from "lucide-react";
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
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [databasePolicies, setDatabasePolicies] = useState<any[]>([]);

  // Vérifier directement les deux tables au chargement du composant et périodiquement
  useEffect(() => {
    fetchAllTransfers();
    
    // Configurer un timer pour vérifier périodiquement la base de données
    const intervalId = setInterval(fetchAllTransfers, 30000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, []);

  const fetchAllTransfers = async () => {
    try {
      setDebugInfo("Récupération des données de toutes les tables...");
      
      // Vérifier le statut d'authentification
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        setDebugInfo(prev => prev + "\nErreur lors de la vérification de la session: " + authError.message);
      } else {
        const hasSession = !!authData.session;
        setDebugInfo(prev => prev + `\nSession authentifiée: ${hasSession}`);
        
        if (hasSession) {
          setDebugInfo(prev => prev + `\nID User: ${authData.session?.user.id}`);
          setDebugInfo(prev => prev + `\nEmail User: ${authData.session?.user.email}`);
          setDebugInfo(prev => prev + `\nRole User: ${authData.session?.user.app_metadata?.role || 'standard'}`);
          
          // Tenter de récupérer les polices RLS (cette fonction rpc n'existe peut-être pas)
          try {
            // Utiliser une méthode alternative pour récupérer des informations sur les tables
            const { data: tableData, error: tableError } = await supabase
              .from('bank_transfers')
              .select('id')
              .limit(1);
              
            if (tableError) {
              console.error("Erreur d'accès à la table bank_transfers:", tableError);
              setDebugInfo(prev => prev + "\nErreur d'accès aux tables: " + tableError.message);
            } else {
              setDebugInfo(prev => prev + "\nAccès aux tables confirmé");
            }
          } catch (policyError) {
            console.error("Erreur lors de la tentative de récupération des politiques:", policyError);
            setDebugInfo(prev => prev + "\nErreur lors de la vérification des politiques: " + String(policyError));
          }
        }
      }
      
      // Vérifier la table bank_transfers
      const { data: bankTransfers, error: bankTransfersError } = await supabase
        .from("bank_transfers")
        .select("*");
      
      if (bankTransfersError) {
        console.error("Erreur lors de la récupération des bank_transfers:", bankTransfersError);
        setDebugInfo(prev => prev + "\nErreur bank_transfers: " + bankTransfersError.message);
        setDebugInfo(prev => prev + "\nCode: " + bankTransfersError.code);
        setDebugInfo(prev => prev + "\nDétails: " + bankTransfersError.details);
      } else {
        setRawBankTransfers(bankTransfers || []);
        console.log("TOUS les enregistrements bank_transfers:", bankTransfers);
        setDebugInfo(prev => prev + `\nTrouvé ${bankTransfers?.length || 0} enregistrements dans la table bank_transfers`);
      }
      
      // Vérifier la table wallet_transactions
      const { data: walletTransactions, error: walletError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("type", "deposit");
      
      if (walletError) {
        console.error("Erreur lors de la récupération des wallet_transactions:", walletError);
        setDebugInfo(prev => prev + "\nErreur wallet_transactions: " + walletError.message);
        setDebugInfo(prev => prev + "\nCode: " + walletError.code);
        setDebugInfo(prev => prev + "\nDétails: " + walletError.details);
      } else {
        setRawWalletTransactions(walletTransactions || []);
        console.log("TOUS les enregistrements wallet_transactions (dépôts):", walletTransactions);
        setDebugInfo(prev => prev + `\nTrouvé ${walletTransactions?.length || 0} enregistrements de dépôt dans la table wallet_transactions`);
      }
    } catch (error) {
      console.error("Erreur dans fetchAllTransfers:", error);
      setDebugInfo(prev => prev + "\nErreur inattendue: " + String(error));
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
        
        {/* Alerte d'authentification */}
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
        
        {/* Alerte de rôle */}
        {authStatus === "authenticated" && userRole !== "admin" && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Permissions limitées</AlertTitle>
            <AlertDescription>
              Vous êtes connecté avec un rôle limité ({userRole}). Certaines données peuvent ne pas être accessibles.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Alerte d'absence de données */}
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
        
        {/* Panneau d'informations de débogage */}
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
            <p className="text-xs text-blue-700">Statut d'authentification: {authStatus}</p>
            <p className="text-xs text-blue-700">Rôle utilisateur: {userRole}</p>
            <p className="text-xs text-blue-700">Virements chargés dans l'interface: {pendingTransfers?.length || 0}</p>
            <p className="text-xs text-blue-700">Filtre actuel: {statusFilter}</p>
            <p className="text-xs text-blue-700">IDs des virements affichés: {pendingTransfers?.map(t => t.id).join(', ') || 'aucun'}</p>
          </div>
          
          <div className="bg-yellow-50 p-3 border border-yellow-200 rounded mb-4">
            <h4 className="text-sm font-semibold text-yellow-700">Journal de débogage</h4>
            <pre className="text-xs text-yellow-700 whitespace-pre-wrap">{debugInfo || "Aucune information de débogage"}</pre>
          </div>
          
          <div className="bg-green-50 p-3 border border-green-200 rounded">
            <h4 className="text-sm font-semibold text-green-700">Politiques de sécurité</h4>
            <p className="text-xs text-green-700 mb-2">Si vous ne voyez pas de données, veuillez vérifier les politiques de sécurité RLS dans la base de données Supabase.</p>
            <p className="text-xs text-green-700">Les tables bank_transfers et wallet_transactions doivent avoir des politiques qui permettent aux administrateurs de voir toutes les données.</p>
          </div>
          
          <button 
            onClick={fetchAllTransfers}
            className="mt-4 px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
          >
            Rafraîchir les données brutes
          </button>
        </div>
      </div>
    </>
  );
}
