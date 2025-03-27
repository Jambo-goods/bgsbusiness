import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import EditPaymentModal from '@/components/EditPaymentModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export default function ScheduledPaymentsSection({ 
  payments, 
  isLoading, 
  projectId,
  onPaymentUpdated
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate total pages
  const totalPages = Math.ceil((payments?.length || 0) / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = payments?.slice(indexOfFirstItem, indexOfLastItem) || [];
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of list for better UX
    window.scrollTo(0, 0);
  };
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  const handleOpenDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };
  
  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };
  
  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };
  
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };
  
  const handleMarkAsPaid = async () => {
    setIsProcessing(true);
    try {
      if (!selectedPayment) {
        toast.error('Aucun paiement sélectionné.');
        return;
      }
      
      const { data, error } = await supabase.from('scheduled_payments')
        .update({ status: 'paid', processed_at: new Date().toISOString() })
        .eq('id', selectedPayment.id);
        
      if (error) {
        console.error('Error updating payment status:', error);
        toast.error('Erreur lors de la mise à jour du statut du paiement.');
      } else {
        toast.success('Paiement marqué comme payé avec succès!');
        setIsDetailsOpen(false);
        setIsConfirmModalOpen(false);
        if (onPaymentUpdated) onPaymentUpdated();
      }
    } catch (error) {
      console.error('Unexpected error marking payment as paid:', error);
      toast.error('Erreur inattendue lors du marquage du paiement comme payé.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatPaymentDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Check if there are payments to display
  const hasPayments = payments && payments.length > 0;
  
  // Placeholder when loading
  if (isLoading) {
    return (
      <div className="mt-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  // No payments message
  if (!hasPayments) {
    return (
      <div className="mt-6 p-4 border border-dashed rounded-md text-center">
        <p className="text-gray-500">Aucun paiement programmé pour ce projet</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <div className="space-y-3">
        {currentPayments.map((payment) => (
          <div
            key={payment.id}
            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => handleOpenDetails(payment)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{formatPaymentDate(payment.scheduled_date)}</div>
                <div className="text-sm text-gray-500">
                  {payment.description || `Rendement de ${payment.percentage}%`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                  {getStatusLabel(payment.status)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            {/* Previous button */}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  href="#" 
                />
              </PaginationItem>
            )}
            
            {/* Page numbers */}
            {pageNumbers.map(number => {
              // Show only current page, first, last, and pages close to current
              if (
                number === 1 || 
                number === totalPages || 
                (number >= currentPage - 1 && number <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={number}>
                    <PaginationLink 
                      isActive={number === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(number);
                      }}
                      href="#"
                    >
                      {number}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis for page breaks
              if (
                (number === 2 && currentPage > 3) || 
                (number === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={number}>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            {/* Next button */}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  href="#" 
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Payment details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
            <DialogDescription>
              Informations sur le paiement programmé
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Date</div>
                <div>{formatPaymentDate(selectedPayment.scheduled_date)}</div>
                
                <div className="text-gray-500">Montant</div>
                <div>
                  {selectedPayment.amount 
                    ? formatCurrency(selectedPayment.amount)
                    : `${selectedPayment.percentage}% du capital investi`}
                </div>
                
                <div className="text-gray-500">Statut</div>
                <div className={`px-2 py-1 text-xs rounded-full inline-block ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusLabel(selectedPayment.status)}
                </div>
                
                {selectedPayment.processed_at && (
                  <>
                    <div className="text-gray-500">Traité le</div>
                    <div>{formatPaymentDate(selectedPayment.processed_at)}</div>
                  </>
                )}
              </div>
              
              {/* Admin actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(selectedPayment)}
                >
                  Modifier
                </Button>
                
                {selectedPayment.status === 'scheduled' && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleOpenConfirmModal()}
                  >
                    Marquer comme payé
                  </Button>
                )}
              </div>
              
              {/* Warning message */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-amber-800">
                    Les modifications apportées aux paiements programmés peuvent affecter les prévisions de rendement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit payment modal */}
      {selectedPayment && (
        <EditPaymentModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          payment={selectedPayment}
          projectId={projectId}
          onSuccess={() => {
            setIsDetailsOpen(false);
            if (onPaymentUpdated) onPaymentUpdated();
          }}
        />
      )}
      
      {/* Confirm payment dialog */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer le paiement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir marquer ce paiement comme payé ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-md text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800">
                  Cette action ne peut pas être annulée. Le paiement sera marqué comme payé et des notifications seront envoyées aux investisseurs concernés.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleMarkAsPaid}
                disabled={isProcessing}
              >
                {isProcessing ? 'Traitement...' : 'Confirmer le paiement'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to get status color
function getStatusColor(status) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get status label
function getStatusLabel(status) {
  switch (status) {
    case 'paid':
      return 'Payé';
    case 'scheduled':
      return 'Programmé';
    case 'pending':
      return 'En attente';
    case 'cancelled':
      return 'Annulé';
    default:
      return 'Inconnu';
  }
}
