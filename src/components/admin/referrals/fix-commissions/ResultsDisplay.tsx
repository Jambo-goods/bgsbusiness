
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';

interface ResultsDisplayProps {
  results: {
    processedCount: number;
    skippedCount: number;
    failedCount: number;
    details: Array<{
      transactionId: string;
      status: 'success' | 'skipped' | 'failed';
      reason?: string;
      commission?: number;
    }>;
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const [expandedList, setExpandedList] = useState(false);
  
  const toggleExpandList = () => {
    setExpandedList(!expandedList);
  };
  
  return (
    <div className="mt-4 border rounded-md p-4">
      <h4 className="font-medium mb-2">Résultats du traitement</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-3 bg-green-50 rounded-md">
          <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
          <span className="text-lg font-bold text-green-600">{results.processedCount || 0}</span>
          <span className="text-xs text-green-700">Commissions créées</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-md">
          <Clock className="h-5 w-5 text-blue-500 mb-1" />
          <span className="text-lg font-bold text-blue-600">{results.skippedCount || 0}</span>
          <span className="text-xs text-blue-700">Transactions ignorées</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-red-50 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
          <span className="text-lg font-bold text-red-600">{results.failedCount || 0}</span>
          <span className="text-xs text-red-700">Échecs</span>
        </div>
      </div>
      
      {results.details && results.details.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-sm font-medium">
              Détails {!expandedList && results.details.length > 10 ? "(10 premiers résultats)" : ""}
            </h5>
            {results.details.length > 10 && (
              <Button variant="outline" size="sm" onClick={toggleExpandList}>
                <Filter className="h-4 w-4 mr-1" />
                {expandedList ? "Réduire" : "Voir tout"}
              </Button>
            )}
          </div>
          <ScrollArea className="h-60 border rounded-md">
            <div className="w-full">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Transaction</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(expandedList ? results.details : results.details.slice(0, 10)).map((detail, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">
                        {detail.transactionId ? 
                          detail.transactionId.length > 8 ? 
                            `${detail.transactionId.substring(0, 8)}...` : 
                            detail.transactionId : 'N/A'}
                      </td>
                      <td className="px-3 py-2">
                        <Badge 
                          variant={
                            detail.status === 'success' ? 'default' : 
                            detail.status === 'skipped' ? 'secondary' : 'destructive'
                          }
                        >
                          {detail.status === 'success' ? 'Succès' : 
                           detail.status === 'skipped' ? 'Ignoré' : 'Échec'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {detail.status === 'success' 
                          ? `Commission: ${detail.commission}€` 
                          : detail.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
