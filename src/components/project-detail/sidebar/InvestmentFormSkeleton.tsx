
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function InvestmentFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="pt-4">
        <Skeleton className="h-10 w-full" />
      </div>
      
      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
