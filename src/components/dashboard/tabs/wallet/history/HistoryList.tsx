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
  
  // Enhanced filtering logic - only keep the initial request and the final payment status
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
      
      // For withdrawals, only keep the initial request and final payment status
      // Step 1: Check if there's a "paid" item in the group
      const paidItem = group.find(g => 
        (g.itemType === 'transaction' && g.status === 'completed') || 
        (g.itemType === 'notification' && g.title?.toLowerCase().includes('payé'))
      );
      
      // Step 2: Find the initial request
      const requestItems = group.filter(g => 
        g.itemType === 'notification' && 
        g.title?.toLowerCase().includes('demande') &&
        !g.title?.toLowerCase().includes('validé')
      );
      
      const initialRequest = requestItems.length > 0 
        ? requestItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] 
        : null;
      
      // Only keep the initial request and the paid notification
      return (
        (paidItem && item.id === paidItem.id) || 
        (initialRequest && item.id === initialRequest.id)
      );
    }
    
    // Deposit handling - similar approach
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
    
    // For deposits, only keep the initial request and confirmation
    // Find the confirmation notification (already received)
    const confirmationItem = group.find(g => 
      (g.itemType === 'transaction') || 
      (g.itemType === 'notification' && g.title?.toLowerCase().includes('reçu'))
    );
    
    // Find the initial request
    const depositRequests = group.filter(g => 
      g.itemType === 'notification' && 
      g.title?.toLowerCase().includes('demande de dépôt')
    );
    
    const initialDepositRequest = depositRequests.length > 0 
      ? depositRequests.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] 
      : null;
    
    // Only keep these two items
    return (
      (confirmationItem && item.id === confirmationItem.id) || 
      (initialDepositRequest && item.id === initialDepositRequest.id)
    );
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
