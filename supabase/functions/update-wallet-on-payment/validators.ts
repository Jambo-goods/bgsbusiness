
// Request validation functions

interface RequestPayload {
  paymentId?: string;
  projectId?: string;
  percentage?: number;
  processAll?: boolean;
  forceRefresh?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  validatedData: {
    paymentId?: string;
    projectId?: string;
    percentage?: number;
    processAll: boolean;
    forceRefresh: boolean;
  };
}

// Validate the incoming request payload
export function validateRequest(payload: RequestPayload): ValidationResult {
  const { paymentId, projectId, percentage, processAll = false, forceRefresh = false } = payload;
  
  if (!paymentId && !processAll) {
    return {
      isValid: false,
      error: "Missing required payment ID",
      validatedData: { processAll, forceRefresh }
    };
  }

  return {
    isValid: true,
    validatedData: {
      paymentId,
      projectId,
      percentage,
      processAll,
      forceRefresh
    }
  };
}
