
import { useDashboardCardData } from "@/hooks/useDashboardCardData";
import WalletBalanceCard from "./cards/WalletBalanceCard";
import InvestmentTotalCard from "./cards/InvestmentTotalCard";
import ActiveProjectsCard from "./cards/ActiveProjectsCard";
import AverageYieldCard from "./cards/AverageYieldCard";

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
  const {
    monthlyYield,
    annualYield,
    walletChange,
    investmentChange,
    projectsChange,
    yieldChange
  } = useDashboardCardData(userData);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <WalletBalanceCard 
        walletBalance={userData.walletBalance} 
        walletChange={walletChange} 
      />
      
      <InvestmentTotalCard 
        investmentTotal={userData.investmentTotal} 
        investmentChange={investmentChange} 
      />
      
      <ActiveProjectsCard 
        projectsCount={userData.projectsCount} 
        projectsChange={projectsChange} 
      />
      
      <AverageYieldCard 
        monthlyYield={monthlyYield} 
        annualYield={annualYield} 
        yieldChange={yieldChange} 
      />
    </div>
  );
}
