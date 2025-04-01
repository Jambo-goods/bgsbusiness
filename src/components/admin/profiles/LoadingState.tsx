
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState: React.FC = () => {
  console.log("Rendering LoadingState component");
  
  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 text-sm">Chargement des profils utilisateurs...</p>
      </div>
      
      {/* Loading skeletons for table rows */}
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex gap-4 w-full items-center p-2">
            <Skeleton className="h-8 w-8/12" />
            <Skeleton className="h-8 w-4/12" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
