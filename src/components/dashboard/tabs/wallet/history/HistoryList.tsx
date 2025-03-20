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

  // Create mappings for identifying related transactions and notifications
  const refMapping: Record<string, HistoryItemType[]> = {};
  const withdrawalMapping: Record<string, HistoryItemType[]> = {};
  
  // First pass: group items by reference (deposits) and by withdrawal ID/amount (withdrawals)
  items.forEach(item => {
    // Deposit handling - group by reference code (e.g., DEP-123)
    let ref = null;
    
    if (item.itemType === 'transaction' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    } else if (item.itemType === 'notification' && item.type === 'deposit' && item.description) {
      const match = item.description.match(/DEP-\d+/);
      ref = match ? match[0] : null;
    }
    
    if (ref) {
      if (!refMapping[ref]) {
        refMapping[ref] = [];
      }
      refMapping[ref].push(item);
    }
    
    // Withdrawal handling - improved grouping logic
    if (item.type === 'withdrawal') {
      // Extract withdrawalId first (highest priority identifier)
      let withdrawalId = '';
      let amount = 0;
      
      if (item.itemType === 'transaction' && item.description) {
        const idMatch = item.description.match(/#([a-f0-9-]+)/i);
        withdrawalId = idMatch ? idMatch[1] : '';
        amount = item.amount;
      } else if (item.itemType === 'notification' && item.metadata?.withdrawalId) {
        withdrawalId = item.metadata.withdrawalId;
        amount = item.metadata?.amount || 0;
      } else if (item.itemType === 'notification') {
        amount = item.metadata?.amount || 0;
      }
      
      // Try to extract amount from description if not found elsewhere
      if (amount === 0 && item.description) {
        const amountMatch = item.description.match(/(\d+)€/);
        if (amountMatch) {
          amount = parseInt(amountMatch[1], 10);
        }
      }
      
      // If we have a withdrawal ID, use it as the key
      if (withdrawalId) {
        const key = `withdrawal-id-${withdrawalId}`;
        if (!withdrawalMapping[key]) {
          withdrawalMapping[key] = [];
        }
        withdrawalMapping[key].push(item);
      } 
      // Otherwise, group by amount and date
      else if (amount > 0) {
        const dateStr = new Date(item.created_at).toISOString().split('T')[0];
        const key = `withdrawal-${amount}-${dateStr}`;
        
        if (!withdrawalMapping[key]) {
          withdrawalMapping[key] = [];
        }
        withdrawalMapping[key].push(item);
      }
    }
  });
  
  // Filter items to avoid duplicates with improved priority logic
  const filteredItems = items.filter(item => {
    // Skip non-withdrawal/deposit items
    if (item.type !== 'withdrawal' && item.type !== 'deposit') {
      return true;
    }
    
    // Withdrawal handling
    if (item.type === 'withdrawal') {
      // Extract withdrawalId (highest priority identifier)
      let withdrawalId = '';
      let amount = 0;
      
      if (item.itemType === 'transaction' && item.description) {
        const idMatch = item.description.match(/#([a-f0-9-]+)/i);
        withdrawalId = idMatch ? idMatch[1] : '';
        amount = item.amount;
      } else if (item.itemType === 'notification') {
        withdrawalId = item.metadata?.withdrawalId || '';
        amount = item.metadata?.amount || 0;
      }
      
      // Try to extract amount from description if not found elsewhere
      if (amount === 0 && item.description) {
        const amountMatch = item.description.match(/(\d+)€/);
        if (amountMatch) {
          amount = parseInt(amountMatch[1], 10);
        }
      }
      
      // Determine the group key
      let key = '';
      if (withdrawalId) {
        key = `withdrawal-id-${withdrawalId}`;
      } else if (amount > 0) {
        const dateStr = new Date(item.created_at).toISOString().split('T')[0];
        key = `withdrawal-${amount}-${dateStr}`;
      } else {
        return true; // Keep items that don't fit into any group
      }
      
      const group = withdrawalMapping[key];
      if (!group || group.length <= 1) return true;
      
      // Priority order for withdrawal items:
      // 1. Always keep "paid" or "completed" status (highest priority)
      // 2. Don't show pending if a paid version exists for the same amount/ID
      // 3. Don't show validation notifications if paid version exists
      
      // Check if there's a paid item in the group
      const hasPaidItem = group.some(g => {
        if (g.itemType === 'transaction' && g.status === 'completed') return true;
        if (g.itemType === 'notification' && g.title?.toLowerCase().includes('payé')) return true;
        return false;
      });
      
      // Check if the current item is paid
      const isCurrentItemPaid = (
        (item.itemType === 'transaction' && item.status === 'completed') || 
        (item.itemType === 'notification' && item.title?.toLowerCase().includes('payé'))
      );
      
      // If there's a paid item and current item is not paid, filter it out
      if (hasPaidItem && !isCurrentItemPaid) {
        return false;
      }
      
      // If the current item is paid, keep it
      if (isCurrentItemPaid) {
        return true;
      }
      
      // For remaining items (no paid items in group), use standard logic
      if (item.itemType === 'notification' && item.title) {
        if (item.title.toLowerCase().includes('rejeté')) return true;
        
        if (item.title.toLowerCase().includes('validé')) {
          const validatedItems = group.filter(g => 
            g.itemType === 'notification' && 
            g.title?.toLowerCase().includes('validé')
          );
          
          if (validatedItems.length > 1) {
            const sortedValidated = [...validatedItems].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            return item.id === sortedValidated[0].id;
          }
          return true;
        }
      }
      
      const hasTransaction = group.some(g => g.itemType === 'transaction');
      
      if (hasTransaction) {
        return item.itemType === 'transaction';
      }
      
      const sortedGroup = [...group].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return item.id === sortedGroup[0].id;
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
    
    if (!ref) return true;
    
    const group = refMapping[ref];
    if (!group || group.length <= 1) return true;
    
    // For deposits, prioritize:
    // 1. Keep transaction records over notifications
    // 2. If no transaction, keep the most recent notification
    const hasTransaction = group.some(g => g.itemType === 'transaction');
    
    if (hasTransaction) {
      return item.itemType === 'transaction';
    }
    
    const sortedGroup = [...group].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return item.id === sortedGroup[0].id;
  });

  // Final sorting by date (most recent first)
  const sortedItems = [...filteredItems].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}
