
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import BankTransferFilters from "@/components/admin/dashboard/BankTransferFilters";
import BankTransferStats from "@/components/admin/dashboard/BankTransferStats";
import { BankTransferItem } from "@/components/admin/dashboard/types/bankTransfer";
import { toast } from "@/hooks/use-toast";
import { useUserSession } from "@/hooks/dashboard/useUserSession";

export default function BankTransfersPage() {
  const [bankTransfers, setBankTransfers] = useState<BankTransferItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalCount, setTotalCount] = useState(0);
  const { userId } = useUserSession();

  useEffect(() => {
    fetchBankTransfers();
  }, [statusFilter]);

  const fetchBankTransfers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bank transfers with status filter:", statusFilter);

      // Récupérer TOUS les virements bancaires sans filtre par utilisateur
      let query = supabase
        .from('bank_transfers')
        .select('*');

      // Appliquer le filtre par statut si nécessaire
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      // Exécuter la requête
      const { data: transfersData, error: transfersError } = await query.order('confirmed_at', { ascending: false });

      if (transfersError) {
        console.error("Error fetching bank transfers:", transfersError);
        toast.error("Erreur lors du chargement des virements bancaires");
        setIsLoading(false);
        return;
      }

      console.log("Bank transfers data count:", transfersData?.length || 0);
      
      if (!transfersData || transfersData.length === 0) {
        console.log("No bank transfers found");
        setBankTransfers([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      // Récupérer tous les profils utilisateurs
      const userIds = [
        ...new Set(transfersData?.map(transfer => transfer.user_id) || [])
      ].filter(Boolean); // Supprimer les valeurs null/undefined
      
      console.log("Unique user IDs count:", userIds.length);

      if (userIds.length === 0) {
        console.log("No user IDs found, setting empty bank transfers");
        setBankTransfers([]);
        setTotalCount(0);
        setIsLoading(false);
        return;
      }

      // Récupérer tous les profils en une seule requête
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Erreur lors du chargement des profils utilisateurs");
      }

      // Créer une map des profils par ID utilisateur
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }

      console.log("Profiles fetched count:", profilesData?.length || 0);
      
      // Formater les virements bancaires
      const formattedTransfers: BankTransferItem[] = [];
      
      // Ajouter uniquement les virements bancaires
      if (transfersData) {
        const bankItems = transfersData.map(item => {
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
        
        formattedTransfers.push(...bankItems);
      }

      console.log("Total formatted transfers:", formattedTransfers.length);
      console.log("Transfers IDs:", formattedTransfers.map(t => t.id).join(', '));
      
      setBankTransfers(formattedTransfers);
      setTotalCount(formattedTransfers.length);
    } catch (err) {
      console.error("Unexpected error fetching bank transfers:", err);
      toast.error("Une erreur est survenue lors du chargement des données");
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
            Visualisez tous les virements bancaires enregistrés sur la plateforme.
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
