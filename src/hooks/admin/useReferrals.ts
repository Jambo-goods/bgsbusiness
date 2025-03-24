
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  commission_rate: number;
  total_commission: number;
  created_at: string;
  referrer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  referred?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export function useReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching referrals...");
      
      // With the updated RLS policies, this query should return all referrals for admins
      // and only the user's own referrals for regular users
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referrer_id,
          referred_id,
          status,
          commission_rate,
          total_commission,
          created_at,
          referrer:profiles!referrals_referrer_id_fkey(first_name, last_name, email),
          referred:profiles!referrals_referred_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Referrals data:", data);
      
      // Make sure total_commission is a number, not null
      const processedData = data?.map(referral => ({
        ...referral,
        total_commission: referral.total_commission || 0
      })) || [];
      
      setReferrals(processedData as Referral[]);
      
      if (data && data.length === 0) {
        console.log("No referrals found");
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      toast.error("Erreur lors du chargement des parrainages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReferralStatus = async (referralId: string, newStatus: string) => {
    try {
      // 1. Mettre à jour le statut dans la base de données
      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referralId);
      
      if (error) throw error;
      
      // 2. Recharger les données complètes du parrainage pour avoir total_commission à jour
      await fetchReferrals();
      
      toast.success("Statut du parrainage mis à jour avec succès");
      return { success: true };
    } catch (err) {
      console.error("Error updating referral status:", err);
      toast.error("Erreur lors de la mise à jour du statut");
      return { success: false, error: err instanceof Error ? err.message : "Une erreur est survenue" };
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return {
    referrals,
    isLoading,
    error,
    refreshReferrals: fetchReferrals,
    updateReferralStatus
  };
}
