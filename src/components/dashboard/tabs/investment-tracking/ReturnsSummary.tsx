
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, CalendarDays, TrendingUp } from "lucide-react";

interface ReturnsSummaryProps {
  totalPaid: number;
  totalPending: number;
  totalScheduled: number;
  averageMonthlyReturn: number;
  futurePaymentsCount: number;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export default function ReturnsSummary({
  totalPaid,
  totalPending,
  totalScheduled,
  averageMonthlyReturn,
  futurePaymentsCount,
  filterStatus,
  setFilterStatus
}: ReturnsSummaryProps) {
  return (
    <div className="space-y-4">
      <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Tous
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            Payés
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            En attente
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Programmés
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Versements payés</div>
            <div className="flex items-center mt-1">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-green-600">{totalPaid} €</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">En attente</div>
            <div className="flex items-center mt-1">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold text-orange-600">{totalPending} €</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Programmés</div>
            <div className="flex items-center mt-1">
              <CalendarDays className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold text-blue-600">{totalScheduled} €</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {futurePaymentsCount} versements à venir
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Moyenne mensuelle</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-5 w-5 text-bgs-blue mr-2" />
              <span className="text-2xl font-bold text-bgs-blue">{averageMonthlyReturn} €</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
