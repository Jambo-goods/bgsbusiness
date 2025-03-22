
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="text-center py-8 px-4 bg-red-50 rounded-lg border border-red-100">
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-red-100 rounded-full">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-medium text-red-800 mb-1">Erreur de chargement</h3>
          <p className="text-sm text-red-600 mb-3">{message}</p>
          <Button 
            variant="secondary" 
            onClick={onRetry}
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
