
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    
    // Set up real-time subscription for portfolio updates
    const portfolioChannel = supabase
      .channel('portfolio_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        console.log('Investment data changed, refreshing portfolio chart...');
        fetchPortfolioData();
      })
      .subscribe();
      
    // Set up real-time subscription for wallet transactions that could affect portfolio
    const walletChannel = supabase
      .channel('wallet_portfolio_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        console.log('Wallet transaction detected, refreshing portfolio chart...');
        fetchPortfolioData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(portfolioChannel);
      supabase.removeChannel(walletChannel);
    };
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log('No active session found for portfolio data');
        // Use placeholder data for unauthenticated users
        setPortfolioData(generatePlaceholderData());
        return;
      }
      
      // Get all investments for the user grouped by month
      const { data: investments, error } = await supabase
        .from('investments')
        .select('amount, date')
        .eq('user_id', session.session.user.id)
        .order('date', { ascending: true });
        
      if (error) {
        console.error("Error fetching investment data:", error);
        setPortfolioData(generatePlaceholderData());
        return;
      }
      
      if (!investments || investments.length === 0) {
        console.log('No investment data found, using placeholder data');
        setPortfolioData(generatePlaceholderData());
        return;
      }
      
      // Process data by month
      const aggregatedData = aggregateDataByMonth(investments);
      console.log('Updated portfolio data:', aggregatedData);
      setPortfolioData(aggregatedData);
    } catch (error) {
      console.error("Error in fetchPortfolioData:", error);
      setPortfolioData(generatePlaceholderData());
    } finally {
      setIsLoading(false);
    }
  };
  
  // Aggregate investment data by month
  const aggregateDataByMonth = (investments: any[]) => {
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
        
        // Use cumulative value to show portfolio growth
        cumulativeValue += investment.amount;
        monthlyData[monthName] = cumulativeValue;
      }
    });
    
    // Convert to array format for Recharts
    return Object.entries(monthlyData).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Generate placeholder data for development/preview
  const generatePlaceholderData = (): PortfolioDataPoint[] => {
    return [
      { name: 'Jan', value: 1500 },
      { name: 'Fév', value: 1800 },
      { name: 'Mar', value: 2000 },
      { name: 'Avr', value: 2400 },
      { name: 'Mai', value: 2200 },
      { name: 'Juin', value: 2800 },
      { name: 'Juil', value: 3000 },
      { name: 'Août', value: 3300 },
      { name: 'Sep', value: 3500 },
      { name: 'Oct', value: 3800 },
      { name: 'Nov', value: 4100 },
      { name: 'Déc', value: 4500 },
    ];
  };

  return {
    portfolioData,
    isLoading
  };
};
