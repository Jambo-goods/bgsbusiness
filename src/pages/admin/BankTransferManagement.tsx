
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";

export default function BankTransferManagement() {
  const { data: pendingTransfers, isLoading, refetch } = useQuery({
    queryKey: ["pendingBankTransfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .eq("type", "bank_transfer")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <>
      <Helmet>
        <title>Gestion des Virements Bancaires | BGS Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Virements Bancaires</h1>
          <button 
            onClick={() => refetch()} 
            className="flex items-center gap-2 px-4 py-2 bg-bgs-blue text-white rounded-md hover:bg-bgs-blue-dark transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            Actualiser
          </button>
        </div>

        <div className="p-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <BankTransferTable 
                pendingTransfers={pendingTransfers || []}
                isLoading={isLoading} 
                refreshData={refetch}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
