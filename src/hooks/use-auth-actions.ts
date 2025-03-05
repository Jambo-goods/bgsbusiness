
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useAuthActions() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vous déconnecter.",
        variant: "destructive"
      });
    } else {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return { handleLogout };
}
