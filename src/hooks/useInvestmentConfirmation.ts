
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useInvestmentConfirmation = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Call the callback function after successful submission
      await onSuccess();
      
      // Display success message
      toast.success("Investissement confirmé !", {
        description: "Votre investissement a été enregistré avec succès."
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error: any) {
      console.error("Erreur lors de la confirmation:", error);
      
      toast.error("Erreur de confirmation", {
        description: error.message || "Une erreur s'est produite lors de la confirmation de l'investissement"
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    handleSubmit
  };
};
