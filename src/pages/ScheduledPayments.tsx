
import React, { useState } from 'react';
import { useScheduledPayments } from '@/hooks/useScheduledPayments';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Toaster } from 'sonner';
import { Check, Clock, AlertCircle } from 'lucide-react';

const ScheduledPaymentsPage = () => {
  const { scheduledPayments, isLoading, error } = useScheduledPayments();
  
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4 mr-2 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />;
    }
  };

  // Format status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'scheduled':
        return 'Programmé';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Paiements Programmés</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Projet</TableHead>
                <TableHead>Date de paiement</TableHead>
                <TableHead>Montant total</TableHead>
                <TableHead>Pourcentage</TableHead>
                <TableHead>Nombre d'investisseurs</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    Aucun paiement programmé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                scheduledPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {payment.projects?.image && (
                          <img 
                            src={payment.projects.image} 
                            alt={payment.projects?.name || 'Projet'} 
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                          />
                        )}
                        <span>{payment.projects?.name || 'Projet inconnu'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.payment_date 
                        ? format(new Date(payment.payment_date), 'dd/MM/yyyy') 
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(payment.total_scheduled_amount)}
                    </TableCell>
                    <TableCell>
                      {payment.percentage !== null ? `${payment.percentage}%` : '—'}
                    </TableCell>
                    <TableCell>
                      {payment.investors_count || 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPaymentsPage;
