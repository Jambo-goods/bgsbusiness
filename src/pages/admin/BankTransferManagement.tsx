
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { Helmet } from "react-helmet-async";
import { BankTransferItem } from "@/components/admin/dashboard/types/bankTransfer";
import { RefreshCcw, Filter } from "lucide-react";
import { toast } from "sonner";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BankTransferManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: pendingTransfers, isLoading, refetch, isError } = useQuery({
    queryKey: ["pendingBankTransfers", statusFilter],
    queryFn: async () => {
      try {
        console.log("Fetching bank transfers with status filter:", statusFilter);
        
        // Build the query for fetching bank transfers
        let query = supabase
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
          .eq("type", "deposit")
          .order("created_at", { ascending: false });
        
        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        
        const { data, error } = await query;

        if (error) {
          console.error("Erreur lors de la récupération des virements:", error);
          toast.error("Impossible de récupérer les données des virements");
          throw error;
        }

        console.log("Virements récupérés:", data);
        
        // Filter transactions that mention "Virement bancaire" in their description
        const bankTransfers = data?.filter(transaction => 
          transaction.description?.toLowerCase().includes("virement bancaire")
        ) || [];
        
        console.log("Virements bancaires filtrés:", bankTransfers);

        // Fetch user profiles in a single batch to reduce number of queries
        if (bankTransfers.length === 0) {
          return [];
        }
        
        // Extract unique user IDs
        const userIds = [...new Set(bankTransfers.map(transfer => transfer.user_id))];
        
        // Fetch all profiles in one query
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);
          
        if (profilesError) {
          console.error("Erreur lors de la récupération des profils:", profilesError);
          toast.error("Impossible de récupérer les données des utilisateurs");
        }
        
        // Create a map of user profiles for quick lookup
        const profilesMap = (profilesData || []).reduce((map, profile) => {
          map[profile.id] = profile;
          return map;
        }, {} as Record<string, any>);
        
        // Combine transfer data with profiles
        const transfersWithProfiles = bankTransfers.map(transfer => {
          const profile = profilesMap[transfer.user_id] || {
            first_name: "Utilisateur",
            last_name: "Inconnu",
            email: null
          };
          
          return {
            ...transfer,
            profile: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email
            }
          };
        });
        
        console.log("Virements avec profils:", transfersWithProfiles);
        return transfersWithProfiles as BankTransferItem[];
      } catch (error) {
        console.error("Erreur globale:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
        return [];
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds automatically
    staleTime: 10000, // Consider data fresh for 10 seconds
    retry: 2 // Retry failed requests up to 2 times
  });

  const handleManualRefresh = () => {
    toast.info("Actualisation des données...");
    refetch();
  };
  
  const transferCounts = {
    total: pendingTransfers?.length || 0,
    pending: pendingTransfers?.filter(t => t.status === "pending").length || 0,
    completed: pendingTransfers?.filter(t => t.status === "completed").length || 0,
    rejected: pendingTransfers?.filter(t => t.status === "rejected").length || 0
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
        
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm">Impossible de récupérer les données des virements. Veuillez réessayer.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.total}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.pending}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Confirmés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.completed}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Rejetés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.rejected}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtrer par statut:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="completed">Confirmés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-500">
            {!isLoading && (
              <>
                {transferCounts.total === 0 ? 
                  "Aucun virement bancaire trouvé" : 
                  `${transferCounts.total} virements bancaires trouvés`
                }
              </>
            )}
          </div>
        </div>

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
      </div>
    </>
  );
}
