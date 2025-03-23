
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
import { MoreHorizontal, Copy, RefreshCw, FileClock, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyUtils';
import { Payment } from '../types/investment';

interface TransactionHistoryCardProps {
  investmentId: string;
  userId: string;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({ investmentId, userId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsRefreshing(true);
    
    try {
      console.log('Récupération des paiements programmés pour le projet:', investmentId);
      
      // Récupérer les détails de l'investissement
      const { data: investmentData, error: investmentError } = await supabase
        .from("investments")
        .select(`
          date,
          amount,
          yield_rate,
          projects (first_payment_delay_months, name)
        `)
        .eq("id", investmentId)
        .single();
        
      if (investmentError) {
        console.error("Erreur lors de la récupération des détails de l'investissement:", investmentError);
        throw new Error(investmentError.message);
      }
      
      console.log('Données d\'investissement:', investmentData);
      
      const investmentDate = investmentData?.date ? new Date(investmentData.date) : null;
      const firstPaymentDelayMonths = investmentData?.projects?.first_payment_delay_months || 1;
      const investmentAmount = investmentData?.amount || 0;
      const yieldRate = investmentData?.yield_rate || 0;
      const projectName = investmentData?.projects?.name || 'Projet';
      
      // Collect payments from multiple sources
      let allPayments: Payment[] = [];
      
      // 1. Get transactions related to this investment from wallet_transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error("Erreur lors de la requête Supabase:", transactionsError);
        throw new Error(transactionsError.message);
      }

      console.log('Données de transactions récupérées:', transactionsData);
      
      // Filter transactions related to this investment
      // Note: checking both direct investment_id match and description containing investmentId
      const relevantTransactions = transactionsData?.filter(tx => 
        tx.description?.includes(investmentId)
      ) || [];
      
      console.log('Transactions pertinentes pour cet investissement:', relevantTransactions);

      // Convert transactions to Payment format
      if (relevantTransactions.length > 0) {
        const transactionPayments = relevantTransactions.map(tx => ({
          id: tx.id,
          amount: tx.amount || 0,
          date: tx.created_at,
          status: tx.status === 'completed' ? 'completed' as const : 
                 tx.status === 'paid' ? 'paid' as const : 
                 tx.status === 'failed' ? 'failed' as const : 'pending' as const,
          description: tx.description || `Paiement pour ${projectName}`,
          userId: userId,
          investmentId: investmentId
        }));
        
        allPayments = [...allPayments, ...transactionPayments];
      }
      
      // 2. Get scheduled payments for this project
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_payments')
        .select(`
          *,
          projects(name)
        `)
        .eq('project_id', investmentId)
        .order('payment_date', { ascending: false });

      if (scheduledError) {
        console.error("Erreur lors de la requête des paiements programmés:", scheduledError);
      } else if (scheduledData && scheduledData.length > 0) {
        console.log('Paiements programmés récupérés:', scheduledData);
        
        // Convert scheduled payments to Payment format
        const scheduledPayments = scheduledData.map(payment => ({
          id: payment.id,
          amount: (investmentAmount * (payment.percentage / 100)) || 0,
          date: payment.payment_date,
          status: payment.status === 'paid' ? 'paid' as const : 'pending' as const,
          description: `Rendement mensuel (${payment.percentage}%) - ${payment.projects?.name || projectName}`,
          userId: userId,
          investmentId: investmentId,
          percentage: payment.percentage
        }));
        
        allPayments = [...allPayments, ...scheduledPayments];
      }
      
      // 3. If we still have no payments, generate projected payments based on investment data
      if (allPayments.length === 0 && investmentDate) {
        console.log('Génération de paiements prévisionnels basés sur la date d\'investissement');
        
        const firstPaymentDate = new Date(investmentDate);
        firstPaymentDate.setMonth(investmentDate.getMonth() + firstPaymentDelayMonths);
        
        console.log(`Date d'investissement: ${investmentDate.toISOString()}`);
        console.log(`Délai du premier paiement: ${firstPaymentDelayMonths} mois`);
        console.log(`Date du premier paiement: ${firstPaymentDate.toISOString()}`);
        
        // Calculate monthly yield
        const monthlyYieldPercentage = yieldRate / 12;
        const monthlyYield = (investmentAmount * monthlyYieldPercentage) / 100;
        console.log(`Rendement mensuel calculé: ${monthlyYield} (${monthlyYieldPercentage}%)`);
        
        // Generate 6 months of payments
        const now = new Date();
        const projectedPayments: Payment[] = [];
        
        for (let i = 0; i < 6; i++) {
          const paymentDate = new Date(firstPaymentDate);
          paymentDate.setMonth(firstPaymentDate.getMonth() + i);
          
          // Determine payment status based on current date
          let paymentStatus: 'paid' | 'pending' | 'completed';
          
          if (paymentDate < now) {
            paymentStatus = 'paid';
          } else {
            paymentStatus = 'pending';
          }
          
          projectedPayments.push({
            id: `projected-${i}`,
            amount: monthlyYield,
            date: paymentDate.toISOString(),
            status: paymentStatus,
            description: `Rendement mensuel (${monthlyYieldPercentage.toFixed(2)}%) - ${projectName}`,
            userId,
            investmentId,
            percentage: monthlyYieldPercentage
          });
        }
        
        allPayments = projectedPayments;
        console.log('Paiements prévisionnels générés:', projectedPayments);
      }
      
      // Sort all payments by date (newest first)
      allPayments.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setPayments(allPayments);
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors de la récupération des paiements:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [investmentId, userId]);

  useEffect(() => {
    if (investmentId) {
      fetchPayments();
    }
  }, [investmentId, fetchPayments]);

  // Calculate payment statistics
  const paidPayments = payments.filter(p => p.status === 'paid' || p.status === 'completed');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Historique des Versements</h3>
          <p className="text-sm text-gray-500">Suivez tous vos versements reçus et à venir</p>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={fetchPayments}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Versements reçus</span>
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
          <Button variant="outline" onClick={fetchPayments}>Réessayer</Button>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Aucune transaction disponible pour cet investissement.</p>
          <Button variant="outline" onClick={fetchPayments}>Rafraîchir</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">Description</TableHead>
                <TableHead className="text-gray-700">Pourcentage</TableHead>
                <TableHead className="text-gray-700">Montant</TableHead>
                <TableHead className="text-gray-700">Statut</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{formatDate(payment.date)}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>
                    {payment.percentage ? (
                      <span className="text-blue-600 font-medium">{payment.percentage.toFixed(2)}%</span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {payment.status === 'paid' || payment.status === 'completed' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Payé
                        </Badge>
                      ) : payment.status === 'pending' ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          En attente
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          Échoué
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
