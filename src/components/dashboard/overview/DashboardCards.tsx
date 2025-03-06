
import { Banknote, TrendingUpIcon, WalletIcon, BarChart3Icon } from "lucide-react";
import DashboardCard from "../DashboardCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardCardsProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
    walletBalance?: number;
  };
}

export default function DashboardCards({ userData }: DashboardCardsProps) {
  const [monthlyYield, setMonthlyYield] = useState(1.125);
  const [walletChange, setWalletChange] = useState({ percentage: "+8.3%", value: "↑ 250€" });
  const [investmentChange, setInvestmentChange] = useState({ percentage: "+12.5%", value: "↑ 1250€" });
  const [projectsChange, setProjectsChange] = useState({ value: "+2" });
  const [yieldChange, setYieldChange] = useState({ value: "+0.1%" });
  
  // Calculate yearly yield for display
  const annualYield = monthlyYield * 12; // 13.5% per year
  
  useEffect(() => {
    fetchRecentChanges();
    
    // Set up realtime subscription for wallet transactions
    const walletChannel = supabase
      .channel('public:wallet_transactions')
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
      .channel('public:investments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        fetchRecentChanges();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(investmentsChannel);
    };
  }, []);
  
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
        .select('amount, type')
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
        .select('amount, project_id')
        .eq('user_id', userId)
        .gte('date', threeMonthsAgo.toISOString());
        
      if (investmentsData) {
        // Calculate new projects count in last 3 months
        const uniqueProjectsLastThreeMonths = new Set(investmentsData.map(inv => inv.project_id)).size;
        setProjectsChange({ value: `+${uniqueProjectsLastThreeMonths}` });
        
        // Calculate investment change in last month
        const lastMonthInvestments = investmentsData
          .filter(inv => new Date(inv.date) >= oneMonthAgo)
          .reduce((sum, inv) => sum + inv.amount, 0);
        
        if (userData.investmentTotal > 0) {
          const investPercentChange = Math.round((lastMonthInvestments / userData.investmentTotal) * 100);
          setInvestmentChange({
            percentage: `+${investPercentChange}%`,
            value: `↑ ${lastMonthInvestments}€`
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
        
        setMonthlyYield(avgMonthlyYield);
        
        // For simplicity, we'll set a small positive change in yield
        setYieldChange({ value: "+0.1%" });
      }
      
    } catch (error) {
      console.error("Error fetching dashboard card data:", error);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Solde disponible card */}
      <DashboardCard
        title="Solde disponible"
        value={`${userData.walletBalance?.toLocaleString() || "0"} €`}
        icon={<Banknote />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        changePercentage={walletChange.percentage}
        changeValue={walletChange.value}
        changeTimeframe="le dernier mois"
      />

      {/* Total investi card */}
      <DashboardCard
        title="Total investi"
        value={`${userData.investmentTotal.toLocaleString()} €`}
        icon={<WalletIcon />}
        iconBgColor="bg-blue-100"
        iconColor="text-bgs-blue"
        changePercentage={investmentChange.percentage}
        changeValue={investmentChange.value}
        changeTimeframe="le dernier mois"
      />

      {/* Projets actifs card */}
      <DashboardCard
        title="Projets actifs"
        value={userData.projectsCount}
        icon={<BarChart3Icon />}
        iconBgColor="bg-orange-100"
        iconColor="text-bgs-orange"
        changePercentage={projectsChange.value}
        changeValue={projectsChange.value}
        changeTimeframe="le dernier trimestre"
      />

      {/* Rendement moyen card */}
      <DashboardCard
        title="Rendement mensuel moyen"
        value={`${monthlyYield}%`}
        icon={<TrendingUpIcon />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        changePercentage={yieldChange.value}
        changeValue={yieldChange.value}
        changeTimeframe="le dernier mois"
        description={`${annualYield.toFixed(1)}% annualisé`}
      />
    </div>
  );
}
