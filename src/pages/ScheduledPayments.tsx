
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useScheduledPayments } from "@/hooks/useScheduledPayments";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import EditPaymentModal from "@/components/scheduled-payments/EditPaymentModal";
import AddPaymentModal from "@/components/scheduled-payments/AddPaymentModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ScheduledPayments() {
  const { scheduledPayments, isLoading, addScheduledPayment } = useScheduledPayments();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPayment(null);
  };

  const handleAddPayment = async (payment: any) => {
    try {
      await addScheduledPayment(payment);
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  return (
    <div className="min-h-full">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Paiements Programmés</h1>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter un paiement
          </Button>
        </div>
        
        <Card className="bg-white rounded-lg shadow">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Liste des paiements programmés</h2>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-blue"></div>
              </div>
            ) : scheduledPayments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun paiement programmé pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500">Projet</TableHead>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500">Pourcentage</TableHead>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500">Montant</TableHead>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500">Date prévue</TableHead>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500">Statut</TableHead>
                      <TableHead className="px-4 py-3 text-left font-medium text-gray-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledPayments.map((payment) => (
                      <TableRow key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <TableCell className="px-4 py-4">{payment.projects?.name || "Projet inconnu"}</TableCell>
                        <TableCell className="px-4 py-4">{payment.percentage}%</TableCell>
                        <TableCell className="px-4 py-4">{payment.total_scheduled_amount || 0} €</TableCell>
                        <TableCell className="px-4 py-4">
                          {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status === 'pending' ? 'En attente' 
                              : payment.status === 'paid' ? 'Payé'
                              : payment.status === 'scheduled' ? 'Programmé'
                              : 'Inconnu'}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPayment(payment)}
                            className="flex items-center gap-1"
                          >
                            <Pencil size={14} />
                            Modifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modals for adding and editing payments */}
      <AddPaymentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddPayment={handleAddPayment}
      />
      
      <EditPaymentModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        payment={selectedPayment}
      />
    </div>
  );
}
