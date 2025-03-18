
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useScheduledPayments } from "@/hooks/useScheduledPayments";

export default function ScheduledPayments() {
  const { scheduledPayments, isLoading } = useScheduledPayments();

  return (
    <div className="min-h-full">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Paiements Programmés</h1>
        
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Projet</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Montant</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date prévue</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4">{payment.projects?.name || "Projet inconnu"}</td>
                        <td className="px-4 py-4">Rendement</td>
                        <td className="px-4 py-4">{payment.total_scheduled_amount || 0} €</td>
                        <td className="px-4 py-4">
                          {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-4">
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
