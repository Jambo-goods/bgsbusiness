
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
import { MoreHorizontal, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import StatusBadge from '@/components/dashboard/tabs/wallet/withdrawal-table/StatusBadge';

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
  const { toast } = useToast()
  const { user } = useUser();

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching scheduled payments for project_id:', investmentId);
      
      // First fetch the investment details to get the investment date and first payment delay
      const { data: investmentData, error: investmentError } = await supabase
        .from("investments")
        .select(`
          date,
          projects (first_payment_delay_months)
        `)
        .eq("id", investmentId)
        .single();
        
      if (investmentError) {
        console.error("Error fetching investment details:", investmentError);
        throw new Error(investmentError.message);
      }
      
      console.log('Investment data:', investmentData);
      
      const investmentDate = investmentData?.date ? new Date(investmentData.date) : null;
      const firstPaymentDelayMonths = investmentData?.projects?.first_payment_delay_months || 1;
      
      // Now fetch scheduled payments
      const { data, error } = await supabase
        .from('scheduled_payments')
        .select(`
          *,
          projects(name)
        `)
        .eq('project_id', investmentId)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        throw new Error(error.message);
      }

      console.log('Fetched scheduled payments data:', data);

      // Map the data to match our Payment interface
      if (data && data.length > 0) {
        const formattedPayments: Payment[] = data.map(payment => ({
          id: payment.id,
          amount: payment.total_scheduled_amount || 0,
          date: payment.payment_date,
          // Map the database status to our Payment interface status
          status: payment.status === 'paid' ? 'paid' : 
                 payment.status === 'completed' ? 'completed' : 
                 payment.status === 'failed' ? 'failed' : 'pending',
          description: `Paiement programmé pour ${formatDate(payment.payment_date)} (${payment.percentage}%)`,
          userId: userId,
          investmentId: investmentId
        }));

        setPayments(formattedPayments);
        console.log('Formatted payments:', formattedPayments);
      } else {
        console.log('No scheduled payments found for this investment');
        
        // If no scheduled payments are found, we can generate expected payments
        // based on the investment date and first payment delay
        if (investmentDate) {
          const firstPaymentDate = new Date(investmentDate);
          firstPaymentDate.setMonth(investmentDate.getMonth() + firstPaymentDelayMonths);
          
          console.log(`Investment date: ${investmentDate.toISOString()}`);
          console.log(`First payment delay: ${firstPaymentDelayMonths} months`);
          console.log(`First payment date: ${firstPaymentDate.toISOString()}`);
          
          // Generate 6 months of payments starting from the first payment date
          const mockPayments: Payment[] = [];
          for (let i = 0; i < 6; i++) {
            const paymentDate = new Date(firstPaymentDate);
            paymentDate.setMonth(firstPaymentDate.getMonth() + i);
            
            mockPayments.push({
              id: `mock-${i}`,
              amount: 0, // We don't know the amount yet
              date: paymentDate.toISOString(),
              status: 'pending',
              description: `Paiement prévu pour ${formatDate(paymentDate)}`,
              userId,
              investmentId
            });
          }
          
          setPayments(mockPayments);
          console.log('Generated mock payments based on investment date:', mockPayments);
        } else {
          setPayments([]);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching payments:", err);
    } finally {
      setIsLoading(false);
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
      console.error("Payment processing error:", error);
      toast({
        title: "Erreur",
        description: "Erreur inattendue lors de la programmation du paiement.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Historique des Transactions</h3>
        {user?.isAdmin && (
          <Button size="sm" onClick={handleOpenPaymentModal}>
            Programmer un Paiement
          </Button>
        )}
      </div>

      {isLoading ? (
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
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>{payment.amount} €</TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
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
              <div className="items-center px-4 py-3">
                <Button variant="secondary" onClick={handlePaymentSubmit} className="mr-2">
                  Confirmer
                </Button>
                <Button variant="ghost" onClick={handleClosePaymentModal}>
                  Annuler
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
