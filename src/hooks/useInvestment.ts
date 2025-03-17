import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

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
	const { setUser } = useUser();

  const confirmInvestmentMutation = useMutation({
    mutationFn: async ({ amount, project_id }: { amount: number; project_id: string }) => {
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user?.id) {
        throw new Error("Vous devez être connecté pour investir.");
      }

      const { data, error } = await supabase
        .from("investments")
        .insert([{ amount, project_id, user_id: session.session.user.id }])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'investissement:", error);
        throw new Error("Impossible de confirmer l'investissement.");
      }

      return data as Investment;
    },
    onSuccess: (data) => {
      toast.success("Investissement confirmé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Une erreur est survenue lors de la confirmation de l'investissement.");
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

    // Update the user context to null
    setUser(null);

    // Redirect to the home page
    navigate("/");

    toast.success("Déconnexion réussie!");
  };

  return {
    isConfirming,
    investmentId,
    handleConfirm,
    handleCancel,
    confirmInvestment: confirmInvestmentMutation.mutate,
    isLoading: confirmInvestmentMutation.isLoading,
    isError: confirmInvestmentMutation.isError,
    error: confirmInvestmentMutation.error,
		handleLogout
  };
}
