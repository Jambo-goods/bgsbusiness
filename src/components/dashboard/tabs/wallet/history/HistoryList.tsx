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

  // Create a mapping of references for identifying related transactions and notifications
  const refMapping: Record<string, HistoryItemType[]> = {};
  const withdrawalMapping: Record<string, HistoryItemType[]> = {};
  
  // First pass: group items by reference (deposits) and by withdrawal ID/amount (withdrawals)
  items.forEach(item => {
    // Deposit handling
    let ref = null;
    
    if (item.itemType === 'transaction' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    } else if (item.itemType === 'notification' && item.type === 'deposit' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    }
    
    // If we found a reference, add it to the mapping
    if (ref) {
      if (!refMapping[ref]) {
        refMapping[ref] = [];
      }
      refMapping[ref].push(item);
    }
    
    // Withdrawal handling - improved to better catch duplicates
    if (item.type === 'withdrawal') {
      let amount = 0;
      let withdrawalId = '';
      
      // Extract the amount and ID based on item type
      if (item.itemType === 'transaction') {
        amount = item.amount;
        // Try to extract withdrawalId if it exists in the description
        const idMatch = item.description?.match(/#([a-f0-9-]+)/i);
        withdrawalId = idMatch ? idMatch[1] : '';
      } else if (item.itemType === 'notification') {
        amount = item.metadata?.amount || 0;
        withdrawalId = item.metadata?.withdrawalId || '';
      }
      
      // Create a unique key - prefer ID if available, otherwise use amount+timestamp
      const key = withdrawalId || `withdrawal-${amount}-${new Date(item.created_at).toISOString().split('T')[0]}`;
      
      if (!withdrawalMapping[key]) {
        withdrawalMapping[key] = [];
      }
      withdrawalMapping[key].push(item);
    }
  });
  
  // Filter items to avoid duplicates
  const filteredItems = items.filter(item => {
    // Withdrawal handling
    if (item.type === 'withdrawal') {
      let amount = 0;
      let withdrawalId = '';
      
      // Extract amount and ID based on item type
      if (item.itemType === 'transaction') {
        amount = item.amount;
        const idMatch = item.description?.match(/#([a-f0-9-]+)/i);
        withdrawalId = idMatch ? idMatch[1] : '';
      } else if (item.itemType === 'notification') {
        amount = item.metadata?.amount || 0;
        withdrawalId = item.metadata?.withdrawalId || '';
      }
      
      // Create a unique key
      const key = withdrawalId || `withdrawal-${amount}-${new Date(item.created_at).toISOString().split('T')[0]}`;
      const group = withdrawalMapping[key];
      
      // If there's only one item or no group, keep it
      if (!group || group.length <= 1) {
        return true;
      }
      
      // For withdrawal notification groups, keep the most informative ones
      // 1. Always keep paid/rejected/confirmed notifications
      if (item.itemType === 'notification' && 
          item.title && 
          (item.title.includes('payé') || 
           item.title.includes('rejeté') || 
           item.title.includes('validé'))) {
        // But if we have multiple "validated" notifications for the same withdrawal, only keep one
        if (item.title.includes('validé')) {
          const validatedItems = group.filter(g => 
            g.itemType === 'notification' && 
            g.title && 
            g.title.includes('validé')
          );
          
          // If multiple "validated" notifications, only keep the most recent one
          if (validatedItems.length > 1) {
            const sortedValidated = [...validatedItems].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            return item.id === sortedValidated[0].id;
          }
        }
        return true;
      }
      
      // 2. For transaction entries and initial request notifications, choose wisely
      const hasTransaction = group.some(grpItem => 
        grpItem.itemType === 'transaction'
      );
      
      if (hasTransaction) {
        // If there's a transaction record, only keep the transaction and discard request notifications
        return item.itemType === 'transaction';
      } else {
        // No transaction, keep only the most recent notification
        const sortedGroup = [...group].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return item.id === sortedGroup[0].id;
      }
    }
    
    // Deposit handling
    let ref = null;
    
    if (item.itemType === 'transaction' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    } else if (item.itemType === 'notification' && item.type === 'deposit' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    }
    
    // If no reference, keep the item
    if (!ref) {
      return true;
    }
    
    // If this item has a reference, check if it's part of a group
    const group = refMapping[ref];
    if (!group || group.length <= 1) {
      return true; // No group or only one item, keep it
    }
    
    // For groups: keep only the transaction (not the notification)
    // If no transaction in the group, keep the most recent notification
    const hasTransaction = group.some(grpItem => grpItem.itemType === 'transaction');
    
    if (hasTransaction) {
      // If it's a transaction, keep it
      return item.itemType === 'transaction';
    } else {
      // No transaction, keep only the most recent notification
      const sortedGroup = [...group].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return item.id === sortedGroup[0].id;
    }
  });

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}
