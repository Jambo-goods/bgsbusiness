
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TableSkeleton = () => {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
};
