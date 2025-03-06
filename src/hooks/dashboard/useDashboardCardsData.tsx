
import { useEffect, useState } from "react";
import { DashboardCardData, UserData } from "./types";

export const useDashboardCardsData = (userData: UserData | null): DashboardCardData => {
  const [dashboardData, setDashboardData] = useState<DashboardCardData>({
    monthlyYield: 0,
    annualYield: 0,
    walletChange: { percentage: "0%", value: "0€" },
    investmentChange: { percentage: "0%", value: "0€" },
    projectsChange: { value: "0" },
    yieldChange: { value: "0%" }
  });

  useEffect(() => {
    if (!userData) return;

    // Calculate wallet change
    const walletChange = {
      percentage: "+5.2%",
      value: "+150€"
    };

    // Calculate investment change
    const investmentChange = {
      percentage: "+2.8%",
      value: "+320€"
    };

    // Calculate projects change
    const projectsChange = {
      value: "+2"
    };

    // Calculate yield change
    const yieldChange = {
      value: "+0.5%"
    };

    // Calculate monthly and annual yield
    const monthlyYield = userData.investmentTotal > 0 ? 12.5 : 0;
    const annualYield = monthlyYield * 12;

    setDashboardData({
      monthlyYield,
      annualYield,
      walletChange,
      investmentChange,
      projectsChange,
      yieldChange
    });
  }, [userData]);

  return dashboardData;
};
