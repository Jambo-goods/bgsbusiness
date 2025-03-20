
import { toast } from "sonner";
import { BankTransferItem } from "../types/bankTransfer";

export function formatBankTransferData(
  bankTransfersData: any[],
  walletTransactions: any[],
  profilesMap: Record<string, any>
): BankTransferItem[] {
  // Format bank transfers
  let formattedTransfers = (bankTransfersData || []).map(transfer => {
    const profile = profilesMap[transfer.user_id] || {
      first_name: "Utilisateur",
      last_name: "Inconnu",
      email: null
    };
    
    // Ensure all required fields are present
    return {
      id: transfer.id,
      created_at: transfer.confirmed_at || new Date().toISOString(),
      user_id: transfer.user_id,
      amount: transfer.amount || 0,
      description: `Virement bancaire (réf: ${transfer.reference})`,
      status: transfer.status || "pending",
      receipt_confirmed: transfer.processed || false,
      reference: transfer.reference,
      processed: transfer.processed,
      processed_at: transfer.processed_at,
      notes: transfer.notes,
      source: "bank_transfers",
      profile: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      }
    };
  });
  
  // Format wallet transactions
  if (walletTransactions && walletTransactions.length > 0) {
    const walletTransfers = walletTransactions.map(tx => {
      const profile = profilesMap[tx.user_id] || {
        first_name: "Utilisateur",
        last_name: "Inconnu",
        email: null
      };
      
      return {
        id: tx.id,
        created_at: tx.created_at || new Date().toISOString(),
        user_id: tx.user_id,
        amount: tx.amount || 0,
        description: tx.description || "Dépôt bancaire",
        status: tx.status || "pending",
        receipt_confirmed: tx.receipt_confirmed || false,
        reference: tx.description || `Auto-${tx.id.substring(0, 8)}`,
        processed: tx.receipt_confirmed || false,
        processed_at: null,
        notes: "",
        source: "wallet_transactions",
        profile: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email
        }
      };
    });
    
    // Add wallet transactions to formatted transfers, avoiding duplicates by reference
    // This is more robust than avoiding duplication by ID
    const existingRefs = new Set(formattedTransfers.map(t => `${t.reference}-${t.amount}`));
    
    walletTransfers.forEach(transfer => {
      const refKey = `${transfer.reference}-${transfer.amount}`;
      if (!existingRefs.has(refKey)) {
        formattedTransfers.push(transfer);
        existingRefs.add(refKey);
      }
    });
  }
  
  return formattedTransfers;
}

// Helper function to rank status importance
export function getPriorityScore(status: string): number {
  // Prioritize statuses in this order - completed/received is higher priority than pending
  const priorities: Record<string, number> = {
    'received': 4,
    'reçu': 4, 
    'completed': 3,
    'processing': 2,
    'pending': 1,
    'rejected': 0,
    'cancelled': 0
  };
  
  return priorities[status] || 0;
}

export function deduplicateByReferenceAndStatus(transfers: BankTransferItem[]): BankTransferItem[] {
  // First-level duplicate removal - detect duplicates with the same reference but different statuses
  const referenceMap = new Map();
  
  transfers.forEach(transfer => {
    const refKey = `${transfer.reference}-${transfer.amount}`;
    
    // Either this is a new reference or we have a more recent/important status
    if (!referenceMap.has(refKey) || 
        getPriorityScore(transfer.status) > getPriorityScore(referenceMap.get(refKey).status) ||
        (referenceMap.get(refKey).status === transfer.status && 
         new Date(transfer.created_at) > new Date(referenceMap.get(refKey).created_at))) {
      
      referenceMap.set(refKey, transfer);
    }
  });
  
  // Return the de-duplicated array
  return Array.from(referenceMap.values());
}
