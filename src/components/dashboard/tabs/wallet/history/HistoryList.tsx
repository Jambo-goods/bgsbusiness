import React from "react";
import HistoryItem, { HistoryItemType } from "./HistoryItem";
import EmptyState from "./EmptyState";

interface HistoryListProps {
  items: HistoryItemType[];
}

export default function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  // Filter out duplicate bank transfer notifications
  // We'll keep track of transaction references to identify duplicates
  const seenRefs = new Set<string>();
  const filteredItems = items.filter(item => {
    // For regular transactions, always keep them
    if (item.itemType === 'transaction') {
      return true;
    }
    
    // For notifications about bank transfers, check for duplicates
    if (item.itemType === 'notification' && item.type === 'deposit') {
      // Extract reference from the description if it exists
      const refMatch = item.description.match(/DEP-\d+/);
      if (refMatch) {
        const ref = refMatch[0];
        // If we've seen this reference before, it's a duplicate
        if (seenRefs.has(ref)) {
          return false;
        }
        // Otherwise, add it to our set and keep this notification
        seenRefs.add(ref);
      }
    }
    
    // Keep all other notification types
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}
