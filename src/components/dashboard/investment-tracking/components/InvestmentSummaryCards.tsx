
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Investment } from "../types/investment";
import { Transaction } from "../types/investment";
import { supabase } from "@/integrations/supabase/client";
import { calculateTotalEarnings } from "../utils/investmentCalculations";

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
    
    // Calculate cumulative total from transactions - THIS MATCHES THE TRANSACTION HISTORY TABLE
    let cumulativeTotal = 0;
    
    // Sort transactions by date
    const sortedTransactions = [...investmentTransactions]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Sum up all completed yield transactions
    if (sortedTransactions.length > 0) {
      sortedTransactions.forEach(t => {
        cumulativeTotal += t.amount;
      });
    }
    
    console.log('Sorted completed yield transactions for this investment:', sortedTransactions);
    console.log('Calculated cumulative total for this investment:', cumulativeTotal);
    
    // Set the total earnings to match the cumulative amount from the transaction history
    setTotalEarnings(cumulativeTotal);
    
  }, [transactions, investment.id]);
    
  console.log('Transactions available:', transactions);
  console.log('Transactions filtered (rendements):', 
    transactions.filter(t => t.type === 'yield' && t.status === 'completed')
  );
  console.log('Current total des bénéfices calculés:', totalEarnings);
    
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
