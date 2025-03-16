
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInvestmentTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investments, setInvestments] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const fetchInvestmentData = useCallback(async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("investments")
        .select(`
          *,
          projects (
            id,
            name,
            description,
            image,
            status,
            company_name,
            location,
            risk_level,
            category,
            expected_yield,
            duration
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setInvestments(data || []);
    } catch (error: any) {
      console.error("Error fetching investment data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          setUserId(data.session.user.id);
        } else {
          console.info("No active session found for investment tracking");
          setUserId(null);
        }
        setSessionChecked(true);
      } catch (error) {
        console.error("Session check error:", error);
        setUserId(null);
        setSessionChecked(true);
      }
    };

    // Only check once on mount
    if (!sessionChecked) {
      checkSession();
    }
  }, [sessionChecked]);

  useEffect(() => {
    if (userId) {
      console.info("Fetching investment data...");
      fetchInvestmentData();
    }
  }, [userId, fetchInvestmentData]);

  const refreshData = useCallback(() => {
    if (userId) {
      fetchInvestmentData();
    }
  }, [userId, fetchInvestmentData]);

  return {
    isLoading,
    error,
    investments,
    refreshData,
    userId,
    sessionChecked
  };
};
