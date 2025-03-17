
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Investment {
  id: string;
  amount: number;
  project_id: string;
  user_id: string;
  created_at: string;
}

export function useInvestment() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [investmentId, setInvestmentId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const confirmInvestmentMutation = useMutation({
    mutationFn: async ({ amount, project_id }: { amount: number; project_id: string }) => {
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user?.id) {
        throw new Error("You must be logged in to invest.");
      }

      // Fix the insert operation to use a single object instead of array to address the TS error
      const { data, error } = await supabase
        .from("investments")
        .insert({ 
          amount, 
          project_id, 
          user_id: session.session.user.id,
          // Adding necessary fields to match the Investment type
          duration: 12, // Default duration in months
          yield_rate: 5.0 // Default yield rate
        })
        .select()
        .single();

      if (error) {
        console.error("Error during investment:", error);
        throw new Error("Unable to confirm investment.");
      }

      return data as Investment;
    },
    onSuccess: (data) => {
      toast.success("Investment confirmed successfully!");
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred while confirming the investment.");
    },
  });

  const handleConfirm = (id: string) => {
    setInvestmentId(id);
    setIsConfirming(true);
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setInvestmentId(null);
  };

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    
    // Remove the user from local storage
    localStorage.removeItem("user");

    // Redirect to the home page
    navigate("/");

    toast.success("Logout successful!");
  };

  return {
    isConfirming,
    investmentId,
    handleConfirm,
    handleCancel,
    confirmInvestment: confirmInvestmentMutation.mutate,
    isLoading: confirmInvestmentMutation.isPending, // Fixed property name
    isError: confirmInvestmentMutation.isError,
    error: confirmInvestmentMutation.error,
    handleLogout
  };
}
