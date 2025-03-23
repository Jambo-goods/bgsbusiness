
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyUtils';

interface InvestmentSummaryCardsProps {
  investmentData: any;
}

const InvestmentSummaryCards: React.FC<InvestmentSummaryCardsProps> = ({
  investmentData
}) => {
  const totalInvested = investmentData?.amount || 0;
  const yieldRate = investmentData?.yield_rate || 0;
  const investmentDuration = investmentData?.duration || 0;
  
  // Calculate payments based on the payments array in investmentData
  const completedPayments = investmentData?.payments?.filter(payment => 
    payment.status === 'completed' || payment.status === 'paid'
  ) || [];
  
  const pendingPayments = investmentData?.payments?.filter(payment => 
    payment.status === 'pending'
  ) || [];
  
  const totalReceived = completedPayments.reduce((total, payment) => total + payment.amount, 0) || 0;
  const expectedMonthlyYield = totalInvested * (yieldRate / 100) / 12;
  const pendingAmount = pendingPayments.reduce((total, payment) => total + payment.amount, 0) || 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total investi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalInvested)}</div>
            <div className="bg-blue-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Rendements perçus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div>
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="text-xs text-green-600 mt-1">
            {completedPayments.length} paiements reçus
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Rendements en attente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
            <div className="bg-orange-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="text-xs text-orange-600 mt-1">
            {pendingPayments.length} paiements en attente
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Rendement mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(expectedMonthlyYield)}</div>
            <div className="bg-purple-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Taux: {yieldRate}% par an
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentSummaryCards;
