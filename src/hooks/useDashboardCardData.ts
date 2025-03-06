
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
    // Fetch initial data
    fetchRecentChanges();
    
    // Set up realtime subscription for wallet transactions
    const walletChannel = supabase
      .channel('wallet_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        console.log('Wallet transaction detected, refreshing data...');
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
        console.log('Investment change detected, refreshing data...');
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
        console.log('Profile change detected, refreshing data...');
        fetchRecentChanges();
      })
      .subscribe();
      
    // Set up realtime subscription for projects
    const projectsChannel = supabase
      .channel('project_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        console.log('Project change detected, refreshing data...');
        fetchRecentChanges();
      })
      .subscribe();
      
    return () => {
      // Clean up all subscriptions when component unmounts
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(projectsChannel);
    };
  }, [userData]); // Add userData as a dependency to re-fetch when it changes
  
  const fetchRecentChanges = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log('No session found, skipping data fetch');
        return;
      }
      
      const userId = session.session.user.id;
      console.log('Fetching dashboard data for user:', userId);
      
      // Get wallet transactions for the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('amount, type, created_at')
        .eq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());
        
      if (walletError) {
        console.error("Error fetching wallet data:", walletError);
      }
        
      if (walletData && walletData.length > 0) {
        console.log(`Found ${walletData.length} wallet transactions in the last month`);
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
          console.log('Updated wallet change:', `${netChange >= 0 ? '+' : '-'}${Math.abs(percentChange)}%`);
        }
      } else {
        console.log('No wallet transactions found or error occurred');
      }
      
      // Get investments for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('amount, project_id, date')
        .eq('user_id', userId)
        .gte('date', threeMonthsAgo.toISOString());
      
      if (investmentsError) {
        console.error("Error fetching investments:", investmentsError);
        return;
      }
        
      if (investmentsData && investmentsData.length > 0) {
        console.log(`Found ${investmentsData.length} investments in the last 3 months`);
        
        // Calculate new projects count in last 3 months
        const uniqueProjectsLastThreeMonths = new Set(investmentsData.map(inv => inv.project_id)).size;
        setProjectsChange({ value: `${uniqueProjectsLastThreeMonths > 0 ? '+' : ''}${uniqueProjectsLastThreeMonths}` });
        console.log('Updated projects change:', uniqueProjectsLastThreeMonths);
        
        // Calculate investment change in last month
        const lastMonthInvestments = investmentsData
          .filter(inv => new Date(inv.date) >= oneMonthAgo)
          .reduce((sum, inv) => sum + inv.amount, 0);
        
        if (userData.investmentTotal > 0) {
          const investPercentChange = Math.round((lastMonthInvestments / userData.investmentTotal) * 100);
          setInvestmentChange({
            percentage: `${lastMonthInvestments > 0 ? '+' : ''}${investPercentChange}%`,
            value: `${lastMonthInvestments > 0 ? '↑' : '↓'} ${Math.abs(lastMonthInvestments)}€`
          });
          console.log('Updated investment change:', `${lastMonthInvestments > 0 ? '+' : ''}${investPercentChange}%`);
        }
      } else {
        console.log('No investments found in the last 3 months');
      }
      
      // Calculate average yield rate from investments
      const { data: activeInvestments, error: activeInvestmentsError } = await supabase
        .from('investments')
        .select('amount, yield_rate')
        .eq('user_id', userId)
        .eq('status', 'active');
        
      if (activeInvestmentsError) {
        console.error("Error fetching active investments:", activeInvestmentsError);
      }
        
      if (activeInvestments && activeInvestments.length > 0) {
        console.log(`Found ${activeInvestments.length} active investments`);
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
        console.log('Updated monthly yield:', avgMonthlyYield, 'Change:', yieldChangeValue);
      } else {
        console.log('No active investments found');
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
