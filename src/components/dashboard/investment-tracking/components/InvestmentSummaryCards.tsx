
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
          // We should only count each payment once for this investment
          let totalFromScheduledPayments = 0;
          
          // Track which payments we've already counted to avoid duplicates
          const processedPaymentIds = new Set();
          
          for (const payment of payments) {
            // Skip if we've already processed this payment
            if (processedPaymentIds.has(payment.id)) continue;
            
            // Mark this payment as processed
            processedPaymentIds.add(payment.id);
            
            // Get the monthly yield percentage from the payment or use default
            const monthlyYieldPercentage = payment.percentage || 12;
            
            // Calculate the exact amount for this payment
            const paymentAmount = (investment.amount * monthlyYieldPercentage) / 100;
            totalFromScheduledPayments += paymentAmount;
            
            console.log(`Payment ${payment.id}: ${paymentAmount} (${monthlyYieldPercentage}% of ${investment.amount})`);
          }
          
          // For debugging, log all the calculated values
          console.log('Total earnings from scheduled payments only:', totalFromScheduledPayments);
          
          // Set only the scheduled payments amount as the total earnings
          setTotalEarnings(totalFromScheduledPayments);
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
