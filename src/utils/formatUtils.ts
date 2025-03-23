
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
