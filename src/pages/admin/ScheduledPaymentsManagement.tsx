
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, RefreshCw } from "lucide-react";
import { useScheduledPayments } from "@/hooks/useScheduledPayments";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import AddPaymentModal from "@/components/scheduled-payments/AddPaymentModal";
import EditPaymentModal from "@/components/scheduled-payments/EditPaymentModal";

export default function ScheduledPaymentsManagement() {
  const { scheduledPayments, isLoading, updatePaymentStatus, addScheduledPayment, refetch } = useScheduledPayments();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // On component mount or when route is navigated to, refresh data once
  useEffect(() => {
    console.log("ScheduledPaymentsManagement mounted");
    const loadData = async () => {
      await refetch();
      setInitialLoadComplete(true);
    };
    loadData();
  }, [refetch]);

  const handleEditPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPayment(null);
    // Refresh data after modal closes without showing loading state
    refetch();
  };

  const handleAddPayment = async (payment: any) => {
    try {
      await addScheduledPayment(payment);
      // Refresh data without showing loading state
      refetch();
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Données actualisées");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erreur lors de l'actualisation des données");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state only on initial load
  const showLoading = isLoading && !initialLoadComplete;

  return (
    <>
      <Helmet>
        <title>Paiements Programmés | BGS Admin</title>
      </Helmet>

      <div className="space-y-6">
        <AdminHeader 
          title="Paiements Programmés" 
          description="Gérer et planifier les paiements pour les projets"
        />

        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || showLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </Button>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Ajouter un paiement
            </Button>
          </div>
        </div>
        
        <Card className="bg-white rounded-lg shadow">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Liste des paiements programmés</h2>
            </div>
          </CardHeader>
          <CardContent>
            {showLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            ) : scheduledPayments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun paiement programmé pour le moment</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleRefresh}
                >
                  Actualiser les données
                </Button>
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
        
        {/* Modals for adding and editing payments */}
        <AddPaymentModal 
          isOpen={isAddModalOpen} 
          onClose={() => {
            setIsAddModalOpen(false);
            refetch(); // Refresh data when closing modal
          }} 
          onAddPayment={handleAddPayment}
        />
        
        <EditPaymentModal 
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          payment={selectedPayment}
        />
      </div>
    </>
  );
}
