
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
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(first_name, last_name, email),
          referred:profiles!referrals_referred_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Referrals data:", data);
      setReferrals(data as Referral[]);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      toast.error("Erreur lors du chargement des parrainages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return {
    referrals,
    isLoading,
    error,
    refreshReferrals: fetchReferrals
  };
}
