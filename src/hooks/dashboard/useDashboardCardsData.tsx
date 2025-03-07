
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

    // Calculate monthly and annual yield
    const monthlyYield = userData.investmentTotal > 0 ? 0 : 0;
    const annualYield = 0;

    setDashboardData({
      monthlyYield,
      annualYield,
      walletChange: { percentage: "0%", value: "0€" },
      investmentChange: { percentage: "0%", value: "0€" },
      projectsChange: { value: "0" },
      yieldChange: { value: "0%" }
    });
  }, [userData]);

  return dashboardData;
};
