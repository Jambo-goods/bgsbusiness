
import React from 'react';
import HistoryItem from './HistoryItem';
import { CombinedHistoryItem } from './useWalletHistory';

interface HistoryListProps {
  items: CombinedHistoryItem[];
}

const HistoryList = ({ items }: HistoryListProps) => {
  // Group items by date
  const groupedItems: Record<string, CombinedHistoryItem[]> = {};
  
  items.forEach(item => {
    const formattedDate = item.formattedDate;
    if (!groupedItems[formattedDate]) {
      groupedItems[formattedDate] = [];
    }
    groupedItems[formattedDate].push(item);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date} className="space-y-2">
          <h4 className="text-sm font-medium text-bgs-gray-medium mb-2">{date}</h4>
          <div className="space-y-2">
            {dateItems.map(item => (
              <HistoryItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
