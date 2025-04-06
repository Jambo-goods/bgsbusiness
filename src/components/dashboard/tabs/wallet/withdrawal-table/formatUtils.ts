import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Date invalide";
  }
};

export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) {
    return "****";
  }
  
  // Keep the last 4 digits visible, mask the rest
  return "•••• " + accountNumber.slice(-4);
};
