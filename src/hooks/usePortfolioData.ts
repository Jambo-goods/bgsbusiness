
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PortfolioDataPoint {
  name: string;
  value: number;
}

export const usePortfolioData = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial portfolio data
    fetchPortfolioData();
    
    console.log("Setting up real-time subscription for portfolio data...");
    
    // Get the current user
    const getUserId = async () => {
      const { data: session } = await supabase.auth.getSession();
      return session?.session?.user.id;
    };
    
    getUserId().then(userId => {
      if (!userId) {
        console.log("No user ID available for portfolio subscriptions");
        return;
      }
      
      // Set up real-time subscription for portfolio updates
      const portfolioChannel = supabase
        .channel('portfolio_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${userId}`
        }, () => {
          console.log('Investment data changed, refreshing portfolio chart...');
          fetchPortfolioData();
        })
        .subscribe();
        
      // Set up real-time subscription for wallet transactions
      const walletChannel = supabase
        .channel('wallet_portfolio_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${userId}`
        }, () => {
          console.log('Wallet transaction detected, refreshing portfolio chart...');
          fetchPortfolioData();
        })
        .subscribe();
      
      return () => {
        console.log("Cleaning up portfolio data subscriptions");
        supabase.removeChannel(portfolioChannel);
        supabase.removeChannel(walletChannel);
      };
    }).catch(error => {
      console.error("Error setting up portfolio subscriptions:", error);
    });
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching portfolio data...");
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log('No active session found for portfolio data');
        setPortfolioData([]);
        return;
      }
      
      console.log(`Fetching investment data for user: ${session.session.user.id}`);
      
      // Get all investments for the user grouped by month
      const { data: investments, error } = await supabase
        .from('investments')
        .select('amount, date')
        .eq('user_id', session.session.user.id)
        .order('date', { ascending: true });
        
      if (error) {
        console.error("Error fetching investment data:", error);
        setPortfolioData([]);
        return;
      }
      
      if (!investments || investments.length === 0) {
        console.log('No investment data found');
        setPortfolioData(generateEmptyPortfolioData());
        return;
      }
      
      // Process data by month
      const aggregatedData = aggregateDataByMonth(investments);
      console.log('Updated portfolio data:', aggregatedData);
      setPortfolioData(aggregatedData);
    } catch (error) {
      console.error("Error in fetchPortfolioData:", error);
      setPortfolioData(generateEmptyPortfolioData());
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate empty portfolio data with zero values for all months
  const generateEmptyPortfolioData = (): PortfolioDataPoint[] => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return monthNames.map(name => ({ name, value: 0 }));
  };
  
  // Aggregate investment data by month
  const aggregateDataByMonth = (investments: any[]): PortfolioDataPoint[] => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    
    // Initialize with 0 values for all months of current year
    const monthlyData: Record<string, number> = {};
    monthNames.forEach(month => {
      monthlyData[month] = 0;
    });
    
    // Accumulate investment amounts by month
    let cumulativeValue = 0;
    
    investments.forEach(investment => {
      if (!investment.date) return;
      
      const investmentDate = new Date(investment.date);
      const year = investmentDate.getFullYear();
      
      // Only include data from current year
      if (year === currentYear) {
        const monthIndex = investmentDate.getMonth();
        const monthName = monthNames[monthIndex];
        
        // Add investment amount to cumulative value
        cumulativeValue += investment.amount;
        
        // Update all months from the investment month to December
        for (let i = monthIndex; i < 12; i++) {
          const currentMonthName = monthNames[i];
          monthlyData[currentMonthName] = Math.max(monthlyData[currentMonthName], cumulativeValue);
        }
      }
    });
    
    // Convert to array format for Recharts
    return Object.entries(monthlyData).map(([name, value]) => ({
      name,
      value
    }));
  };

  return {
    portfolioData,
    isLoading,
    refreshData: fetchPortfolioData
  };
};
