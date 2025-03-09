
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BankTransferItem } from "./types/bankTransfer";

interface BankTransferStatsProps {
  transfers: BankTransferItem[] | undefined;
  isLoading: boolean;
}

export default function BankTransferStats({ transfers, isLoading }: BankTransferStatsProps) {
  const transferCounts = {
    total: transfers?.length || 0,
    pending: transfers?.filter(t => t.status === "pending").length || 0,
    completed: transfers?.filter(t => t.status === "completed").length || 0,
    rejected: transfers?.filter(t => t.status === "rejected").length || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.total}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">En attente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.pending}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Confirmés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.completed}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Rejetés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {isLoading ? <Skeleton className="h-8 w-16" /> : transferCounts.rejected}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
