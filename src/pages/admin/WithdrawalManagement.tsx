
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText, 
  MoreHorizontal, 
  Filter, 
  RefreshCw 
} from "lucide-react";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_info: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  };
  requested_at: string;
  processed_at: string | null;
  userName?: string;
  userEmail?: string;
}

export default function WithdrawalManagement() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [activeTab]);

  const fetchWithdrawalRequests = async () => {
    try {
      setIsLoading(true);
      
      // Build query based on active tab
      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('requested_at', { ascending: false });
      
      // Apply status filter if not on "all" tab
      if (activeTab !== "all") {
        query = query.eq('status', activeTab);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform the data to include user details
      const formattedData = data.map(request => ({
        ...request,
        userName: `${request.profiles.first_name} ${request.profiles.last_name}`,
        userEmail: request.profiles.email
      }));
      
      setWithdrawalRequests(formattedData);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast.error("Erreur lors de la récupération des demandes de retrait");
    } finally {
      setIsLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: string, notes?: string) => {
    try {
      setIsProcessing(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer cette action");
        return;
      }
      
      const updateData: any = {
        status,
        processed_at: status === 'pending' ? null : new Date().toISOString(),
        admin_id: status === 'pending' ? null : session.session.user.id
      };
      
      if (notes) {
        updateData.notes = notes;
      }
      
      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Statut de la demande mis à jour: ${getStatusLabel(status)}`);
      
      // Refresh the list
      fetchWithdrawalRequests();
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><FileText className="w-3 h-3 mr-1" /> Approuvé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Complété</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'completed': return 'Complété';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Retraits</h1>
        <Button 
          onClick={fetchWithdrawalRequests} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="approved">Approuvés</TabsTrigger>
          <TabsTrigger value="completed">Complétés</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Demandes de retrait {activeTab !== "all" ? `- ${getStatusLabel(activeTab)}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : withdrawalRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Banque</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {format(new Date(request.requested_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{request.userName}</div>
                            <div className="text-xs text-gray-500">{request.userEmail}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{request.amount}€</span>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium text-sm">{request.bank_info.bankName}</div>
                              <div className="text-xs">{request.bank_info.accountName}</div>
                              <div className="text-xs font-mono truncate">{request.bank_info.accountNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isProcessing}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {request.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => updateWithdrawalStatus(request.id, 'approved')}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Approuver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateWithdrawalStatus(request.id, 'rejected')}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Rejeter
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {request.status === 'approved' && (
                                  <DropdownMenuItem
                                    onClick={() => updateWithdrawalStatus(request.id, 'completed')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Marquer comme complété
                                  </DropdownMenuItem>
                                )}
                                {(request.status === 'approved' || request.status === 'completed' || request.status === 'rejected') && (
                                  <DropdownMenuItem
                                    onClick={() => updateWithdrawalStatus(request.id, 'pending')}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Remettre en attente
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune demande de retrait {activeTab !== "all" ? `avec le statut "${getStatusLabel(activeTab)}"` : ""} pour le moment.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
