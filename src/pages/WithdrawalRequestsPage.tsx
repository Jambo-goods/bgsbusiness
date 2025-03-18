
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { formatDate, maskAccountNumber } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import StatusBadge from "@/components/dashboard/tabs/wallet/withdrawal-table/StatusBadge";
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  bank_info: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  } | Record<string, any>;
  user_id: string;
}

interface UserData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export default function WithdrawalRequestsPage() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("requested_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [userData, setUserData] = useState<Record<string, UserData>>({});

  useEffect(() => {
    fetchWithdrawalRequests();

    // Set up real-time listener for the withdrawal_requests table
    const withdrawalChannel = supabase
      .channel("withdrawal_requests_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "withdrawal_requests"
      }, (payload) => {
        console.log("Withdrawal request change detected:", payload);
        fetchWithdrawalRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(withdrawalChannel);
    };
  }, [sortField, sortDirection]);

  const fetchWithdrawalRequests = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all withdrawal requests...");
      
      // Debug: Check the Supabase client
      if (!supabase) {
        console.error("Supabase client is not initialized");
        toast.error("Erreur de connexion à la base de données");
        return;
      }

      // Requête sans filtre par utilisateur pour récupérer toutes les demandes de retrait
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("Error fetching withdrawal requests:", error);
        toast.error("Impossible de charger les demandes de retrait");
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} withdrawal requests`);
      console.log("Withdrawal data:", data);
      
      const withdrawalData = data || [];
      setWithdrawalRequests(withdrawalData as WithdrawalRequest[]);

      if (withdrawalData.length === 0) {
        console.log("No withdrawal requests found in the database");
      }

      // Fetch user data for all requests
      const userIds = Array.from(new Set(withdrawalData.map(w => w.user_id)));
      if (userIds.length > 0) {
        console.log(`Fetching profile data for ${userIds.length} users`);
        console.log("User IDs:", userIds);
        
        // Récupérer toutes les données de profil sans restriction
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (userError) {
          console.error("Error fetching profiles:", userError);
          toast.error("Impossible de charger les données des utilisateurs");
          throw userError;
        }

        console.log(`Retrieved ${users?.length || 0} user profiles`);
        const userMap: Record<string, UserData> = {};
        users?.forEach(user => {
          userMap[user.id] = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
          };
        });
        setUserData(userMap);
      }
    } catch (error) {
      console.error("Error in fetchWithdrawalRequests:", error);
      toast.error("Une erreur est survenue lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredRequests = withdrawalRequests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    const user = userData[request.user_id] || { first_name: null, last_name: null, email: null };
    const userName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    
    return userName.includes(searchLower) || 
           userEmail.includes(searchLower) || 
           String(request.amount).includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Toutes les Demandes de Retrait</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-10 w-full md:w-80" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <Button 
              onClick={fetchWithdrawalRequests} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Loader2 className={isLoading ? "animate-spin h-4 w-4" : "h-4 w-4"} />
              Actualiser
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Aucune demande de retrait trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700" 
                        onClick={() => handleSort("amount")}
                      >
                        <span>Montant</span>
                        {sortField === "amount" && (
                          sortDirection === "asc" ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700" 
                        onClick={() => handleSort("requested_at")}
                      >
                        <span>Date de Demande</span>
                        {sortField === "requested_at" && (
                          sortDirection === "asc" ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Banque</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700" 
                        onClick={() => handleSort("processed_at")}
                      >
                        <span>Date de Traitement</span>
                        {sortField === "processed_at" && (
                          sortDirection === "asc" ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map(request => {
                    const user = userData[request.user_id] || { first_name: null, last_name: null, email: null };
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{request.amount?.toLocaleString()} €</TableCell>
                        <TableCell>{formatDate(request.requested_at)}</TableCell>
                        <TableCell>{request.bank_info?.bankName || "-"}</TableCell>
                        <TableCell>{maskAccountNumber(request.bank_info?.accountNumber || "")}</TableCell>
                        <TableCell><StatusBadge status={request.status} /></TableCell>
                        <TableCell>
                          {request.processed_at ? formatDate(request.processed_at) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
