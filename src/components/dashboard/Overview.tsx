
import { Project } from "@/types/project";
import DashboardCards from "./overview/DashboardCards";
import ChartsSection from "./overview/ChartsSection";
import RecentProjects from "./RecentProjects";

interface OverviewProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function Overview({ userData, userInvestments, setActiveTab }: OverviewProps) {
  return (
    <div className="space-y-4">
      <DashboardCards userData={userData} />
      <ChartsSection setActiveTab={setActiveTab} />
      <RecentProjects userInvestments={userInvestments} setActiveTab={setActiveTab} />
    </div>
  );
}
