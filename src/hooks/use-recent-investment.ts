
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useRecentInvestment(refreshData: () => void) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentInvestment, setRecentInvestment] = useState<any>(null);
  
  useEffect(() => {
    const recentInvestmentData = localStorage.getItem("recentInvestment");
    
    if (recentInvestmentData) {
      try {
        // Parse stored investment data
        const investmentData = JSON.parse(recentInvestmentData);
        
        // Check if investment is recent (less than 10 minutes old)
        const investmentTime = new Date(investmentData.timestamp || Date.now());
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - investmentTime.getTime();
        const minutesDifference = timeDifference / (1000 * 60);
        
        // Only show investment if it's less than 10 minutes old
        if (minutesDifference < 10) {
          setRecentInvestment(investmentData);
          
          // Show success toast
          toast({
            title: "Investissement réussi !",
            description: `Votre investissement de ${investmentData.amount}€ dans ${investmentData.projectName} a été enregistré.`,
          });
          
          // Update Supabase with the investment
          updateSupabaseWithInvestment(investmentData);
          
          // Show investment confirmation
          setShowSuccess(true);
        } else {
          // Remove from localStorage if too old
          localStorage.removeItem("recentInvestment");
        }
      } catch (error) {
        console.error("Erreur lors de l'analyse des données d'investissement:", error);
        localStorage.removeItem("recentInvestment");
      }
    }
  }, [refreshData]);

  // Function to update Supabase with the new investment
  async function updateSupabaseWithInvestment(investmentData: any) {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        console.error("Utilisateur non connecté");
        return;
      }
      
      // Check if investment already exists
      const { data: existingInvestment, error: checkError } = await supabase
        .from('investments')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', investmentData.projectId)
        .eq('amount', investmentData.amount)
        .order('date', { ascending: false })
        .limit(1);
      
      if (checkError) {
        console.error("Erreur lors de la vérification de l'investissement:", checkError);
      } else if (existingInvestment && existingInvestment.length > 0) {
        // Investment already exists, no need to recreate it
        console.log("Investissement déjà enregistré, pas besoin de le recréer");
        
        // Remove from localStorage to avoid showing again
        localStorage.removeItem("recentInvestment");
        
        // Refresh dashboard data
        refreshData();
        
        return;
      }
      
      // Calculate end date (duration in months from now)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + investmentData.duration);
      
      // Insert investment into investments table if it doesn't already exist
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: investmentData.projectId,
          amount: investmentData.amount,
          yield_rate: investmentData.yield,
          duration: investmentData.duration,
          end_date: endDate.toISOString(),
          date: new Date().toISOString()
        });
      
      if (investmentError) {
        console.error("Erreur lors de l'enregistrement de l'investissement:", investmentError);
        return;
      }
      
      // Update user profile
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count, wallet_balance')
        .eq('id', userId)
        .single();
      
      if (profileFetchError) {
        console.error("Erreur lors de la récupération du profil:", profileFetchError);
        return;
      }
      
      // Calculate new values
      const newTotal = (profileData.investment_total || 0) + investmentData.amount;
      const newBalance = (profileData.wallet_balance || 0) - investmentData.amount;
      
      // Check if user has already invested in this project
      const { data: existingInvestments } = await supabase
        .from('investments')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', investmentData.projectId);
      
      let newCount = profileData.projects_count || 0;
      if (existingInvestments && existingInvestments.length <= 1) {
        // Only increment if this is user's first investment in this project
        newCount += 1;
      }
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          investment_total: newTotal,
          projects_count: newCount,
          wallet_balance: newBalance >= 0 ? newBalance : 0
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Erreur lors de la mise à jour du profil:", updateError);
        return;
      }
      
      // Create transaction for the investment
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: -investmentData.amount,
          type: 'investment',
          description: `Investissement dans ${investmentData.projectName}`
        });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
      }
      
      // Remove from localStorage to avoid showing again
      localStorage.removeItem("recentInvestment");
      
      // Refresh dashboard data
      refreshData();
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'investissement:", error);
    }
  }

  return { showSuccess, recentInvestment };
}
