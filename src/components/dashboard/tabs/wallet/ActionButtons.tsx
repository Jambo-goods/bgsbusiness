import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@supabase/auth-helpers-react";

interface ActionButtonsProps {
  onRefreshWallet?: () => void;
  isRefreshing?: boolean;
  showWithdraw?: boolean;
  showDeposit?: boolean;
  showInvest?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
}

export default function ActionButtons({
  onRefreshWallet,
  isRefreshing = false,
  showWithdraw = true,
  showDeposit = true,
  showInvest = true,
  size = "default",
  variant = "outline",
  className = ""
}: ActionButtonsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefresh = async () => {
    if (onRefreshWallet) {
      onRefreshWallet();
    } else {
      // Default refresh behavior if no callback provided
      setIsUpdating(true);
      try {
        if (user?.id) {
          const { error } = await supabase.rpc('recalculate_wallet_balance', {
            user_uuid: user.id
          });
          
          if (error) {
            console.error("Error recalculating wallet balance:", error);
            toast.error("Erreur lors de l'actualisation du solde");
          } else {
            toast.success("Solde actualisé avec succès");
          }
        }
      } catch (error) {
        console.error("Error in wallet refresh:", error);
        toast.error("Une erreur est survenue");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeposit = () => {
    router.push("/dashboard/wallet/deposit");
  };

  const handleWithdraw = () => {
    router.push("/dashboard/wallet/withdraw");
  };

  const handleInvest = () => {
    router.push("/dashboard/projects");
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handleRefresh}
        disabled={isRefreshing || isUpdating}
        className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
      >
        {isRefreshing || isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualisation...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </>
        )}
      </Button>

      {showDeposit && (
        <Button
          variant={variant}
          size={size}
          onClick={handleDeposit}
          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Déposer
        </Button>
      )}

      {showWithdraw && (
        <Button
          variant={variant}
          size={size}
          onClick={handleWithdraw}
          className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
        >
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Retirer
        </Button>
      )}

      {showInvest && (
        <Button
          variant={variant}
          size={size}
          onClick={handleInvest}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Investir
        </Button>
      )}
    </div>
  );
}
