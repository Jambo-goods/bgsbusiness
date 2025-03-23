
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Investment } from "../types/investment";
import { Transaction } from "../types/investment";
import { toast } from "@/components/ui/use-toast";

interface InvestmentSummaryCardsProps {
  investment: Investment;
  transactions: Transaction[];
}

export default function InvestmentSummaryCards({ investment, transactions }: InvestmentSummaryCardsProps) {
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  useEffect(() => {
    // Filter transactions to only include those related to this specific investment
    const investmentTransactions = transactions.filter(t => 
      t.investment_id === investment.id && t.type === 'yield' && t.status === 'completed'
    );
    
    console.log('Investment ID:', investment.id);
    console.log('Filtered transactions for this investment:', investmentTransactions);
    
    // Calculate total from transactions
    let total = 0;
    
    // Sum up all completed yield transactions
    investmentTransactions.forEach(transaction => {
      total += transaction.amount;
    });
    
    console.log('Total earnings calculated:', total);
    
    // Set the total earnings
    setTotalEarnings(total);
    
  }, [transactions, investment.id]);
    
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
            <p className="text-sm text-gray-600 mb-1">Total des versements reçus</p>
            <p className="text-3xl font-bold text-green-600">{totalEarnings.toFixed(2)}€</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
