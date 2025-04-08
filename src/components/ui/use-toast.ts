
// Re-export from the source rather than creating circular dependencies
import { toast } from "sonner";

// Export the toast function from sonner
export { toast };

// Re-export the useToast hook directly
export const useToast = () => {
  return {
    toast,
    // Add any additional functionality if needed
    // This provides a compatibility layer for any existing code
    toasts: [],
    dismiss: () => {}
  };
};
