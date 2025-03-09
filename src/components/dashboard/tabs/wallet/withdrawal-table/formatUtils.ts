import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
};

export const maskAccountNumber = (accountNumber: string) => {
  if (!accountNumber) return '';
  
  // If it's an IBAN, show only first 4 and last 4 characters
  if (accountNumber.length > 10) {
    return `${accountNumber.substring(0, 4)}...${accountNumber.substring(accountNumber.length - 4)}`;
  }
  
  // Otherwise, show only last 4 characters
  return `...${accountNumber.substring(accountNumber.length - 4)}`;
};
