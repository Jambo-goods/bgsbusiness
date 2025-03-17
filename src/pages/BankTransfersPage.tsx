
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ArrowDown, ArrowUp, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import { toast } from "sonner";

interface BankTransfer {
  id: string;
  amount: number | null;
  status: string | null;
  reference: string;
  confirmed_at: string | null;
  processed_at: string | null;
  notes: string | null;
  user_id: string;
}

interface UserData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export default function BankTransfersPage() {
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("confirmed_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [userData, setUserData] = useState<Record<string, UserData>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBankTransfers();
    console.log("BankTransfersPage: Composant monté, récupération des virements");
  }, [sortField, sortDirection]);

  const fetchBankTransfers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Tentative de récupération des virements bancaires...");

      // Direct query without authentication check
      const { data, error } = await supabase
        .from("bank_transfers")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        console.error("Erreur lors de la récupération des virements:", error);
        setError(`Erreur: ${error.message}`);
        toast.error(`Erreur lors de la récupération des virements: ${error.message}`);
        return;
      }

      console.log(`Récupération réussie: ${data?.length || 0} virements trouvés`);
      setBankTransfers(data || []);

      // Fetch user data for all transfers
      const userIds = Array.from(new Set((data || []).map(t => t.user_id)));
      if (userIds.length > 0) {
        console.log(`Récupération des données pour ${userIds.length} utilisateurs...`);
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (userError) {
          console.error("Erreur lors de la récupération des profils:", userError);
          toast.warning("Impossible de récupérer les informations des utilisateurs");
        } else {
          const userMap: Record<string, UserData> = {};
          users?.forEach(user => {
            userMap[user.id] = {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email
            };
          });
          console.log(`Données utilisateur récupérées pour ${Object.keys(userMap).length} profils`);
          setUserData(userMap);
        }
      }

      // If no transfers found, show a toast
      if ((data || []).length === 0) {
        toast.info("Aucun virement bancaire trouvé dans la base de données", {
          description: "Si vous venez d'ajouter des virements, ils devraient apparaître rapidement."
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des virements:", error);
      setError("Une erreur est survenue lors de la récupération des données");
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

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'received':
      case 'reçu':
        return 'Reçu';
      case 'processed':
        return 'Traité';
      case 'completed':
        return 'Confirmé';
      case 'rejected':
        return 'Rejeté';
      default:
        return status || 'Inconnu';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'received':
      case 'reçu':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransfers = bankTransfers.filter(transfer => {
    const searchLower = searchTerm.toLowerCase();
    const user = userData[transfer.user_id] || { first_name: null, last_name: null, email: null };
    const userName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    
    return userName.includes(searchLower) || 
           userEmail.includes(searchLower) || 
           transfer.reference.toLowerCase().includes(searchLower) ||
           (transfer.amount && String(transfer.amount).includes(searchTerm));
  });

  // Function to create a test transfer
  const createTestTransfer = async () => {
    try {
      // Generate a random test user ID
      const testUserId = "00000000-0000-0000-0000-000000000000";
      
      // Create a test transfer in the database
      const { data, error } = await supabase
        .from("bank_transfers")
        .insert({
          user_id: testUserId,
          amount: Math.floor(Math.random() * 1000) + 100, // Random amount between 100 and 1100
          reference: `TEST-${Math.floor(Math.random() * 10000)}`,
          status: "pending",
          notes: "Test transfer created for development"
        })
        .select();

      if (error) {
        console.error("Error creating test transfer:", error);
        toast.error("Error creating test transfer");
        return;
      }

      toast.success("Test transfer created successfully", {
        description: "The transfer will appear in the list after refresh."
      });
      
      // Refresh the transfers list
      fetchBankTransfers();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Virements Bancaires</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Rechercher par utilisateur, référence..." 
                className="pl-10 w-full md:w-80" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={fetchBankTransfers}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
              
              <Button 
                variant="secondary"
                onClick={createTestTransfer}
                className="flex items-center gap-2"
              >
                Créer un test
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>Aucun virement bancaire trouvé</p>
              <p className="text-sm text-gray-400 mt-2">
                Les virements apparaîtront ici une fois qu'ils seront enregistrés dans la base de données.
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={createTestTransfer}
              >
                Créer un virement de test
              </Button>
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
                        onClick={() => handleSort("reference")}
                      >
                        <span>Référence</span>
                        {sortField === "reference" && (
                          sortDirection === "asc" ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
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
                        onClick={() => handleSort("confirmed_at")}
                      >
                        <span>Date de Confirmation</span>
                        {sortField === "confirmed_at" && (
                          sortDirection === "asc" ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map(transfer => {
                    const user = userData[transfer.user_id] || { first_name: null, last_name: null, email: null };
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{transfer.reference}</TableCell>
                        <TableCell className="font-medium">{transfer.amount?.toLocaleString()} €</TableCell>
                        <TableCell>{transfer.confirmed_at ? formatDate(transfer.confirmed_at) : "-"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                            {getStatusLabel(transfer.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {transfer.notes || "-"}
                          </div>
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
