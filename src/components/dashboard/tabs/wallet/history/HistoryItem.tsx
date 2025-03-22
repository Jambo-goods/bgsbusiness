
import React from 'react';
import { Check, AlertCircle, ArrowUp, ArrowDown, CircleDollarSign } from 'lucide-react';
import { CombinedHistoryItem } from './useWalletHistory';

interface HistoryItemProps {
  item: CombinedHistoryItem;
}

const HistoryItem = ({ item }: HistoryItemProps) => {
  // Define icon based on item type
  let Icon = AlertCircle;
  let iconColor = 'text-gray-400';
  let bgColor = 'bg-gray-100';
  
  if (item.source === 'notification') {
    if (item.category === 'success') {
      Icon = Check;
      iconColor = 'text-green-500';
      bgColor = 'bg-green-100';
    } else if (item.category === 'warning') {
      Icon = AlertCircle;
      iconColor = 'text-amber-500';
      bgColor = 'bg-amber-100';
    } else if (item.category === 'error') {
      Icon = AlertCircle;
      iconColor = 'text-red-500';
      bgColor = 'bg-red-100';
    }
  } else if (item.source === 'transaction') {
    if (item.type === 'deposit') {
      Icon = ArrowDown;
      iconColor = 'text-green-500';
      bgColor = 'bg-green-100';
    } else if (item.type === 'withdrawal') {
      Icon = ArrowUp;
      iconColor = 'text-red-500';
      bgColor = 'bg-red-100';
    } else if (item.type === 'investment') {
      Icon = CircleDollarSign;
      iconColor = 'text-blue-500';
      bgColor = 'bg-blue-100';
    }
  }
  
  return (
    <div className="p-3 bg-white rounded-lg border border-gray-100 flex items-start gap-3 hover:shadow-sm transition-shadow">
      <div className={`p-2 rounded-md ${bgColor} ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div className="flex-grow">
        {item.source === 'notification' && item.title && (
          <h5 className="text-sm font-medium text-bgs-blue">
            {item.title}
          </h5>
        )}
        <p className="text-xs text-bgs-gray-medium">
          {item.description}
        </p>
      </div>
      {item.source === 'transaction' && item.amount !== undefined && (
        <div className={`text-sm font-medium ${
          item.type === 'deposit' ? 'text-green-600' : 
          item.type === 'withdrawal' ? 'text-red-600' : 
          'text-blue-600'
        }`}>
          {item.type === 'deposit' ? '+' : item.type === 'withdrawal' ? '-' : ''}{item.amount} €
        </div>
      )}
    </div>
  );
};

export default HistoryItem;
