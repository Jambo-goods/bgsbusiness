import { BankTransferItem } from "../types/bankTransfer";

/**
 * Normalize a reference string by removing spaces, special characters, and converting to lowercase
 */
export const normalizeReference = (reference: string): string => {
  return reference
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w-]/g, '');
};

/**
 * Determine the priority of a status for sorting purposes
 */
export const getStatusPriority = (status: string): number => {
  const statusPriorities: Record<string, number> = {
    'received': 5,
    'reçu': 5,
    'completed': 4,
    'processing': 3,
    'pending': 2,
    'rejected': 1,
    'cancelled': 0
  };
  return statusPriorities[status.toLowerCase()] || 0;
};

/**
 * Extract the base reference from various formats
 * For example: "virementbancaireconfirmrfdep-123456" -> "dep-123456"
 */
export const extractBaseReference = (reference: string): string => {
  // Handle the case where reference might be undefined
  if (!reference) return '';
  
  // Normalize first
  const normalized = normalizeReference(reference);
  
  // Check if it contains "dep-" pattern
  const depMatch = normalized.match(/dep-\d+/);
  if (depMatch) {
    return depMatch[0]; // Return just the dep-XXXXXX part
  }
  
  return normalized;
};

/**
 * Deduplicate bank transfers by reference, keeping the one with highest priority status
 * or most recent date if status priorities are the same
 */
export const deduplicateTransfers = (transfers: BankTransferItem[]): BankTransferItem[] => {
  if (!transfers || transfers.length === 0) {
    return [];
  }
  
  console.log("Starting deduplication of", transfers.length, "transfers");
  
  // Step 1: Create a base reference map (extracting the core reference value)
  const referenceMap = new Map<string, BankTransferItem[]>();
  
  // Group transfers by base reference
  transfers.forEach(transfer => {
    // Extract the base reference
    const baseRef = extractBaseReference(transfer.reference || '');
      
    // If this base reference already exists in the map, add this transfer to the array
    if (referenceMap.has(baseRef)) {
      referenceMap.get(baseRef)!.push(transfer);
    } else {
      // Otherwise, create a new array with this transfer
      referenceMap.set(baseRef, [transfer]);
    }
  });
  
  console.log("Grouped transfers by base reference:", referenceMap.size, "unique references");
  
  // Step 2: For each reference, select the best transfer based on status and date
  const dedupedTransfers: BankTransferItem[] = [];
  
  referenceMap.forEach((transfers, baseRef) => {
    console.log(`Base reference ${baseRef}: ${transfers.length} entries`);
    
    if (transfers.length === 1) {
      // If only one transfer for this reference, add it directly
      dedupedTransfers.push(transfers[0]);
      return;
    }
    
    // Sort transfers by status priority (highest first) and then by date (most recent first)
    const sortedTransfers = [...transfers].sort((a, b) => {
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);
      
      // If priorities are different, sort by priority
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // If same priority, sort by date (most recent first)
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    // The first transfer is now the one with highest priority and most recent date
    dedupedTransfers.push(sortedTransfers[0]);
    
    console.log(`Kept transfer for ${baseRef}: ID=${sortedTransfers[0].id}, Status=${sortedTransfers[0].status}`);
    if (transfers.length > 1) {
      console.log(`  Discarded ${transfers.length - 1} duplicate(s) with lower priority/older date`);
    }
  });
  
  // Log deduplication results
  console.log(`FINAL DEDUPLICATION RESULTS: ${transfers.length} original -> ${dedupedTransfers.length} after deduplication`);
  
  return dedupedTransfers;
};

/**
 * Sort transfers by date, most recent first
 */
export const sortTransfersByDate = (transfers: BankTransferItem[]): BankTransferItem[] => {
  return [...transfers].sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });
};
