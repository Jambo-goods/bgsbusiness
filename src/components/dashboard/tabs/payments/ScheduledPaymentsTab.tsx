
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScheduledPayments } from "@/hooks/useScheduledPayments";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { AddScheduledPaymentForm } from "./AddScheduledPaymentForm";
import { Badge } from "@/components/ui/badge";

export default function ScheduledPaymentsTab() {
  const { scheduledPayments, isLoading, error, refetch } = useScheduledPayments();
  const [showAddForm, setShowAddForm] = React.useState(false);

  // Fonction pour formatter les montants en euros
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Fonction pour obtenir la couleur du badge de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return "bg-green-100 text-green-800 border-green-200";
      case 'scheduled':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'pending':
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Fonction pour traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return "Payé";
      case 'scheduled':
        return "Programmé";
      case 'pending':
      default:
        return "En attente";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Une erreur est survenue: {error}</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Paiements programmés</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
        >
          {showAddForm ? "Masquer le formulaire" : "Ajouter un paiement"}
        </Button>
      </div>

      {showAddForm && (
        <AddScheduledPaymentForm />
      )}

      {scheduledPayments.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Aucun paiement programmé trouvé.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scheduledPayments.map((payment) => (
            <Card key={payment.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {payment.projects?.name || "Projet inconnu"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {payment.projects?.company_name || ""}
                  </p>
                </div>
                <Badge className={getStatusColor(payment.status)}>
                  {translateStatus(payment.status)}
                </Badge>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date de paiement</p>
                  <p className="font-medium">
                    {payment.payment_date ? format(new Date(payment.payment_date), "PPP", { locale: fr }) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pourcentage</p>
                  <p className="font-medium">{payment.percentage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Investisseurs</p>
                  <p className="font-medium">{payment.investors_count || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Montant total</p>
                  <p className="font-medium">{formatCurrency(payment.total_scheduled_amount)}</p>
                </div>
              </div>
              
              {payment.processed_at && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Traité le {format(new Date(payment.processed_at), "PPP", { locale: fr })}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
