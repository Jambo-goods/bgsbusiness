import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowDown, ArrowUp, Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
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
import { bankTransferService } from "@/components/admin/dashboard/services/bankTransferService";

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
      
      let finalProcessedDate = processedDate;
      if ((editStatus === 'received' || editStatus === 'reçu') && !processedDate) {
        finalProcessedDate = new Date();
        console.log("Automatically setting processed date to now:", finalProcessedDate);
      }
      
      const result = await bankTransferService.updateBankTransfer(
        selectedTransfer.id,
        editStatus,
        finalProcessedDate ? finalProcessedDate.toISOString() : null
      );
      
      console.log("Update result:", result);
      
      if (result.success) {
        toast.success(result.message);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchBankTransfers();
        closeEditModal();
      } else {
        setUpdateError("La mise à jour a échoué. Consultez les détails ci-dessous.");
        setUpdateDetails(result);
        toast.error("Échec de la mise à jour du virement bancaire");
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

  const handleStatusChange = async (transferId: string, newStatus: 'received' | 'cancelled') => {
    try {
      setIsLoading(true);
      
      const result = await bankTransferService.updateBankTransfer(
        transferId,
        newStatus,
        newStatus === 'received' ? new Date().toISOString() : null
      );
      
      if (result.success) {
        toast.success(newStatus === 'received' 
          ? "Virement marqué comme reçu" 
          : "Virement annulé");
        await fetchBankTransfers();
      } else {
        toast.error(`Échec de la mise à jour: ${result.message}`);
      }
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du statut:`, error);
      toast.error(`Erreur: ${error.message}`);
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map(transfer => {
                    const user = userData[transfer.user_id] || { first_name: null, last_name: null, email: null };
                    const isPending = transfer.status === 'pending';
                    
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
                          <div className="flex items-center gap-2">
                            <StatusBadge status={transfer.status || 'pending'} />
                            {transfer.processed && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Traité</span>}
                            
                            {isPending && (
                              <div className="flex gap-1 ml-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleStatusChange(transfer.id, 'received')}
                                  disabled={isLoading}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Reçu
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleStatusChange(transfer.id, 'cancelled')}
                                  disabled={isLoading}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Annuler
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{transfer.processed_at ? formatDate(transfer.processed_at) : "-"}</TableCell>
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
                className={updateDetails.success ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}
              >
                <AlertTitle className={updateDetails.success ? "text-green-800" : "text-yellow-800"}>
                  {updateDetails.success ? "Mise à jour réussie" : "Mise à jour avec avertissement"}
                </AlertTitle>
                <AlertDescription className={updateDetails.success ? "text-green-700" : "text-yellow-700"}>
                  {updateDetails.message}
                  
                  {updateDetails.data && (
                    <div className="mt-2 p-2 rounded text-xs overflow-auto max-h-32 bg-white/50">
                      <pre>{JSON.stringify(updateDetails.data, null, 2)}</pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-6 space-y-2">
              <Button 
                type="button" 
                variant="secondary"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
                onClick={setTransferToReceived}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Forcer à Reçu
              </Button>
              <p className="text-xs text-center text-gray-500">
                Ce bouton marque directement le virement comme reçu et traité avec la date actuelle
              </p>
            </div>
            
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

