
import { supabase } from "@/integrations/supabase/client";
import { calculateRemainingDuration } from "@/utils/investmentCalculations";

export async function fetchInvestmentData(investmentId: string) {
  try {
    console.log("Fetching investment data for ID:", investmentId);
    
    // Fetch the investment details with project data
    const { data: investmentData, error: investmentError } = await supabase
      .from('investments')
      .select(`
        *,
        projects(*)
      `)
      .eq('id', investmentId)
      .single();
    
    if (investmentError) throw investmentError;
    if (!investmentData) throw new Error('Investment not found');
    
    console.log("Investment data fetched:", investmentData);
    
    // Calculate remaining duration
    const remainingDuration = calculateRemainingDuration(
      investmentData.date,
      investmentData.duration
    );
    
    // Add calculated fields to the investment data
    const enhancedInvestmentData = {
      ...investmentData,
      remainingDuration
    };
    
    // Fetch user profile information
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', investmentData.user_id)
      .single();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      // Continue without user data
    }
    
    // Combine all data
    const fullInvestmentData = {
      ...enhancedInvestmentData,
      user: userData || { 
        first_name: 'Unknown', 
        last_name: 'User',
        email: '', 
        phone: ''
      }
    };
    
    console.log("Enhanced investment data:", fullInvestmentData);
    return fullInvestmentData;
  } catch (error) {
    console.error("Error in fetchInvestmentData:", error);
    throw error;
  }
}
