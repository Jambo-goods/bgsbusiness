
import React, { useState } from "react";
import HistoryItem, { HistoryItemType } from "./HistoryItem";
import EmptyState from "./EmptyState";

interface HistoryListProps {
  items: HistoryItemType[];
}

export default function HistoryList({ items }: HistoryListProps) {
  // Create a state to track references we've already displayed
  const [seenReferences, setSeenReferences] = useState<Set<string>>(new Set());
  
  // Helper function to update our set of seen references
  const updateSeenReferences = (reference: string) => {
    setSeenReferences(prev => {
      const newSet = new Set(prev);
      newSet.add(reference);
      return newSet;
    });
  };

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <HistoryItem 
          key={item.id} 
          item={item} 
          seenReferences={seenReferences}
          updateSeenReferences={updateSeenReferences}
        />
      ))}
    </div>
  );
}
