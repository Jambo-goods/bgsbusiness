
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Investment } from "../types/investment";
import { Transaction } from "../types/investment";

interface InvestmentSummaryCardsProps {
  investment: Investment;
  transactions: Transaction[];
}

export default function InvestmentSummaryCards({ investment, transactions }: InvestmentSummaryCardsProps) {
  // Filtrer seulement les transactions de type 'yield' avec statut 'completed'
  // et s'assurer qu'elles sont liées au projet actuel
  const totalEarnings = transactions
    .filter(t => 
      t.type === 'yield' && 
      t.status === 'completed' && 
      (t.project_id === investment.project_id || t.investment_id === investment.id)
    )
    .reduce((sum, t) => sum + t.amount, 0);
    
  console.log('Transactions disponibles:', transactions);
  console.log('Transactions filtrées (rendements):', 
    transactions.filter(t => t.type === 'yield' && t.status === 'completed')
  );
  console.log('Total des bénéfices calculés:', totalEarnings);
    
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Montant investi</p>
            <p className="text-3xl font-bold text-bgs-blue">{investment.amount}€</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Durée restante</p>
            <p className="text-3xl font-bold text-bgs-blue">{investment.remainingDuration} mois</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total des bénéfices reçus</p>
            <p className="text-3xl font-bold text-green-600">{totalEarnings}€</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
