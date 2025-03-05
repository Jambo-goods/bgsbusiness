
import { toast } from "sonner";
import { Project } from "@/types/project";

interface HandleInvestmentParams {
  project: Project;
  selectedAmount: number;
  selectedDuration: number;
  expectedYield: number;
  setIsInvesting: (value: boolean) => void;
  onSuccess?: () => void;
}

export function useInvestmentActions() {
  const handleInvestment = async ({
    project,
    selectedAmount,
    selectedDuration,
    expectedYield,
    setIsInvesting,
    onSuccess
  }: HandleInvestmentParams) => {
    // Store the investment details in localStorage for the confirmation page
    localStorage.setItem("pendingInvestment", JSON.stringify({
      projectId: project.id,
      projectName: project.name,
      amount: selectedAmount,
      duration: selectedDuration,
      yield: expectedYield,
      timestamp: new Date().toISOString()
    }));
    
    // Set investing state
    setIsInvesting(true);
    
    // IMPORTANT: Fix the navigation path construction and force direct navigation
    try {
      // Use the direct path with project ID and make sure we're not replacing the current route
      const confirmationPath = `/project/${project.id}/confirmation`;
      console.log("Navigation to confirmation page:", confirmationPath);
      
      // Force navigation with a hard redirect to ensure proper route change
      window.location.href = confirmationPath;
      
      // Don't execute code after this point as the page will reload
      if (onSuccess) {
        onSuccess();
      }
      return;
    } catch (error) {
      console.error("Erreur de redirection:", error);
      toast.error("Erreur lors de la redirection vers la page de confirmation");
      setIsInvesting(false);
    }
  };

  return {
    handleInvestment
  };
}
