
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WalletChange {
  percentage: string;
  value: string;
}

export interface InvestmentChange {
  percentage: string;
  value: string;
}

export interface ProjectsChange {
  value: string;
}

export interface YieldChange {
  value: string;
}

export interface DashboardCardData {
  monthlyYield: number;
  annualYield: number;
  walletChange: WalletChange;
  investmentChange: InvestmentChange;
  projectsChange: ProjectsChange;
  yieldChange: YieldChange;
}

export const useDashboardCardData = (userData: {
  firstName: string;
  lastName: string;
  email: string;
  investmentTotal: number;
  projectsCount: number;
  walletBalance?: number;
}): DashboardCardData => {
  const [monthlyYield, setMonthlyYield] = useState(1.125);
  const [walletChange, setWalletChange] = useState<WalletChange>({ 
    percentage: "+8.3%", 
    value: "↑ 250€" 
  });
  const [investmentChange, setInvestmentChange] = useState<InvestmentChange>({ 
    percentage: "+12.5%", 
    value: "↑ 1250€" 
  });
  const [projectsChange, setProjectsChange] = useState<ProjectsChange>({ 
    value: "+2" 
  });
  const [yieldChange, setYieldChange] = useState<YieldChange>({ 
    value: "+0.1%" 
  });
  
  // Calculate yearly yield for display
  const annualYield = monthlyYield * 12; // 13.5% per year
  
  useEffect(() => {
    fetchRecentChanges();
    
    // Set up realtime subscription for wallet transactions
    const walletChannel = supabase
      .channel('wallet_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        fetchRecentChanges();
      })
      .subscribe();
      
    // Set up realtime subscription for investments
    const investmentsChannel = supabase
      .channel('investment_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        fetchRecentChanges();
      })
      .subscribe();
      
    // Set up realtime subscription for profiles
    const profilesChannel = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchRecentChanges();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [userData]); // Add userData as a dependency to re-fetch when it changes
  
  const fetchRecentChanges = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      
      const userId = session.session.user.id;
      
      // Get wallet transactions for the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const { data: walletData } = await supabase
        .from('wallet_transactions')
        .select('amount, type, created_at')
        .eq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());
        
      if (walletData && walletData.length > 0) {
        const depositsLastMonth = walletData
          .filter(t => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const withdrawalsLastMonth = walletData
          .filter(t => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const netChange = depositsLastMonth - withdrawalsLastMonth;
        
        if (userData.walletBalance && userData.walletBalance > 0) {
          const percentChange = Math.round((netChange / userData.walletBalance) * 100);
          setWalletChange({
            percentage: `${netChange >= 0 ? '+' : '-'}${Math.abs(percentChange)}%`,
            value: `${netChange >= 0 ? '↑' : '↓'} ${Math.abs(netChange)}€`
          });
        }
      }
      
      // Get investments for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('amount, project_id, created_at')
        .eq('user_id', userId)
        .gte('created_at', threeMonthsAgo.toISOString());
        
      if (investmentsData) {
        // Calculate new projects count in last 3 months
        const uniqueProjectsLastThreeMonths = new Set(investmentsData.map(inv => inv.project_id)).size;
        setProjectsChange({ value: `${uniqueProjectsLastThreeMonths > 0 ? '+' : ''}${uniqueProjectsLastThreeMonths}` });
        
        // Calculate investment change in last month
        const lastMonthInvestments = investmentsData
          .filter(inv => new Date(inv.created_at) >= oneMonthAgo)
          .reduce((sum, inv) => sum + inv.amount, 0);
        
        if (userData.investmentTotal > 0) {
          const investPercentChange = Math.round((lastMonthInvestments / userData.investmentTotal) * 100);
          setInvestmentChange({
            percentage: `${lastMonthInvestments > 0 ? '+' : ''}${investPercentChange}%`,
            value: `${lastMonthInvestments > 0 ? '↑' : '↓'} ${Math.abs(lastMonthInvestments)}€`
          });
        }
      }
      
      // Calculate average yield rate from investments
      const { data: activeInvestments } = await supabase
        .from('investments')
        .select('amount, yield_rate')
        .eq('user_id', userId)
        .eq('status', 'active');
        
      if (activeInvestments && activeInvestments.length > 0) {
        const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
        const weightedYield = activeInvestments.reduce(
          (sum, inv) => sum + (inv.yield_rate * inv.amount), 0
        );
        
        const avgMonthlyYield = totalInvestment > 0 ? 
          parseFloat((weightedYield / totalInvestment).toFixed(3)) : 1.125;
        
        const previousYield = monthlyYield;
        setMonthlyYield(avgMonthlyYield);
        
        // Calculate yield change
        const yieldChangeValue = (avgMonthlyYield - previousYield).toFixed(2);
        setYieldChange({ 
          value: `${parseFloat(yieldChangeValue) >= 0 ? '+' : ''}${yieldChangeValue}%` 
        });
      }
      
    } catch (error) {
      console.error("Error fetching dashboard card data:", error);
    }
  };

  return {
    monthlyYield,
    annualYield,
    walletChange,
    investmentChange,
    projectsChange,
    yieldChange
  };
};
