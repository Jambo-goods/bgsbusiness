
import React from 'react';
import { Button } from '@/components/ui/button';
import { DatabaseIcon, Info } from 'lucide-react';

interface TableCheckButtonsProps {
  isProcessing: boolean;
  onCheckTable: () => void;
  onCheckReferrals: () => void;
  commissionCount: number | null;
}

const TableCheckButtons: React.FC<TableCheckButtonsProps> = ({ 
  isProcessing, 
  onCheckTable, 
  onCheckReferrals,
  commissionCount 
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 my-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCheckTable}
          disabled={isProcessing}
        >
          <DatabaseIcon className="h-4 w-4 mr-2" />
          Vérifier la table
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCheckReferrals}
          disabled={isProcessing}
        >
          <Info className="h-4 w-4 mr-2" />
          Vérifier les parrainages
        </Button>
      </div>
      
      {commissionCount !== null && (
        <div className="border rounded-md p-3 bg-blue-50 my-2">
          <h5 className="text-sm font-medium flex items-center text-blue-800">
            <Info className="h-4 w-4 mr-1 text-blue-500" />
            État actuel de la table
          </h5>
          <p className="text-sm text-blue-700 mt-1">
            {commissionCount} commissions de parrainage enregistrées dans la base de données
          </p>
        </div>
      )}
    </>
  );
};

export default TableCheckButtons;
