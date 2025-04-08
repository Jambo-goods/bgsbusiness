
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowDown, ArrowUp, Loader2, Edit } from "lucide-react";
import { formatDate, maskAccountNumber } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import StatusBadge from "@/components/dashboard/tabs/wallet/withdrawal-table/StatusBadge";
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
import { notificationService } from "@/services/notifications";

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
  
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("");
  const [processedDate, setProcessedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWithdrawalRequests();

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
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;

      const withdrawalData = data || [];
      setWithdrawalRequests(withdrawalData as WithdrawalRequest[]);

      const userIds = Array.from(new Set(withdrawalData.map(w => w.user_id)));
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
      console.error("Error fetching withdrawal requests:", error);
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

  const handleEditWithdrawal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setEditStatus(withdrawal.status || "");
    setProcessedDate(withdrawal.processed_at ? new Date(withdrawal.processed_at) : undefined);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWithdrawal) return;
    
    setIsSubmitting(true);
    
    try {
      // Store previous status
      const previousStatus = selectedWithdrawal.status;
      
      // Update the withdrawal request
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: editStatus,
          processed_at: processedDate ? processedDate.toISOString() : null
        })
        .eq('id', selectedWithdrawal.id);
      
      if (error) throw error;
      
      // Handle notifications and balance updates based on status change
      if (editStatus === 'paid' && previousStatus !== 'paid') {
        // Create a notification
        await notificationService.withdrawalPaid(selectedWithdrawal.amount);
        
        // Create a transaction entry
        await supabase.from('wallet_transactions').insert({
          user_id: selectedWithdrawal.user_id,
          amount: selectedWithdrawal.amount,
          type: 'withdrawal',
          description: `Retrait de ${selectedWithdrawal.amount}€ payé`,
          status: 'completed',
          receipt_confirmed: true
        });
        
        // Show success toast to admin
        toast.success(`Le retrait de ${selectedWithdrawal.amount}€ a été marqué comme payé`, {
          description: "Une notification a été envoyée à l'utilisateur"
        });
      } else if (editStatus === 'rejected' && previousStatus !== 'rejected') {
        // Refund the user's wallet if we're rejecting a withdrawal
        // Do this regardless of previous status - always refund on rejection
        // Get current balance
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', selectedWithdrawal.user_id)
          .single();
        
        if (!profileError && profileData) {
          // Update balance - refund the amount
          await supabase
            .from('profiles')
            .update({ 
              wallet_balance: (profileData.wallet_balance || 0) + selectedWithdrawal.amount 
            })
            .eq('id', selectedWithdrawal.user_id);
            
          console.log(`Refunded ${selectedWithdrawal.amount}€ to user ${selectedWithdrawal.user_id} due to rejected withdrawal`);
        }
        
        // Create a notification
        await notificationService.withdrawalRejected(selectedWithdrawal.amount, "Demande de retrait rejetée");
        
        // Create a transaction record for the refund
        await supabase.from('wallet_transactions').insert([
          {
            user_id: selectedWithdrawal.user_id,
            amount: selectedWithdrawal.amount,
            type: 'withdrawal',
            description: `Retrait de ${selectedWithdrawal.amount}€ rejeté`,
            status: 'rejected'
          },
          {
            user_id: selectedWithdrawal.user_id,
            amount: selectedWithdrawal.amount,
            type: 'deposit',
            description: `Remboursement du retrait rejeté de ${selectedWithdrawal.amount}€`,
            status: 'completed',
            receipt_confirmed: true
          }
        ]);
        
        // Show success toast to admin
        toast.success(`Le retrait de ${selectedWithdrawal.amount}€ a été rejeté et remboursé à l'utilisateur`, {
          description: "Une notification a été envoyée à l'utilisateur"
        });
      }
      
      fetchWithdrawalRequests();
      closeEditModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la demande de retrait:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedWithdrawal(null);
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

  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "paid", label: "Payé" },
    { value: "rejected", label: "Rejeté" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Demandes de Retrait</h1>
        
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
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditWithdrawal(request)} 
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
            <DialogTitle>Modifier la demande de retrait</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant</Label>
              <Input 
                id="amount"
                value={`${selectedWithdrawal?.amount || 0} €`}
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
