
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Investment } from "../types/investment";
import { Transaction } from "../types/investment";
import { supabase } from "@/integrations/supabase/client";
import { calculateMonthlyYield } from "@/components/dashboard/tabs/investment-tracking/utils";

interface InvestmentSummaryCardsProps {
  investment: Investment;
  transactions: Transaction[];
}

export default function InvestmentSummaryCards({ investment, transactions }: InvestmentSummaryCardsProps) {
  const [totalEarnings, setTotalEarnings] = useState(0);
  
  useEffect(() => {
    // Calculate total earnings from transactions
    const earningsFromTransactions = transactions
      .filter(t => 
        t.type === 'yield' && 
        t.status === 'completed' && 
        (t.investment_id === investment.id)
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    console.log('Earnings from transactions:', earningsFromTransactions);
    
    // Function to get scheduled payments for this investment's project
    const fetchScheduledPayments = async () => {
      try {
        if (!investment.project_id) return;
        
        const { data: payments, error } = await supabase
          .from('scheduled_payments')
          .select('*')
          .eq('project_id', investment.project_id)
          .eq('status', 'paid');
          
        if (error) throw error;
        
        console.log('Paid scheduled payments found:', payments?.length || 0);
        
        if (payments && payments.length > 0) {
          // Get only the scheduled payment that has been marked as paid
          // For this specific investment, there should only be one
          const paymentAmount = calculateMonthlyYield(investment.amount, payments[0].percentage || 12);
          console.log(`Payment amount calculated for investment ${investment.id}: ${paymentAmount}`);
          
          // Set the earnings to just this one payment's amount
          setTotalEarnings(paymentAmount);
        } else {
          // No scheduled payments found, just use transaction earnings
          setTotalEarnings(earningsFromTransactions);
          console.log('No scheduled payments found, using transaction earnings only:', earningsFromTransactions);
        }
      } catch (error) {
        console.error("Error fetching scheduled payments:", error);
        setTotalEarnings(earningsFromTransactions);
      }
    };
    
    fetchScheduledPayments();
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
            <p className="text-sm text-gray-600 mb-1">Total des bénéfices reçus</p>
            <p className="text-3xl font-bold text-green-600">{totalEarnings.toFixed(2)}€</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
