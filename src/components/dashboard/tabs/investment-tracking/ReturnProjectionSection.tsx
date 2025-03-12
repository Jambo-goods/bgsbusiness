
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, CalendarDays } from "lucide-react";
import ExpectedReturnsTable from "./ExpectedReturnsTable";
import { PaymentRecord } from "./types";
import { Project } from "@/types/project";

interface ReturnProjectionSectionProps {
  paymentRecords: PaymentRecord[];
  cumulativeExpectedReturns: (PaymentRecord & { expectedCumulativeReturn: number })[];
  isLoading: boolean;
  userInvestments: Project[];
}

export default function ReturnProjectionSection({
  paymentRecords,
  cumulativeExpectedReturns,
  isLoading,
  userInvestments
}: ReturnProjectionSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-60 bg-gray-100 rounded w-full"></div>
      </div>
    );
  }

  // Calculate the total expected return
  const totalExpectedReturn = cumulativeExpectedReturns.length > 0 
    ? cumulativeExpectedReturns[cumulativeExpectedReturns.length - 1].expectedCumulativeReturn
    : 0;

  // Calculate total invested amount
  const totalInvestedAmount = userInvestments.reduce((sum, project) => sum + (project.investedAmount || 0), 0);
  
  // Calculate average monthly return
  const monthlyReturns = paymentRecords
    .filter(payment => !payment.isProjectedPayment)
    .map(payment => payment.amount);
  
  const averageMonthlyReturn = monthlyReturns.length > 0
    ? monthlyReturns.reduce((sum, amount) => sum + amount, 0) / monthlyReturns.length
    : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2.5 rounded-lg">
          <TrendingUp className="h-5 w-5 text-bgs-blue" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-bgs-blue">Projection de rendements</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Incluant la période de délai avant le premier versement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light p-5 rounded-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">Rendement total prévu</span>
            <div className="bg-white/10 p-1.5 rounded-full">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">
            {Math.round(totalExpectedReturn)} €
          </div>
          <div className="text-xs text-white/70">
            Sur la durée du placement
          </div>
        </div>

        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Mensuel moyen</span>
            <div className="bg-green-100 p-1.5 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {Math.round(averageMonthlyReturn)} €
          </div>
          <div className="text-xs text-green-600">
            Par mois en moyenne
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Performance prévisionnelle</span>
            <div className="bg-gray-200 p-1.5 rounded-full">
              <CalendarDays className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-700 mb-1">
            {totalInvestedAmount > 0 
              ? ((totalExpectedReturn / totalInvestedAmount) * 100).toFixed(2) 
              : "0.00"}%
          </div>
          <div className="text-xs text-gray-500">
            Sur la durée totale
          </div>
        </div>
      </div>

      <Tabs defaultValue="payments" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">Échéancier complet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-2">
          <ExpectedReturnsTable 
            paymentRecords={paymentRecords}
            cumulativeExpectedReturns={cumulativeExpectedReturns}
            userInvestments={userInvestments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
