
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
    
    // Log all profiles to verify data
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) throw profilesError;
    
    console.log("All profiles from database:", profilesData);
    
    // Get total investments
    const { data: investmentsData, error: investmentsError } = await supabase
      .from('investments')
      .select('amount');
    
    if (investmentsError) throw investmentsError;
    
    const totalInvestments = investmentsData?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    
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
    const { count: pendingWithdrawals, error: withdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (withdrawalsError) throw withdrawalsError;
    
    // Get recent admin logs
    const { data: logsData, error: logsError } = await supabase
      .from('admin_logs')
      .select(`
        *,
        admin_users(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (logsError) throw logsError;
    
    const stats: AdminStats = {
      userCount: userCount || 0,
      totalInvestments,
      totalProjects: totalProjects || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      ongoingProjects: ongoingProjects || 0
    };
    
    console.log("Admin dashboard data fetched successfully:", {
      userCount,
      totalInvestments,
      totalProjects,
      pendingWithdrawals,
      ongoingProjects,
      logs: logsData?.length || 0,
      profiles: profilesData?.length || 0
    });
    
    return {
      stats,
      logs: logsData || []
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    toast.error("Erreur lors du chargement du tableau de bord", {
      description: "Veuillez réessayer plus tard ou contacter le support."
    });
    throw error;
  }
}
