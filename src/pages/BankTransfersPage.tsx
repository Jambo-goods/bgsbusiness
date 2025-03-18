
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

      // First, get the bank transfers data
      let query = supabase
        .from('bank_transfers')
        .select('*');

      // Apply filter if needed
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      // Execute the query
      const { data: transfersData, error: transfersError } = await query.order('confirmed_at', { ascending: false });

      if (transfersError) {
        console.error("Error fetching bank transfers:", transfersError);
        toast.error("Erreur lors du chargement des virements bancaires", {
          description: transfersError.message
        });
        setIsLoading(false);
        return;
      }

      // Fetch user profiles separately
      const userIds = transfersData.map(transfer => transfer.user_id);
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

      console.log("Fetched bank transfers:", transfersData?.length || 0);
      
      if (transfersData) {
        // Format the data to match BankTransferItem interface
        const formattedData: BankTransferItem[] = transfersData.map(item => {
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
            profile: {
              first_name: userProfile.first_name || "Utilisateur",
              last_name: userProfile.last_name || "Inconnu",
              email: userProfile.email || ""
            }
          };
        });

        setBankTransfers(formattedData);
        setTotalCount(formattedData.length);
      }
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
