
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info } from 'lucide-react';

interface DebugInfoProps {
  debugInfo: string[];
}

const DebugInfo: React.FC<DebugInfoProps> = ({ debugInfo }) => {
  if (debugInfo.length === 0) {
    return null;
  }
  
  return (
    <div className="border rounded-md p-3 bg-gray-50 my-2">
      <h5 className="text-sm font-medium mb-2 flex items-center">
        <Info className="h-4 w-4 mr-1 text-blue-500" />
        Informations de débogage
      </h5>
      <ScrollArea className="h-48 w-full">
        <ul className="text-xs font-mono space-y-1">
          {debugInfo.map((info, index) => (
            <li key={index} className="text-gray-600">{info}</li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
};

export default DebugInfo;
