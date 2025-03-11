

import { useEffect, useState } from "react";
import { DashboardCardData, UserData } from "./types";

export const useDashboardCardsData = (userData: UserData | null): DashboardCardData => {
  const [dashboardData, setDashboardData] = useState<DashboardCardData>({
    monthlyYield: 0,
    annualYield: 0,
    walletChange: { percentage: "", value: "" },
    investmentChange: { percentage: "", value: "" },
    projectsChange: { value: "" },
    yieldChange: { value: "" }
  });

  useEffect(() => {
    if (!userData) return;

    // Calculate monthly and annual yield
    const monthlyYield = userData.investmentTotal > 0 ? 0 : 0;
    const annualYield = 0;

    setDashboardData({
      monthlyYield,
      annualYield,
      walletChange: { percentage: "", value: "" },
      investmentChange: { percentage: "", value: "" },
      projectsChange: { value: "" },
      yieldChange: { value: "" }
    });
  }, [userData]);

  return dashboardData;
};

