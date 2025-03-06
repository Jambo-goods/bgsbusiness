
import { useEffect, useState } from "react";
import WalletBalanceCard from "./cards/WalletBalanceCard";
import InvestmentTotalCard from "./cards/InvestmentTotalCard";
import ActiveProjectsCard from "./cards/ActiveProjectsCard";
import AverageYieldCard from "./cards/AverageYieldCard";
import { UserData } from "@/hooks/dashboard/types";

interface DashboardCardsProps {
  userData: UserData;
}

export default function DashboardCards({ userData }: DashboardCardsProps) {
  // Default values for cards
  const [cardData, setCardData] = useState({
    monthlyYield: 0,
    annualYield: 0,
    walletChange: { percentage: "0%", value: "0 €" },
    investmentChange: { percentage: "0%", value: "0 €" },
    projectsChange: { value: "0" },
    yieldChange: { value: "0%" }
  });
  
  useEffect(() => {
    // Calculate basic metrics based on userData
    const monthlyYieldRate = 0.01; // Example: 1% monthly yield
    const calculatedMonthlyYield = userData.investmentTotal * monthlyYieldRate;
    const calculatedAnnualYield = calculatedMonthlyYield * 12;
    
    setCardData({
      monthlyYield: calculatedMonthlyYield,
      annualYield: calculatedAnnualYield,
      walletChange: { 
        percentage: "5%", 
        value: `${Math.round(userData.walletBalance ? userData.walletBalance * 0.05 : 0)} €` 
      },
      investmentChange: { 
        percentage: "3%", 
        value: `${Math.round(userData.investmentTotal * 0.03)} €` 
      },
      projectsChange: { 
        value: "+1" 
      },
      yieldChange: { 
        value: "+0.2%" 
      }
    });
  }, [userData]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <WalletBalanceCard 
        walletBalance={userData.walletBalance || 0} 
        walletChange={cardData.walletChange} 
      />
      
      <InvestmentTotalCard 
        investmentTotal={userData.investmentTotal} 
        investmentChange={cardData.investmentChange} 
      />
      
      <ActiveProjectsCard 
        projectsCount={userData.projectsCount} 
        projectsChange={cardData.projectsChange} 
      />
      
      <AverageYieldCard 
        monthlyYield={cardData.monthlyYield} 
        annualYield={cardData.annualYield} 
        yieldChange={cardData.yieldChange} 
      />
    </div>
  );
}
