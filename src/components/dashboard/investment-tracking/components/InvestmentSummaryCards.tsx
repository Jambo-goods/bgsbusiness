import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const totalReceived = investmentData?.payments?.reduce((total, payment) => payment.status === 'completed' ? total + payment.amount : total, 0) || 0;
  const expectedYield = investmentData?.payments?.reduce((total, payment) => payment.status === 'completed' ? total + payment.amount : total, 0) || 0;
  const pendingPayments = investmentData?.payments?.reduce((total, payment) => payment.status === 'pending' ? total + payment.amount : total, 0) || 0;
  return;
};
export default InvestmentSummaryCards;