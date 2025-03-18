
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import BankTransferFilters from "@/components/admin/dashboard/BankTransferFilters";
import BankTransferStats from "@/components/admin/dashboard/BankTransferStats";
import { BankTransferItem } from "@/components/admin/dashboard/types/bankTransfer";
import { toast } from "sonner";

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

      let query = supabase
        .from('bank_transfers')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `);

      // Apply filter if needed
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      // Execute the query
      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching bank transfers:", error);
        toast.error("Erreur lors du chargement des virements bancaires");
        return;
      }

      console.log("Fetched bank transfers:", data?.length || 0);
      
      if (data) {
        // Format the data to match BankTransferItem interface
        const formattedData: BankTransferItem[] = data.map(item => ({
          id: item.id,
          created_at: item.created_at,
          user_id: item.user_id,
          amount: item.amount,
          description: item.notes || "Virement bancaire",
          status: item.status,
          receipt_confirmed: item.receipt_confirmed || false,
          profile: item.profile,
          reference: item.reference
        }));

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
