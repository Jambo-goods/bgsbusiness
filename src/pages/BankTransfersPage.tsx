
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Simple interface for bank transfers
interface BankTransfer {
  id: string;
  user_id: string;
  amount: number | null;
  reference: string;
  status: string | null;
  confirmed_at: string | null;
  processed_at: string | null;
  notes: string | null;
}

// Simple interface for user data
interface UserData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export default function BankTransfersPage() {
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState<Record<string, UserData>>({});

  useEffect(() => {
    console.log("BankTransfersPage mounted, fetching data...");
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching bank transfers...");

      const { data, error } = await supabase
        .from("bank_transfers")
        .select("*");

      if (error) {
        console.error("Error fetching transfers:", error);
        toast.error("Erreur lors du chargement des transferts");
        setTransfers([]);
      } else {
        console.log(`Found ${data.length} transfers:`, data);
        setTransfers(data || []);
        
        // Get user information if transfers exist
        if (data && data.length > 0) {
          fetchUserData(data.map(t => t.user_id));
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (userIds: string[]) => {
    try {
      // Get unique user IDs
      const uniqueUserIds = [...new Set(userIds)];
      
      if (uniqueUserIds.length === 0) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", uniqueUserIds);

      if (error) {
        console.error("Error fetching user data:", error);
      } else if (data) {
        // Create a map of user data
        const userMap: Record<string, UserData> = {};
        data.forEach(user => {
          userMap[user.id] = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
          };
        });
        setUserData(userMap);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // Format date in a simple way
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Simple filtering
  const filteredTransfers = transfers.filter(transfer => {
    const searchLower = searchTerm.toLowerCase();
    const user = userData[transfer.user_id] || {};
    const userName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    
    return userName.includes(searchLower) || 
           (transfer.reference && transfer.reference.toLowerCase().includes(searchLower)) ||
           (transfer.amount && String(transfer.amount).includes(searchTerm));
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Transferts Bancaires</h1>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-white border-b">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  type="text" 
                  placeholder="Rechercher un transfert..." 
                  className="pl-10 w-full md:w-80" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <Button 
                variant="outline"
                onClick={fetchTransfers}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Rafraîchir
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="text-center p-12">
                <p className="text-gray-500 font-medium">Aucun transfert bancaire trouvé</p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchTerm ? "Essayez de modifier votre recherche" : "Les transferts apparaîtront ici une fois enregistrés"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfers.map(transfer => {
                      const user = userData[transfer.user_id] || {};
                      return (
                        <TableRow key={transfer.id} className="hover:bg-gray-50">
                          <TableCell>{formatDate(transfer.confirmed_at)}</TableCell>
                          <TableCell>
                            {user.first_name || user.last_name ? (
                              <div>
                                <div className="font-medium">{user.first_name} {user.last_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Utilisateur inconnu</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{transfer.reference}</TableCell>
                          <TableCell className="font-medium">
                            {transfer.amount ? `${transfer.amount} €` : '—'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={transfer.status} />
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {transfer.notes || "—"}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string | null }) {
  let bgColor = "bg-gray-100 text-gray-800";
  let label = status || "Inconnu";

  switch (status) {
    case 'pending':
      bgColor = "bg-yellow-100 text-yellow-800";
      label = "En attente";
      break;
    case 'received':
    case 'reçu':
      bgColor = "bg-blue-100 text-blue-800";
      label = "Reçu";
      break;
    case 'processed':
    case 'completed':
      bgColor = "bg-green-100 text-green-800";
      label = "Confirmé";
      break;
    case 'rejected':
      bgColor = "bg-red-100 text-red-800";
      label = "Rejeté";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {label}
    </span>
  );
}
