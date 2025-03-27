
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduledPayment } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useScheduledPayments } from '@/hooks/useScheduledPayments';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ScheduledPaymentsSection = () => {
  const [showPastPayments, setShowPastPayments] = useState(false);
  const { scheduledPayments, isLoading, refetch } = useScheduledPayments();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Filter payments based on user preference (show past payments or only future)
  const filteredPayments = showPastPayments 
    ? scheduledPayments 
    : scheduledPayments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate >= new Date();
      });

  // Sort payments by date (earliest first)
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
  });

  // Get status badge color and text
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Payé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">En attente</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Programmé</Badge>;
    }
  };

  // Format date in French format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-bgs-blue">Calendrier des paiements programmés</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPastPayments(!showPastPayments)}
            className="text-xs"
          >
            <Filter className="h-3.5 w-3.5 mr-1" />
            {showPastPayments ? "Masquer les paiements passés" : "Afficher tous les paiements"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : sortedPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium">Aucun paiement programmé trouvé</p>
            <p className="text-xs mt-1">Les paiements apparaîtront ici une fois programmés par l'équipe</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-md">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Pourcentage</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => (
                  <TableRow key={payment.id} className="bg-white">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {payment.projects?.image && (
                          <img 
                            src={payment.projects.image} 
                            alt={payment.projects?.name} 
                            className="w-8 h-8 rounded-md object-cover mr-3" 
                          />
                        )}
                        {payment.projects?.name || "Projet inconnu"}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>{payment.percentage.toFixed(2)}%</TableCell>
                    <TableCell className="font-medium">
                      {payment.total_scheduled_amount
                        ? `${payment.total_scheduled_amount.toFixed(2)} €`
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduledPaymentsSection;
