
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from '@/utils/formatUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Copy, RefreshCw, FileCheck, FileClock, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyUtils';
import { ScheduledPayment } from '../types/investment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionHistoryCardProps {
  investmentId: string;
  userId: string;
  projectId: string;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({ investmentId, userId, projectId }) => {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [firstPaymentDelay, setFirstPaymentDelay] = useState<number>(1);

  const fetchScheduledPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsRefreshing(true);
    
    try {
      console.log('Récupération des détails du projet pour l\'investissement:', investmentId);
      
      // Récupérer les détails du projet pour obtenir le délai du premier paiement
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("first_payment_delay_months")
        .eq("id", projectId)
        .single();
        
      if (projectError) {
        console.error("Erreur lors de la récupération des détails du projet:", projectError);
        throw new Error(projectError.message);
      }
      
      // Stocker le délai du premier paiement
      const firstPaymentDelayMonths = projectData?.first_payment_delay_months || 1;
      setFirstPaymentDelay(firstPaymentDelayMonths);
      console.log("Délai du premier paiement:", firstPaymentDelayMonths, "mois");
      
      // Récupérer les paiements programmés pour ce projet
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("scheduled_payments")
        .select(`
          *,
          projects:project_id (
            name,
            image,
            company_name,
            status,
            first_payment_delay_months
          )
        `)
        .eq("project_id", projectId)
        .order("payment_date", { ascending: true });

      if (paymentsError) {
        console.error("Erreur lors de la récupération des paiements programmés:", paymentsError);
        throw new Error(paymentsError.message);
      }

      console.log('Données de paiements programmés récupérées:', paymentsData);
      
      // Convertir les status string en status typed
      const typedPayments = paymentsData?.map(payment => ({
        ...payment,
        status: (payment.status === 'paid' ? 'paid' : 
                payment.status === 'pending' ? 'pending' : 'scheduled') as 'scheduled' | 'pending' | 'paid'
      })) || [];
      
      setScheduledPayments(typedPayments);
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors de la récupération des paiements:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [investmentId, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchScheduledPayments();
    }
    
    // Set up real-time listener for scheduled payments table
    const scheduledPaymentsChannel = supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scheduled_payments' },
        () => {
          // Refresh without showing loading indicator
          fetchScheduledPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scheduledPaymentsChannel);
    };
  }, [projectId, fetchScheduledPayments]);

  // Calculate payment statistics
  const paidPayments = scheduledPayments.filter(p => p.status === 'paid');
  const pendingPayments = scheduledPayments.filter(p => p.status === 'pending' || p.status === 'scheduled');
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.total_scheduled_amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.total_scheduled_amount || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Paiements Programmés</h3>
          <p className="text-sm text-gray-500">Versements programmés pour ce projet d'investissement</p>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchScheduledPayments}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Versements payés</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              {paidPayments.length} versement{paidPayments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileClock className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Versements à venir</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
              {pendingPayments.length} versement{pendingPayments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Premier paiement</span>
          </div>
          <div className="flex justify-between items-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-blue-600">{firstPaymentDelay} mois</span>
                    <Info className="h-4 w-4 ml-1 text-blue-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Délai avant le premier versement après investissement</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
              Délai initial
            </Badge>
          </div>
        </div>
      </div>

      {isLoading && !isRefreshing ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 py-2 border-b">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 mb-2">Erreur: {error}</p>
          <Button variant="outline" onClick={fetchScheduledPayments}>Réessayer</Button>
        </div>
      ) : scheduledPayments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Aucun paiement programmé disponible pour cet investissement.</p>
          <Button variant="outline" onClick={fetchScheduledPayments}>Rafraîchir</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">Projet</TableHead>
                <TableHead className="text-gray-700">Pourcentage</TableHead>
                <TableHead className="text-gray-700">Montant</TableHead>
                <TableHead className="text-gray-700">Statut</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                      {formatDate(payment.payment_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.projects?.name || "Projet inconnu"}
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600 font-medium">{payment.percentage.toFixed(2)}%</span>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(payment.total_scheduled_amount || 0)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {payment.status === 'paid' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Payé
                        </Badge>
                      ) : payment.status === 'pending' ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          En attente
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          Programmé
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
                          <Copy className="mr-2 h-4 w-4" /> Copier l'ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryCard;
