
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import BankTransferFilters from "@/components/admin/dashboard/BankTransferFilters";
import BankTransferStats from "@/components/admin/dashboard/BankTransferStats";
import { BankTransferItem } from "@/components/admin/dashboard/types/bankTransfer";
import { toast } from "@/hooks/use-toast";

export default function BankTransfersPage() {
  const [bankTransfers, setBankTransfers] = useState<BankTransferItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBankTransfers();
  }, [statusFilter]);

  const fetchBankTransfers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bank transfers with status filter:", statusFilter);

      // Get all transfers from both bank_transfers and wallet_transactions tables
      const fetchBankTransfersPromise = supabase
        .from('bank_transfers')
        .select('*')
        .order('confirmed_at', { ascending: false });

      const fetchWalletTransactionsPromise = supabase
        .from('wallet_transactions')
        .select('*')
        .eq('type', 'deposit');

      // Execute both queries in parallel
      const [bankTransfersResult, walletTransactionsResult] = await Promise.all([
        fetchBankTransfersPromise,
        fetchWalletTransactionsPromise
      ]);

      // Check for errors in bank transfers query
      if (bankTransfersResult.error) {
        console.error("Error fetching bank transfers:", bankTransfersResult.error);
        toast.error("Erreur lors du chargement des virements bancaires", {
          description: bankTransfersResult.error.message
        });
        setIsLoading(false);
        return;
      }

      // Check for errors in wallet transactions query
      if (walletTransactionsResult.error) {
        console.error("Error fetching wallet transactions:", walletTransactionsResult.error);
        toast.error("Erreur lors du chargement des transactions", {
          description: walletTransactionsResult.error.message
        });
        setIsLoading(false);
        return;
      }

      const transfersData = bankTransfersResult.data || [];
      const walletData = walletTransactionsResult.data || [];

      console.log("Fetched bank transfers:", transfersData.length);
      console.log("Fetched wallet transactions:", walletData.length);

      // Combine user IDs from both sources for profile fetch
      const userIds = [
        ...new Set([
          ...transfersData.map(transfer => transfer.user_id),
          ...walletData.map(tx => tx.user_id)
        ])
      ];

      // Fetch user profiles for all IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Create a map of profiles by user ID
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }

      // Format bank transfers
      const formattedBankTransfers: BankTransferItem[] = transfersData.map(item => {
        const userProfile = profilesMap[item.user_id] || {};
        
        return {
          id: item.id,
          created_at: item.confirmed_at || new Date().toISOString(),
          user_id: item.user_id,
          amount: item.amount || 0,
          description: item.notes || "Virement bancaire",
          status: item.status || "pending",
          receipt_confirmed: item.processed || false,
          reference: item.reference || "",
          source: "bank_transfers",
          profile: {
            first_name: userProfile.first_name || "Utilisateur",
            last_name: userProfile.last_name || "Inconnu",
            email: userProfile.email || ""
          }
        };
      });

      // Format wallet transactions as bank transfers
      const formattedWalletTransfers: BankTransferItem[] = walletData.map(item => {
        const userProfile = profilesMap[item.user_id] || {};
        
        return {
          id: item.id,
          created_at: item.created_at || new Date().toISOString(),
          user_id: item.user_id,
          amount: item.amount || 0,
          description: item.description || "Dépôt",
          status: item.status || "pending",
          receipt_confirmed: item.receipt_confirmed || false,
          reference: `Wallet-${item.id.substring(0, 8)}`,
          source: "wallet_transactions",
          profile: {
            first_name: userProfile.first_name || "Utilisateur",
            last_name: userProfile.last_name || "Inconnu",
            email: userProfile.email || ""
          }
        };
      });

      // Combine both types of transfers
      const allTransfers = [...formattedBankTransfers, ...formattedWalletTransfers];
      
      // Apply status filter if needed
      const filteredTransfers = statusFilter === "all" 
        ? allTransfers 
        : allTransfers.filter(item => item.status === statusFilter);

      console.log("Combined transfers count:", allTransfers.length);
      console.log("Filtered transfers count:", filteredTransfers.length);
      
      setBankTransfers(filteredTransfers);
      setTotalCount(filteredTransfers.length);
    } catch (err) {
      console.error("Unexpected error fetching bank transfers:", err);
      toast.error("Une erreur est survenue lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransfers = statusFilter === "all" 
    ? bankTransfers 
    : bankTransfers.filter(item => item.status === statusFilter);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Virements Bancaires | BGS Invest</title>
      </Helmet>
      
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Virements Bancaires</h1>
          <p className="text-gray-600">
            Gérez tous les virements bancaires enregistrés sur la plateforme.
          </p>
        </div>
        
        <BankTransferStats 
          transfers={bankTransfers} 
          isLoading={isLoading}
        />
        
        <BankTransferFilters 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={totalCount}
          isLoading={isLoading}
        />
        
        <BankTransferTable 
          pendingTransfers={filteredTransfers}
          isLoading={isLoading}
          refreshData={fetchBankTransfers}
        />
      </div>
    </DashboardLayout>
  );
}
