
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardLoading from "@/components/dashboard/DashboardLoading";

export default function Dashboard() {
  const { userData, userInvestments, isLoading, realTimeStatus, refreshData } = useDashboardData();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (!userData) {
    return <DashboardLoading />;
  }

  return (
    <DashboardLayout
      userData={userData}
      userInvestments={userInvestments}
      isLoading={isLoading}
      realTimeStatus={realTimeStatus}
      refreshData={refreshData}
    />
  );
}
