
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

      // Create the base query for bank transfers - without any status filter initially
      let bankTransfersQuery = supabase
        .from('bank_transfers')
        .select('*')
        .order('confirmed_at', { ascending: false });

      // Create the base query for wallet transactions - without any status filter initially
      let walletTransactionsQuery = supabase
        .from('wallet_transactions')
        .select('*')
        .eq('type', 'deposit');

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        bankTransfersQuery = bankTransfersQuery.eq('status', statusFilter);
        walletTransactionsQuery = walletTransactionsQuery.eq('status', statusFilter);
      }

      // Execute both queries in parallel
      const [bankTransfersResult, walletTransactionsResult] = await Promise.all([
        bankTransfersQuery,
        walletTransactionsQuery
      ]);

      // Check for errors in bank transfers query
      if (bankTransfersResult.error) {
        console.error("Error fetching bank transfers:", bankTransfersResult.error);
        toast({
          variant: "destructive",
          title: "Erreur lors du chargement des virements bancaires",
          description: bankTransfersResult.error.message
        });
        setIsLoading(false);
        return;
      }

      // Check for errors in wallet transactions query
      if (walletTransactionsResult.error) {
        console.error("Error fetching wallet transactions:", walletTransactionsResult.error);
        toast({
          variant: "destructive",
          title: "Erreur lors du chargement des transactions",
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
        toast({
          variant: "destructive",
          title: "Erreur lors du chargement des profils",
          description: profilesError.message
        });
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
      
      // Log all transfers to check
      console.log("All transfers before filtering:", allTransfers);
      
      // Sort transfers by created_at date in descending order (newest first)
      allTransfers.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setBankTransfers(allTransfers);
      setTotalCount(allTransfers.length);
      console.log("Total transfers after formatting:", allTransfers.length);
    } catch (err) {
      console.error("Unexpected error fetching bank transfers:", err);
      toast({
        variant: "destructive",
        title: "Une erreur est survenue",
        description: "Impossible de charger les données des virements bancaires"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          pendingTransfers={bankTransfers}
          isLoading={isLoading}
          refreshData={fetchBankTransfers}
        />
      </div>
    </DashboardLayout>
  );
}
