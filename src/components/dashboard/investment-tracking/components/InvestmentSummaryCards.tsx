
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Investment } from "../types/investment";
import { Transaction } from "../types/investment";
import { supabase } from "@/integrations/supabase/client";
import { calculateMonthlyYield } from "../utils/investmentCalculations";

interface InvestmentSummaryCardsProps {
  investment: Investment;
  transactions: Transaction[];
}

export default function InvestmentSummaryCards({ investment, transactions }: InvestmentSummaryCardsProps) {
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  useEffect(() => {
    // Calculate total earnings from all yield transactions that are completed
    const earningsFromTransactions = transactions
      .filter(t => t.type === 'yield' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    console.log('Earnings from completed transactions:', earningsFromTransactions);
    console.log('All transactions:', transactions);
    
    // Directly set the total earnings from completed transactions
    setTotalEarnings(earningsFromTransactions);
    
  }, [investment, transactions]);
    
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
