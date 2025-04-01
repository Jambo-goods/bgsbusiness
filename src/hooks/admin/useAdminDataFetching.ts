
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLog, AdminStats } from "./types";

export async function fetchAdminDashboardData(): Promise<{
  stats: AdminStats;
  logs: AdminLog[];
}> {
  console.log("Fetching admin dashboard data...");
  
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (userError) throw userError;
    
    console.log("User count from database:", userCount);
    
    // Get total wallet balance
    const { data: walletData, error: walletError } = await supabase
      .from('profiles')
      .select('wallet_balance');
    
    if (walletError) throw walletError;
    
    const totalWalletBalance = walletData?.reduce((sum, profile) => sum + (profile.wallet_balance || 0), 0) || 0;
    console.log("Total wallet balance:", totalWalletBalance);
    
    // Get total investments
    const { data: investmentsData, error: investmentsError } = await supabase
      .from('investments')
      .select('amount');
    
    if (investmentsError) throw investmentsError;
    
    const totalInvestments = investmentsData?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    
    // Get received bank transfers count and amount
    const { data: transfersData, error: transfersError } = await supabase
      .from('bank_transfers')
      .select('amount')
      .in('status', ['received', 'reçu']);
    
    if (transfersError) throw transfersError;
    
    const receivedTransfersCount = transfersData?.length || 0;
    const receivedTransfersAmount = transfersData?.reduce((sum, transfer) => sum + (transfer.amount || 0), 0) || 0;
    console.log("Received transfers:", receivedTransfersCount, "Amount:", receivedTransfersAmount);
    
    // Get withdrawal requests count and amount
    const { data: withdrawalsData, error: withdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('amount');
    
    if (withdrawalsError) throw withdrawalsError;
    
    const withdrawalRequestsCount = withdrawalsData?.length || 0;
    const withdrawalRequestsAmount = withdrawalsData?.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0) || 0;
    console.log("Withdrawal requests:", withdrawalRequestsCount, "Amount:", withdrawalRequestsAmount);
    
    // Get total projects
    const { count: totalProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (projectsError) throw projectsError;
    
    // Get ongoing projects (with status 'active' or 'in_progress')
    const { count: ongoingProjects, error: ongoingProjectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'in_progress']);
    
    if (ongoingProjectsError) throw ongoingProjectsError;
    
    // Get pending withdrawals
    const { count: pendingWithdrawals, error: pendingWithdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (pendingWithdrawalsError) throw pendingWithdrawalsError;
    
    const stats: AdminStats = {
      userCount: userCount || 0,
      totalInvestments,
      totalProjects: totalProjects || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      ongoingProjects: ongoingProjects || 0,
      totalWalletBalance,
      receivedTransfersCount,
      receivedTransfersAmount,
      withdrawalRequestsCount,
      withdrawalRequestsAmount
    };
    
    console.log("Admin dashboard data fetched successfully:", stats);
    
    // Return an empty array for logs since the table doesn't exist yet
    const emptyLogs: AdminLog[] = [];
    
    return {
      stats,
      logs: emptyLogs
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    toast.error("Erreur lors du chargement du tableau de bord", {
      description: "Veuillez réessayer plus tard ou contacter le support."
    });
    throw error;
  }
}
