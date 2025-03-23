import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyUtils';

interface InvestmentSummaryCardsProps {
  investmentData: any;
}

const InvestmentSummaryCards: React.FC<InvestmentSummaryCardsProps> = ({ investmentData }) => {
  const totalInvested = investmentData?.amount || 0;
  const yieldRate = investmentData?.yield_rate || 0;
  const investmentDuration = investmentData?.duration || 0;
  const totalReceived = investmentData?.payments?.reduce((total, payment) => 
    payment.status === 'completed' ? total + payment.amount : total, 0) || 0;
  const expectedYield = investmentData?.payments?.reduce((total, payment) => 
    payment.status === 'completed' ? total + payment.amount : total, 0) || 0;
  const pendingPayments = investmentData?.payments?.reduce((total, payment) => 
    payment.status === 'pending' ? total + payment.amount : total, 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Invested Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            Total Investi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
          <p className="text-sm text-gray-500">Montant total investi dans ce projet</p>
        </CardContent>
      </Card>

      {/* Expected Yield Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Rendement Attendu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(expectedYield)}</div>
          <p className="text-sm text-gray-500">Rendement total attendu de cet investissement</p>
        </CardContent>
      </Card>

      {/* Pending Payments Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Paiements en Attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingPayments)}</div>
          <p className="text-sm text-gray-500">Montant total des paiements en attente</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentSummaryCards;
