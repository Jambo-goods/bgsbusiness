
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowDown, ArrowUp, Loader2, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import StatusBadge from "@/components/dashboard/tabs/wallet/withdrawal-table/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BankTransfer {
  id: string;
  amount: number | null;
  status: string | null;
  reference: string;
  confirmed_at: string | null;
  processed_at: string | null;
  notes: string | null;
  user_id: string;
  processed: boolean;
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
  
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransfer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("");
  const [processedDate, setProcessedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchBankTransfers();

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
      console.log("Fetching bank transfers...");
      
      const { data, error } = await supabase
        .from("bank_transfers")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;

      console.log("Received bank transfers:", data);
      const transfersData = data || [];
      setBankTransfers(transfersData as BankTransfer[]);

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
      toast.error("Erreur lors du chargement des virements");
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

  const handleEditTransfer = (transfer: BankTransfer) => {
    setSelectedTransfer(transfer);
    setEditStatus(transfer.status || "");
    setProcessedDate(transfer.processed_at ? new Date(transfer.processed_at) : undefined);
    setIsEditModalOpen(true);
    setUpdateError(null);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransfer) return;
    
    setIsSubmitting(true);
    setUpdateError(null);
    
    try {
      console.log(`Updating bank transfer with status: ${editStatus} (ID: ${selectedTransfer.id})`);
      
      // Always ensure we have a processed date for "received" status
      let finalProcessedDate = processedDate;
      if ((editStatus === 'received' || editStatus === 'reçu') && !processedDate) {
        finalProcessedDate = new Date();
        console.log("Automatically setting processed date to now:", finalProcessedDate);
      }
      
      // Create the update payload
      const updatePayload = {
        transferId: selectedTransfer.id,
        status: editStatus,
        processed: editStatus === 'received' || editStatus === 'reçu',
        processedAt: finalProcessedDate ? finalProcessedDate.toISOString() : null,
        notes: `Mise à jour manuelle le ${new Date().toLocaleDateString('fr-FR')}`
      };
      
      console.log("Sending update with payload:", updatePayload);
      
      // Multiple attempts strategy
      let updateSuccess = false;
      let statusVerified = false;
      let responseMessage = "";
      
      // 1. First try the edge function approach
      console.log("Calling Edge Function with payload...");
      const { data: functionData, error: functionError } = await supabase.functions.invoke('update-bank-transfer', {
        body: updatePayload
      });
      
      if (functionError) {
        console.error("Erreur lors de l'appel à la fonction Edge:", functionError);
        responseMessage = `Erreur de la fonction Edge: ${functionError.message}`;
        throw new Error(responseMessage);
      }
      
      console.log("Edge function response:", functionData);
      
      if (functionData && functionData.success) {
        updateSuccess = true;
        statusVerified = functionData.verified;
        responseMessage = functionData.message;
        
        // Show warning if verification failed
        if (!functionData.verified) {
          console.warn("Edge function reports success but verification failed. Current status:", functionData.currentStatus);
          setUpdateError(`Attention: Le statut peut ne pas avoir été correctement mis à jour. Statut actuel: ${functionData.currentStatus}`);
          toast.warning("La mise à jour a été tentée mais pourrait ne pas avoir pris effet. Vérifiez le statut.");
        } else {
          console.log("Edge function reports complete success. Status updated to:", functionData.currentStatus);
          toast.success("Virement bancaire mis à jour avec succès");
          closeEditModal();
        }
      } else if (functionData) {
        // Something else went wrong
        const errorMsg = functionData.error || "Une erreur inconnue est survenue";
        console.error("Update failed with error:", errorMsg);
        setUpdateError(`Échec de la mise à jour: ${errorMsg}`);
        
        // Still try direct update as fallback
        updateSuccess = false;
      }
      
      // 2. If edge function failed or verification failed, try direct update
      if (!updateSuccess || !statusVerified) {
        console.log("Trying direct update as fallback...");
        
        // Prepare update data for direct update
        const updates = {
          status: editStatus,
          processed: editStatus === 'received' || editStatus === 'reçu',
          processed_at: finalProcessedDate ? finalProcessedDate.toISOString() : null,
          notes: `Mise à jour manuelle (fallback) le ${new Date().toLocaleDateString('fr-FR')}`
        };
        
        const { data, error: directError } = await supabase
          .from('bank_transfers')
          .update(updates)
          .eq('id', selectedTransfer.id)
          .select();
        
        if (directError) {
          console.error("Erreur lors de la mise à jour directe:", directError);
          if (!updateSuccess) { // Only show error if the edge function also failed
            setUpdateError(`${updateError || ""}\nMise à jour directe échouée: ${directError.message}`);
            toast.error(`Erreur de mise à jour: ${directError.message}`);
          }
        } else {
          console.log("Direct update succeeded:", data);
          if (!updateSuccess) { // If edge function failed but this succeeded
            toast.success("Virement bancaire mis à jour via méthode secondaire");
            closeEditModal();
          }
          updateSuccess = true;
        }
      }
      
      // 3. Final verification and notification to user
      if (updateSuccess) {
        // Verify the status one more time
        const { data: verifyData } = await supabase
          .from('bank_transfers')
          .select('status, processed, processed_at')
          .eq('id', selectedTransfer.id)
          .single();
          
        if (verifyData && verifyData.status === editStatus) {
          console.log("Final verification successful");
          toast.success("Statut du virement vérifié et confirmé");
          statusVerified = true;
        } else if (verifyData) {
          console.warn(`Final verification failed. Expected: ${editStatus}, Got: ${verifyData.status}`);
          toast.warning(`Attention: Le statut peut être "${verifyData.status}" au lieu de "${editStatus}"`);
        }
      }
      
      // Always force refresh the transfers list
      await fetchBankTransfers();
      
      // Close modal if update was successful
      if (updateSuccess) {
        closeEditModal();
      }
      
    } catch (error: any) {
      console.error("Erreur globale lors de la mise à jour:", error);
      setUpdateError(error.message || "Une erreur inconnue est survenue");
      toast.error(`Erreur de mise à jour: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransfer(null);
    setUpdateError(null);
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
    { value: "rejected", label: "Rejeté" },
    { value: "cancelled", label: "Annulé" }
  ];

  const forceRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchBankTransfers();
      toast.success("Données actualisées");
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
      toast.error("Échec de l'actualisation des données");
    } finally {
      setIsLoading(false);
    }
  };

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
              onClick={forceRefresh}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
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
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 hover:text-gray-700" 
                        onClick={() => handleSort("status")}
                      >
                        <span>Statut</span>
                        {sortField === "status" && (
                          sortDirection === "asc" ? 
                            <ArrowUp className="h-4 w-4" /> : 
                            <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
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
                          <StatusBadge status={transfer.status || 'pending'} />
                          {transfer.processed && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Traité</span>}
                        </TableCell>
                        <TableCell>{transfer.processed_at ? formatDate(transfer.processed_at) : "-"}</TableCell>
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

      <Dialog open={isEditModalOpen} onOpenChange={open => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le virement bancaire</DialogTitle>
            <DialogDescription>
              Mise à jour du virement {selectedTransfer?.reference}
            </DialogDescription>
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
              <div className="text-sm text-gray-500 mt-1">
                <span className="font-medium">Important:</span> La date de traitement est essentielle pour marquer le virement comme traité
              </div>
            </div>
            
            {updateError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Erreur de mise à jour</AlertTitle>
                <AlertDescription className="text-sm">
                  {updateError}
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditModal}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </> : 
                  "Mettre à jour"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
