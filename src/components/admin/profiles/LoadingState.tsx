
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex space-x-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
