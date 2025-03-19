
import React, { useState, useEffect, useCallback } from "react";
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
  const [updateDetails, setUpdateDetails] = useState<any>(null);

  // Memoize the fetchBankTransfers function to prevent unnecessary re-renders
  const fetchBankTransfers = useCallback(async () => {
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
  }, [sortField, sortDirection]);

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
  }, [fetchBankTransfers]);

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
    setUpdateDetails(null);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransfer) return;
    
    setIsSubmitting(true);
    setUpdateError(null);
    setUpdateDetails(null);
    
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
      
      // First attempt - try edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('update-bank-transfer', {
        body: updatePayload
      });
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        setUpdateDetails({
          type: "error",
          message: `Erreur lors de l'appel à la fonction: ${functionError.message}`
        });
        
        // Try direct update as a fallback
        const { error: directError } = await supabase
          .from('bank_transfers')
          .update({
            status: editStatus,
            processed: editStatus === 'received' || editStatus === 'reçu',
            processed_at: finalProcessedDate ? finalProcessedDate.toISOString() : null,
            notes: `Mise à jour directe le ${new Date().toLocaleDateString('fr-FR')}`
          })
          .eq('id', selectedTransfer.id);
          
        if (directError) {
          throw new Error(`Échec de la mise à jour directe: ${directError.message}`);
        }
        
        toast.success("Virement bancaire mis à jour directement (fallback)");
        
        // Wait for database changes to propagate
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetchBankTransfers();
        closeEditModal();
        return;
      }
      
      console.log("Edge function response:", functionData);
      setUpdateDetails(functionData);
      
      if (functionData && functionData.success) {
        // Check if verification was successful
        toast.success("Virement bancaire mis à jour avec succès");
        
        // Wait a longer time for database changes to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchBankTransfers();
        closeEditModal();
      } else {
        setUpdateError("La mise à jour a échoué. Consultez les détails ci-dessous.");
        setUpdateDetails(functionData || { error: "Aucune réponse de la fonction" });
        toast.error("Échec de la mise à jour du virement bancaire");
        
        // Try direct update
        try {
          console.log("Attempting direct update as fallback");
          const { error: directUpdateError } = await supabase
            .from('bank_transfers')
            .update({
              status: editStatus,
              processed: editStatus === 'received' || editStatus === 'reçu',
              processed_at: finalProcessedDate ? finalProcessedDate.toISOString() : null,
              notes: `Mise à jour forcée le ${new Date().toLocaleDateString('fr-FR')}`
            })
            .eq('id', selectedTransfer.id);
            
          if (directUpdateError) {
            console.error("Direct update fallback failed:", directUpdateError);
          } else {
            console.log("Direct update succeeded as fallback");
            toast.success("Virement bancaire mis à jour avec la méthode de secours");
            await new Promise(resolve => setTimeout(resolve, 1500));
            await fetchBankTransfers();
            closeEditModal();
          }
        } catch (directError) {
          console.error("Direct update error:", directError);
        }
      }
    } catch (error: any) {
      console.error("Update error:", error);
      setUpdateError(error.message || "Une erreur inconnue est survenue");
      setUpdateDetails({
        error: error.message,
        stack: error.stack
      });
      toast.error(`Erreur de mise à jour: ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTransfer(null);
    setUpdateError(null);
    setUpdateDetails(null);
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

  // Function to force update a bank transfer directly
  const forceUpdateTransfer = async (transfer: BankTransfer, newStatus: string) => {
    try {
      setIsLoading(true);
      toast.info("Mise à jour forcée en cours...");
      
      // Create update payload
      const updatePayload = {
        transferId: transfer.id,
        status: newStatus,
        processed: newStatus === 'received' || newStatus === 'reçu',
        processedAt: new Date().toISOString(),
        notes: `Mise à jour forcée le ${new Date().toLocaleDateString('fr-FR')}`
      };
      
      // Try Edge Function first
      const { data, error } = await supabase.functions.invoke('update-bank-transfer', {
        body: updatePayload
      });
      
      if (!error && data?.success) {
        console.log("Edge function update successful:", data);
        toast.success("Virement mis à jour avec succès");
        
        // Wait for changes to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchBankTransfers();
        return true;
      }
      
      // Direct update fallback
      console.log("Edge function failed or reported issues, trying direct update");
      const { error: directError } = await supabase
        .from('bank_transfers')
        .update({
          status: newStatus,
          processed: newStatus === 'received' || newStatus === 'reçu',
          processed_at: new Date().toISOString(),
          notes: `Mise à jour forcée directe le ${new Date().toLocaleDateString('fr-FR')}`
        })
        .eq('id', transfer.id);
        
      if (directError) {
        console.error("Direct update failed:", directError);
        toast.error("Échec de la mise à jour - tentative finale en cours...");
        
        // Final attempt - use manual query
        try {
          // Get the full record first
          const { data: existingData } = await supabase
            .from('bank_transfers')
            .select('*')
            .eq('id', transfer.id)
            .single();
            
          if (existingData) {
            const { error: upsertError } = await supabase
              .from('bank_transfers')
              .upsert({
                ...existingData,
                status: newStatus,
                processed: newStatus === 'received' || newStatus === 'reçu',
                processed_at: new Date().toISOString(),
                notes: `Mise à jour forcée par upsert le ${new Date().toLocaleDateString('fr-FR')}`
              });
              
            if (upsertError) {
              console.error("Upsert update failed:", upsertError);
              toast.error("Toutes les tentatives de mise à jour ont échoué");
              return false;
            } else {
              console.log("Upsert update successful");
              toast.success("Virement mis à jour avec succès (méthode alternative)");
              
              // Wait for changes to propagate
              await new Promise(resolve => setTimeout(resolve, 2000));
              await fetchBankTransfers();
              return true;
            }
          }
        } catch (finalError) {
          console.error("Final update attempt failed:", finalError);
          toast.error("Échec complet de la mise à jour");
          return false;
        }
      } else {
        console.log("Direct update successful");
        toast.success("Virement mis à jour avec succès (méthode directe)");
        
        // Wait for changes to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchBankTransfers();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Force update failed:", error);
      toast.error("Échec de la mise à jour forcée");
      return false;
    } finally {
      // Wait to ensure database changes are processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchBankTransfers();
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
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={transfer.status || 'pending'} />
                            {transfer.processed && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Traité</span>}
                            {transfer.status === 'pending' && (
                              <button
                                onClick={() => forceUpdateTransfer(transfer, 'received')}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                Forcer à Reçu
                              </button>
                            )}
                          </div>
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

        <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-2">Informations de débogage</h3>
          <p className="text-sm text-gray-600">
            En cas de problème avec la mise à jour des virements, utilisez le bouton "Forcer à Reçu" pour tenter une mise à jour directe,
            ou ouvrez le modal d'édition pour effectuer une mise à jour manuelle. Si les problèmes persistent, consultez les logs du navigateur.
          </p>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={open => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-[500px]">
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
              
              {(editStatus === 'received' || editStatus === 'reçu') && (
                <Alert className="mt-2 bg-green-50 text-green-800 border-green-200">
                  <AlertTitle className="text-sm font-semibold">Important</AlertTitle>
                  <AlertDescription className="text-xs">
                    En définissant le statut comme "Reçu", le virement sera automatiquement marqué comme traité
                    et le solde du portefeuille de l'utilisateur sera mis à jour.
                  </AlertDescription>
                </Alert>
              )}
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
                <span className="font-medium">Important:</span> Une date de traitement est automatiquement définie si vous choisissez le statut "Reçu"
              </div>
            </div>
            
            {updateError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Erreur de mise à jour</AlertTitle>
                <AlertDescription className="text-sm">
                  {updateError}
                  
                  {updateDetails && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto max-h-32">
                      <pre>{JSON.stringify(updateDetails, null, 2)}</pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {!updateError && updateDetails && (
              <Alert 
                className={updateDetails.verified ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}
              >
                <AlertTitle className={updateDetails.verified ? "text-green-800" : "text-yellow-800"}>
                  {updateDetails.verified ? "Mise à jour réussie" : "Mise à jour avec avertissement"}
                </AlertTitle>
                <AlertDescription className={updateDetails.verified ? "text-green-700" : "text-yellow-700"}>
                  {updateDetails.message}
                  
                  <div className="mt-2 p-2 rounded text-xs overflow-auto max-h-32 bg-white/50">
                    <pre>{JSON.stringify(updateDetails, null, 2)}</pre>
                  </div>
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
