
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowDown, ArrowUp, Loader2, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

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
  
  // États pour l'édition
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransfer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("");
  const [processedDate, setProcessedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBankTransfers();

    // Set up real-time listener for the bank_transfers table
    const bankTransferChannel = supabase
      .channel("bank_transfers_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "bank_transfers"
      }, (payload) => {
        console.log("Bank transfer change detected:", payload);
        fetchBankTransfers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bankTransferChannel);
    };
  }, [sortField, sortDirection]);

  const fetchBankTransfers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("bank_transfers")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;

      const transfersData = data || [];
      setBankTransfers(transfersData as BankTransfer[]);

      // Fetch user data for all transfers
      const userIds = Array.from(new Set(transfersData.map(t => t.user_id)));
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", userIds);

        if (userError) throw userError;

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
      console.error("Error fetching bank transfers:", error);
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
      case 'confirmed':
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
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditTransfer = (transfer: BankTransfer) => {
    setSelectedTransfer(transfer);
    setEditStatus(transfer.status || "");
    setProcessedDate(transfer.processed_at ? new Date(transfer.processed_at) : undefined);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransfer) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('bank_transfers')
        .update({
          status: editStatus,
          processed_at: processedDate ? processedDate.toISOString() : null,
          notes: `Mise à jour manuelle le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', selectedTransfer.id);
      
      if (error) throw error;
      
      toast.success("Virement bancaire mis à jour avec succès");
      fetchBankTransfers();
      closeEditModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du virement:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransfer(null);
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

  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "received", label: "Reçu" },
    { value: "processed", label: "Traité" },
    { value: "confirmed", label: "Confirmé" },
    { value: "rejected", label: "Rejeté" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Virements Bancaires</h1>
        
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
            <Button 
              variant="outline"
              onClick={fetchBankTransfers}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Aucun virement bancaire trouvé
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
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditTransfer(transfer)} 
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Éditer</span>
                          </Button>
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

      {/* Modal d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={open => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le virement bancaire</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input 
                id="reference"
                value={selectedTransfer?.reference || ""}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <Input 
                id="amount"
                value={`${selectedTransfer?.amount || 0} €`}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                required
              >
                <option value="" disabled>Sélectionner un statut</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="processedDate">Date de traitement</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="processedDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !processedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {processedDate ? format(processedDate, "P", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={processedDate}
                    onSelect={setProcessedDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
