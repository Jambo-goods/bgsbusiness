
import { supabase } from "@/integrations/supabase/client";
import { InvestmentData } from "../types/investment";

export async function fetchInvestmentData(investmentId: string): Promise<InvestmentData | null> {
  try {
    // Fetch the investment with the joined project
    const { data: investment, error } = await supabase
      .from('investments')
      .select(`
        *,
        projects (
          name,
          description,
          image,
          status,
          duration,
          yield
        )
      `)
      .eq('id', investmentId)
      .single();

    if (error) {
      console.error("Error fetching investment data:", error);
      return null;
    }

    if (!investment) {
      console.error("No investment found with ID:", investmentId);
      return null;
    }

    // Calculate remaining duration in months
    const startDate = new Date(investment.date);
    const endDate = new Date(investment.end_date);
    const today = new Date();
    
    // Calculate total duration and remaining duration in months
    const totalMonths = investment.duration;
    
    // Calculate elapsed months (capped at total duration)
    const elapsedMonths = Math.min(
      Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
      totalMonths
    );
    
    const remainingDuration = Math.max(0, totalMonths - elapsedMonths);

    // Get user information if needed
    // Since user_first_name and user_last_name don't exist directly on the investment object,
    // we need to properly structure our data without these fields
    
    return {
      ...investment,
      remainingDuration,
    };
  } catch (error) {
    console.error("Unexpected error in fetchInvestmentData:", error);
    return null;
  }
}
