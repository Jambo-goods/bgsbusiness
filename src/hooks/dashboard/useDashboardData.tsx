
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealTimeSubscriptions } from "@/hooks/dashboard/useRealTimeSubscriptions";

export function useDashboardData(userId: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [investments, setInvestments] = useState([]);

  // Initialize real-time subscriptions (now using polling)
  const { pollingStatus, triggerManualUpdate } = useRealTimeSubscriptions({
    userId: userId || '',
    onProfileUpdate: () => fetchUserData(),
    onInvestmentUpdate: () => fetchInvestments(),
  });

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Erreur lors du chargement de vos données");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestments = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error("Error fetching investments:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchInvestments();
    }
  }, [userId]);

  return {
    isLoading,
    userData,
    investments,
    pollingStatus,
    refreshData: () => {
      fetchUserData();
      fetchInvestments();
    },
    triggerManualUpdate
  };
}
