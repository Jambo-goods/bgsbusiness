
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";
import { BankTransferItem } from "@/components/admin/dashboard/types/bankTransfer";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function BankTransferManagement() {
  const { data: pendingTransfers, isLoading, refetch } = useQuery({
    queryKey: ["pendingBankTransfers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("wallet_transactions")
          .select(`
            id,
            created_at,
            user_id,
            amount,
            description,
            status,
            type,
            receipt_confirmed
          `)
          .eq("type", "bank_transfer")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erreur lors de la récupération des virements:", error);
          toast.error("Impossible de récupérer les données des virements");
          throw error;
        }

        console.log("Virements récupérés:", data);

        // Récupérer les informations des utilisateurs séparément
        const userProfiles = await Promise.all(
          (data || []).map(async (transfer) => {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("id", transfer.user_id)
              .single();

            if (profileError) {
              console.error("Erreur lors de la récupération du profil:", profileError);
              return {
                ...transfer,
                profile: {
                  first_name: "Utilisateur",
                  last_name: "Inconnu",
                  email: null
                }
              };
            }

            return {
              ...transfer,
              profile: profileData
            };
          })
        );

        console.log("Virements avec profils:", userProfiles);
        return userProfiles as BankTransferItem[];
      } catch (error) {
        console.error("Erreur globale:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
        return [];
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds automatically
  });

  const handleManualRefresh = () => {
    toast.info("Actualisation des données...");
    refetch();
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
            onClick={handleManualRefresh} 
            className="flex items-center gap-2 px-4 py-2 bg-bgs-blue text-white rounded-md hover:bg-bgs-blue-dark transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
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
