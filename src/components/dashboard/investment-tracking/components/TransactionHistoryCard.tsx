
import React, { useState, useEffect } from 'react';
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
import { processPaymentToWallet } from '@/utils/investmentCalculations';
import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Copy, Send, RefreshCw, FileClock, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/dashboard/tabs/wallet/withdrawal-table/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyUtils';

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'paid';
  description: string;
  userId: string;
  investmentId: string;
}

interface TransactionHistoryCardProps {
  investmentId: string;
  userId: string;
}

const TransactionHistoryCard: React.FC<TransactionHistoryCardProps> = ({ investmentId, userId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast()
  const { user } = useUser();

  const fetchPayments = async () => {
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
      
      // Récupération des paiements depuis la table wallet_transactions
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
      
      // Filtrer les transactions liées à cet investissement
      const relevantTransactions = transactionsData?.filter(tx => 
        tx.investment_id === investmentId || 
        tx.description?.includes(investmentId)
      ) || [];
      
      console.log('Transactions pertinentes pour cet investissement:', relevantTransactions);

      // Si nous avons des transactions, les utiliser pour créer notre liste de paiements
      let formattedPayments: Payment[] = [];
      
      if (relevantTransactions.length > 0) {
        formattedPayments = relevantTransactions.map(tx => ({
          id: tx.id,
          amount: tx.amount || 0,
          date: tx.created_at,
          status: tx.status === 'completed' ? 'completed' : 
                 tx.status === 'paid' ? 'paid' : 
                 tx.status === 'failed' ? 'failed' : 'pending',
          description: tx.description || `Paiement pour ${projectName}`,
          userId: userId,
          investmentId: investmentId
        }));
      }
      
      // Récupérer aussi les paiements programmés
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
        
        // Ajouter les paiements programmés à notre liste
        const scheduledPayments = scheduledData.map(payment => ({
          id: payment.id,
          amount: (investmentAmount * (payment.percentage / 100)) || 0,
          date: payment.payment_date,
          status: payment.status === 'paid' ? 'paid' : 'pending',
          description: `Rendement mensuel (${payment.percentage}%) - ${payment.projects?.name || projectName}`,
          userId: userId,
          investmentId: investmentId
        }));
        
        // Ajouter ces paiements programmés à notre liste
        formattedPayments = [...formattedPayments, ...scheduledPayments];
      }
      
      // Si nous n'avons toujours pas de paiements, générer des paiements basés sur les dates d'investissement
      if (formattedPayments.length === 0 && investmentDate) {
        console.log('Génération de paiements prévisionnels basés sur la date d\'investissement');
        
        const firstPaymentDate = new Date(investmentDate);
        firstPaymentDate.setMonth(investmentDate.getMonth() + firstPaymentDelayMonths);
        
        console.log(`Date d'investissement: ${investmentDate.toISOString()}`);
        console.log(`Délai du premier paiement: ${firstPaymentDelayMonths} mois`);
        console.log(`Date du premier paiement: ${firstPaymentDate.toISOString()}`);
        
        // Calculer le rendement mensuel
        const monthlyYield = (investmentAmount * yieldRate) / 1200; // Convertir le taux annuel en mensuel
        console.log(`Rendement mensuel calculé: ${monthlyYield}`);
        
        // Générer 6 mois de paiements à partir de la date du premier paiement
        const now = new Date();
        const mockPayments: Payment[] = [];
        
        for (let i = 0; i < 6; i++) {
          const paymentDate = new Date(firstPaymentDate);
          paymentDate.setMonth(firstPaymentDate.getMonth() + i);
          
          // Déterminer le statut du paiement en fonction de la date actuelle
          let paymentStatus: 'paid' | 'pending' | 'completed' | 'failed';
          
          if (paymentDate < now) {
            // Pour les paiements passés, considérer comme payés
            paymentStatus = 'paid';
          } else if (i === 0) {
            // Le prochain paiement est en attente
            paymentStatus = 'pending';
          } else {
            // Les paiements futurs sont en attente
            paymentStatus = 'pending';
          }
          
          mockPayments.push({
            id: `mock-${i}`,
            amount: monthlyYield,
            date: paymentDate.toISOString(),
            status: paymentStatus,
            description: `Rendement mensuel (${(yieldRate/12).toFixed(2)}%) - ${projectName}`,
            userId,
            investmentId
          });
        }
        
        formattedPayments = mockPayments;
        console.log('Paiements prévisionnels générés:', mockPayments);
      }
      
      // Trier les paiements par date
      formattedPayments.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setPayments(formattedPayments);
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors de la récupération des paiements:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (investmentId) {
      fetchPayments();
    }
  }, [investmentId]);

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentDescription('');
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount))) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide.",
        variant: "destructive",
      })
      return;
    }

    const amount = parseFloat(paymentAmount);

    try {
      setIsLoading(true);
      const success = await processPaymentToWallet(userId, amount, paymentDescription);

      if (success) {
        toast({
          description: "Paiement programmé avec succès!",
        })
        handleClosePaymentModal();
        fetchPayments();
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la programmation du paiement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur de traitement du paiement:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la programmation du paiement.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul des statistiques de paiement
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
        
        <div className="flex items-center gap-2">
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
          
          {user?.isAdmin && (
            <Button size="sm" onClick={handleOpenPaymentModal}>
              Programmer un Paiement
            </Button>
          )}
        </div>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" /> Envoyer un message
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

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Programmer un Paiement
              </h3>
              <div className="mt-2">
                <Label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                  Montant:
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Entrez le montant"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mt-2">
                <Label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  Description:
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description du paiement"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="items-center px-4 py-3 mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={handleClosePaymentModal}>
                  Annuler
                </Button>
                <Button onClick={handlePaymentSubmit}>
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryCard;
